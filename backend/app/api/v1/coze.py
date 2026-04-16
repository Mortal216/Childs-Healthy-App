import json
import logging

from fastapi import APIRouter, HTTPException, status

from app.schemas.coze import CozeChatRequest, CozeChatResponse
from app.services.coze_service import send_coze_chat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/coze", tags=["Coze"])

_DEBUG_RAW_MAX_CHARS = 24_000


@router.post("/chat", response_model=CozeChatResponse)
async def coze_chat(body: CozeChatRequest):
    """
    转发 Coze 智能体对话（Token 仅在后端环境变量中配置）。
    """
    try:
        reply, raw = await send_coze_chat(
            body.user_input,
            conversation_id=body.conversation_id,
        )
        events = raw.get("events") if isinstance(raw, dict) else None
        n_events = len(events) if isinstance(events, list) else 0
        logger.info(
            "Coze /chat ok: events=%s reply_chars=%s",
            n_events,
            len(reply or ""),
        )
        if isinstance(events, list) and events and isinstance(events[0], dict):
            logger.info(
                "Coze first event keys: %s",
                list(events[0].keys())[:24],
            )
        try:
            raw_dump = json.dumps(raw, ensure_ascii=False, default=str)
        except (TypeError, ValueError):
            raw_dump = str(raw)
        if len(raw_dump) > _DEBUG_RAW_MAX_CHARS:
            raw_dump = raw_dump[:_DEBUG_RAW_MAX_CHARS] + "…(truncated)"
        logger.debug("Coze raw (for events inspection): %s", raw_dump)

        return CozeChatResponse(reply=reply, raw=raw)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        ) from e
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Coze 请求失败: {e!s}",
        ) from e
