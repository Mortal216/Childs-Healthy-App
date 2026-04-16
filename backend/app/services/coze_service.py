"""
Coze stream_run（SSE / text/event-stream）转发。
仅使用 COZE_BASE_URL + COZE_PROJECT_ID + COZE_SESSION_ID + COZE_API_TOKEN，不再使用 OpenAPI bot_id 方案。
"""
from __future__ import annotations

import json
import re
from typing import Any, List, Optional, Tuple

import httpx

from app.config import settings

# 标准 UUID，避免误当作自然语言回复
_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)

def _is_plausible_user_visible_text(s: str) -> bool:
    """排除 UUID、长数字 id、纯十六进制串等，避免把元数据当成回复。"""
    t = (s or "").strip()
    if not t:
        return False
    if _UUID_RE.fullmatch(t):
        return False
    # 长纯数字，多为 snowflake / 业务 id
    if t.isdigit() and len(t) >= 12:
        return False
    # 短纯数字：月龄、个数、秒数等，必须保留（勿与下方 hex 规则混用，否则流式拆分时数字会整段丢失）
    if t.isdigit():
        return True
    # 数字与连字符（如 10-20、3–5）
    if re.fullmatch(r"[0-9\-–]+", t) and re.search(r"\d", t):
        return True
    # 短串且仅含 hex 字符并含字母 a-f，多为 id（纯数字已在上文返回 True）
    if len(t) <= 64 and re.fullmatch(r"[0-9a-fA-F\-]+", t, re.IGNORECASE):
        if re.search(r"[a-fA-F]", t):
            return False
    return True


def _leaf_to_visible_text(val: Any) -> str:
    """
    只接受字符串正文。JSON 里的 int/float 在 Coze 流里多为 token 序号，
    拼进正文会出现「2我3非常」；月龄等应出现在字符串里（如「16个月」）。
    """
    if val is None or isinstance(val, bool):
        return ""
    if isinstance(val, str):
        c = val.strip()
        if c and _is_plausible_user_visible_text(c):
            return c
        return ""
    return ""


# stream_run 里事件类型名 + 业务后缀被拼进正文时产生的杂质（如 message_startyiya_app_user）
_COZE_STREAM_ARTIFACT_RE = re.compile(
    r"[a-z][a-z0-9_]{0,80}yiya_app_user",
    re.IGNORECASE,
)

# 深扫 dict 时这些键下的字符串是协议元数据，勿当正文（如 _sse_event: "message"）
_DEEP_COLLECT_SKIP_STRING_KEYS = frozenset(
    {
        "_sse_event",
        "type",
        "log_id",
        "session_id",
        "reply_id",
        "msg_id",
        "query_msg_id",
        "local_msg_id",
        "execute_id",
        "role",
        "name",
        "event",
    }
)


# 需保留的「内容向」数字（月龄、时长、约数等），再去序号时先 shield
_COZE_PROTECT_DATA_NUM = re.compile(
    r"约\s*\d{1,4}(?:个月|岁|周|天)"
    r"|\d{1,4}[\-–]\d{1,4}(?:秒|分钟|小时|个月|岁|周|天)?"
    r"|\d{1,4}(?:个月|岁|周|天|秒|分钟|小时|周龄|日龄)"
    r"|\d{1,4}个(?:月|词|字)?"
    r"|\d+个(?:有意义的)?词",
    re.UNICODE,
)


def _looks_like_index_spam(s: str) -> bool:
    """仅当整段明显是「汉字夹 token 序号」时才做激进去数字，避免误伤月龄/秒数。"""
    if not s:
        return False
    return (
        len(re.findall(r"[\u4e00-\u9fff]\d{1,4}(?=[\u4e00-\u9fff])", s)) >= 5
    )


def _strip_stream_index_and_list_noise(s: str) -> str:
    """
    行首列表序号始终清理；汉字间夹数字仅在疑似索引刷屏时清理。
    """
    if not s:
        return ""
    vault: List[str] = []

    def shield(m: re.Match[str]) -> str:
        vault.append(m.group(0))
        return f"⟦YH{len(vault) - 1}⟧"

    t = _COZE_PROTECT_DATA_NUM.sub(shield, s)

    # 行首阿拉伯序号 1. 2、
    t = re.sub(r"(?:^|\n)[ \t]*\d{1,3}[\.\．、)]\s+", "\n", t)
    # 行首中文序号 一、二、
    t = re.sub(r"(?:^|\n)[ \t]*[一二三四五六七八九十百]+[、．.]\s*", "\n", t)

    if _looks_like_index_spam(t):
        cjk = r"\u4e00-\u9fff\u3000-\u303f\uff00-\uffef"
        opener = rf"(?:^|\n|(?<=[{cjk}\u27e7\]\)］、，。；：\s]))"
        t = re.sub(rf"{opener}\d{{1,4}}(?=[{cjk}])", "", t)

    for i, v in enumerate(vault):
        t = t.replace(f"⟦YH{i}⟧", v)

    t = re.sub(r"\n{3,}", "\n\n", t)
    return t


def _strip_coze_protocol_word_leaks(s: str) -> str:
    """去掉误入正文的 SSE event 名等（如 message、message-message、message1）。"""
    if not s:
        return ""
    t = re.sub(r"(?i)message(?:-message)+", " ", s)
    t = re.sub(r"(?<![A-Za-z])message\d+", "", t)
    t = re.sub(r"(?<![A-Za-z])message(?![A-Za-z0-9_-])", "", t)
    t = re.sub(r"[ \t\f\v]{2,}", " ", t)
    return t


def _sanitize_coze_display_text(s: str) -> str:
    """去掉流式协议混入的标记，便于用户阅读。"""
    if not s:
        return ""
    t = _COZE_STREAM_ARTIFACT_RE.sub("", s)
    t = re.sub(r"(?i)yiya_app_user", "", t)
    t = _strip_coze_protocol_word_leaks(t)
    t = _strip_stream_index_and_list_noise(t)
    # 文内「；- xxx」式伪列表拆行，便于前端 rich-text
    t = re.sub(r"([。；])\s*-\s+", r"\1\n- ", t)
    t = re.sub(r"[ \t\f\v]{2,}", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def _deep_collect_texts(
    obj: Any,
    depth: int = 0,
    max_depth: int = 12,
    max_strings: int = 2048,
) -> List[str]:
    """
    按深度优先顺序收集所有「像用户可见正文」的字符串，用于 stream_run 字段与文档不一致时的兜底。
    max_strings 需足够大：流式可能产生大量单字片段（仅收集字符串叶子）。
    """
    out: List[str] = []

    def walk(x: Any, d: int) -> None:
        if len(out) >= max_strings or d > max_depth:
            return
        if isinstance(x, dict):
            for k, v in x.items():
                ks = str(k) if k is not None else ""
                if ks in _DEEP_COLLECT_SKIP_STRING_KEYS and not isinstance(
                    v, (dict, list)
                ):
                    continue
                walk(v, d + 1)
            return
        if isinstance(x, list):
            for item in x:
                walk(item, d + 1)
            return
        frag = _leaf_to_visible_text(x)
        if frag:
            out.append(frag)

    walk(obj, depth)
    return out


def _append_chunk(chunks: List[str], piece: str) -> None:
    if not piece:
        return
    if chunks and chunks[-1] == piece:
        return
    chunks.append(piece)


def _append_str_chunk(chunks: List[str], raw: Any) -> None:
    if not isinstance(raw, str):
        return
    c = _leaf_to_visible_text(raw)
    if c:
        _append_chunk(chunks, c)


def _append_answer_field(chunks: List[str], raw: Any) -> None:
    """Coze stream_run：正文在 content.answer，可能为 str 或未引号数字。"""
    if raw is None or isinstance(raw, bool):
        return
    if isinstance(raw, str):
        _append_str_chunk(chunks, raw)
    elif isinstance(raw, (int, float)):
        _append_scalar_content(chunks, raw)


def _append_scalar_content(chunks: List[str], raw: Any) -> None:
    """
    顶层 content 在 JSON 里可能是未加引号的数字（如 13），与「个月」分片拼接；
    仅在此类「正文槽位」接纳 int/float，避免全树深扫把 token 序号拼进来。
    """
    if isinstance(raw, str):
        _append_str_chunk(chunks, raw)
        return
    if isinstance(raw, bool):
        return
    if isinstance(raw, int):
        s = str(raw)
        if _is_plausible_user_visible_text(s):
            _append_chunk(chunks, s)
        return
    if isinstance(raw, float):
        if raw != raw or raw in (float("inf"), float("-inf")):
            return
        if raw == int(raw) and abs(raw) <= 1e15:
            s = str(int(raw))
        else:
            s = str(raw).strip()
        if s and _is_plausible_user_visible_text(s):
            _append_chunk(chunks, s)


def _chunks_from_event_obj(ev: dict, _depth: int = 0) -> List[str]:
    """单条 SSE JSON：按固定路径顺序收集文本块，再顺序拼接（替代「首字段即 return」的旧逻辑）。"""
    if _depth > 10:
        return []
    if ev.get("_parse_error"):
        return []

    chunks: List[str] = []
    content = ev.get("content")

    if isinstance(content, list):
        for item in content:
            if not isinstance(item, dict):
                continue
            _append_str_chunk(chunks, item.get("text"))
            inner = item.get("content")
            if isinstance(inner, dict):
                _append_str_chunk(chunks, inner.get("text"))
                _append_answer_field(chunks, inner.get("answer"))
            elif inner is not None:
                _append_scalar_content(chunks, inner)
    elif isinstance(content, dict):
        # Coze：type=answer 时正文在 content.answer 分片，不是 content.text
        _append_answer_field(chunks, content.get("answer"))
        _append_str_chunk(chunks, content.get("text"))
    elif content is not None:
        _append_scalar_content(chunks, content)

    for k in ("text", "answer"):
        _append_str_chunk(chunks, ev.get(k))

    delta = ev.get("delta")
    if isinstance(delta, dict):
        for k in ("content", "text", "reasoning_content"):
            _append_str_chunk(chunks, delta.get(k))
        _append_answer_field(chunks, delta.get("answer"))

    msg = ev.get("message")
    if isinstance(msg, dict):
        mc = msg.get("content")
        if isinstance(mc, str):
            _append_str_chunk(chunks, mc)
        elif isinstance(mc, dict):
            _append_answer_field(chunks, mc.get("answer"))
            _append_str_chunk(chunks, mc.get("text"))

    data = ev.get("data")
    if isinstance(data, str):
        _append_str_chunk(chunks, data)
    elif isinstance(data, dict):
        for k in ("content", "text", "output"):
            _append_str_chunk(chunks, data.get(k))
        _append_answer_field(chunks, data.get("answer"))

    choices = ev.get("choices")
    if isinstance(choices, list) and choices:
        ch0 = choices[0]
        if isinstance(ch0, dict):
            for block in (ch0.get("delta"), ch0.get("message")):
                if isinstance(block, dict):
                    for k in ("content", "text"):
                        _append_str_chunk(chunks, block.get(k))

    for k in ("output", "result", "reply", "response"):
        _append_str_chunk(chunks, ev.get(k))

    if not chunks:
        nested: List[str] = []
        for wrap in ("event", "payload", "body", "detail"):
            inner = ev.get(wrap)
            if isinstance(inner, dict):
                nested.extend(_chunks_from_event_obj(inner, _depth + 1))
        if nested:
            return nested
        scanned = _deep_collect_texts(ev)
        if scanned:
            return scanned

    return chunks


def _chunks_from_event(ev: Any) -> List[str]:
    if isinstance(ev, dict):
        return _chunks_from_event_obj(ev)
    if isinstance(ev, list):
        acc: List[str] = []
        for x in ev:
            acc.extend(_chunks_from_event(x))
        return acc
    return []


def _extract_reply_from_stream_events(events: List[Any]) -> str:
    parts: List[str] = []
    for ev in events:
        parts.extend(_chunks_from_event(ev))

    merged = "".join(parts).strip()
    if merged and _is_plausible_user_visible_text(merged):
        cleaned = _sanitize_coze_display_text(merged)
        return cleaned if cleaned else merged
    return "AI暂无有效回复"


async def send_coze_chat(
    user_input: str, conversation_id: Optional[str] = None
) -> Tuple[str, Any]:
    token = (settings.coze_api_token or "").strip()
    if not token:
        raise ValueError("COZE_API_TOKEN 未配置")

    base = (settings.coze_base_url or "").strip().rstrip("/")
    if not base:
        raise ValueError("COZE_BASE_URL 未配置")

    project_id = (settings.coze_project_id or "").strip()
    if not project_id:
        raise ValueError("COZE_PROJECT_ID 未配置")

    session_default = (settings.coze_session_id or "").strip()
    session_id = (conversation_id or "").strip() or session_default
    if not session_id:
        raise ValueError("COZE_SESSION_ID 未配置，且请求未传 conversation_id")

    url = f"{base}/stream_run"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    payload: dict = {
        "content": {
            "query": {
                "prompt": [
                    {
                        "type": "text",
                        "content": {
                            "text": user_input,
                        },
                    }
                ]
            }
        },
        "type": "query",
        "session_id": session_id,
        "project_id": project_id,
    }

    timeout = httpx.Timeout(120.0, connect=15.0)
    events: List[Any] = []
    last_sse_event: str = ""

    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", url, json=payload, headers=headers) as response:
            if response.status_code >= 400:
                err_bytes = await response.aread()
                err_text = err_bytes.decode("utf-8", errors="replace")[:8000]
                raise RuntimeError(f"Coze HTTP {response.status_code}: {err_text}")

            async for line in response.aiter_lines():
                if line is None:
                    continue
                line_stripped = line.strip()
                if not line_stripped or line_stripped.startswith(":"):
                    continue
                if line_stripped.startswith("event:"):
                    last_sse_event = line_stripped[6:].strip()
                    continue
                if not line_stripped.startswith("data:"):
                    continue
                data_str = line_stripped[5:].strip()
                if not data_str or data_str == "[DONE]":
                    continue
                try:
                    obj = json.loads(data_str)
                except json.JSONDecodeError:
                    # 少数实现直接推送纯文本片段
                    plain = data_str.strip()
                    if plain and _is_plausible_user_visible_text(plain) and len(plain) >= 2:
                        row: dict = {"content": plain}
                        if last_sse_event:
                            row["_sse_event"] = last_sse_event
                        events.append(row)
                    else:
                        events.append({"_parse_error": True, "_raw": data_str[:2000]})
                    continue
                if isinstance(obj, dict) and last_sse_event:
                    obj["_sse_event"] = last_sse_event
                events.append(obj)

    reply = _extract_reply_from_stream_events(events)
    raw: Any = {"events": events, "stream": True}
    return reply, raw
