from typing import Any, Optional

from pydantic import BaseModel, Field


class CozeChatRequest(BaseModel):
    user_input: str = Field(..., min_length=1, max_length=16000, description="用户输入")
    conversation_id: Optional[str] = Field(
        default=None,
        description="可选；传入时作为 stream_run 的 session_id，否则使用环境变量 COZE_SESSION_ID",
    )


class CozeChatResponse(BaseModel):
    reply: str = Field(..., description="从 SSE 事件中解析后的文本回复")
    raw: Any = Field(
        default=None,
        description="调试信息：含 events 列表（每条为解析后的 data JSON）",
    )
