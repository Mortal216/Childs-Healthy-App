"""
大模型接口模块
用于处理与DeepSeek等大模型的交互
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import requests
import json
from app.config import settings

router = APIRouter(prefix="/llm", tags=["大模型"])

class LLMRequest(BaseModel):
    """大模型请求参数"""
    prompt: str
    model: str = "deepseek-chat"
    temperature: float = 0.7
    max_tokens: int = 500

class LLMResponse(BaseModel):
    """大模型响应参数"""
    response: str
    model: str
    tokens: dict

class SceneRequest(BaseModel):
    """场景对话请求参数"""
    scene: str
    dialogue_history: list
    parent_response: str

class SceneResponse(BaseModel):
    """场景对话响应参数"""
    child_response: str
    analysis: str

class AgentRequest(BaseModel):
    """AI智能体请求参数"""
    message: str
    chat_history: list
    user_info: dict = {}

class AgentResponse(BaseModel):
    """AI智能体响应参数"""
    response: str
    confidence: float
    suggestions: list

def call_deepseek_api(prompt: str, model: str = "deepseek-chat", temperature: float = 0.7, max_tokens: int = 500) -> dict:
    """
    调用DeepSeek API
    
    Args:
        prompt: 提示词
        model: 模型名称
        temperature: 温度参数
        max_tokens: 最大 tokens
    
    Returns:
        模型响应
    """
    try:
        api_key = settings.deepseek_api_key
        if not api_key:
            raise HTTPException(status_code=400, detail="DeepSeek API key not configured")
        
        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        data = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个专业的育儿顾问，专注于0-30个月婴幼儿的养育问题。请提供专业、温和、实用的建议。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"DeepSeek API error: {str(e)}")

@router.post("/chat", response_model=LLMResponse)
async def chat_with_llm(request: LLMRequest):
    """
    与大模型对话
    """
    result = call_deepseek_api(
        prompt=request.prompt,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    response_text = result["choices"][0]["message"]["content"]
    tokens = {
        "prompt": result["usage"]["prompt_tokens"],
        "completion": result["usage"]["completion_tokens"],
        "total": result["usage"]["total_tokens"]
    }
    
    return LLMResponse(
        response=response_text,
        model=request.model,
        tokens=tokens
    )

@router.post("/scene", response_model=SceneResponse)
async def scene_dialogue(request: SceneRequest):
    """
    场景对话生成
    """
    # 构建提示词
    prompt = f"""
    你现在需要模拟一个{request.scene}的场景，扮演一个0-30个月的孩子。
    
    对话历史：
    {json.dumps(request.dialogue_history, ensure_ascii=False)}
    
    家长刚刚说了：{request.parent_response}
    
    请生成：
    1. 孩子的回应（要符合年龄段特点，语言简单，符合场景）
    2. 对家长回应的简短分析
    
    格式要求：
    孩子回应：[孩子说的话]
    分析：[对家长回应的分析]
    """
    
    result = call_deepseek_api(prompt=prompt, max_tokens=300)
    response_text = result["choices"][0]["message"]["content"]
    
    # 解析响应
    lines = response_text.strip().split('\n')
    child_response = ""
    analysis = ""
    
    for line in lines:
        if line.startswith("孩子回应："):
            child_response = line.replace("孩子回应：", "").strip()
        elif line.startswith("分析："):
            analysis = line.replace("分析：", "").strip()
    
    if not child_response:
        child_response = "嗯..."
    if not analysis:
        analysis = "家长的回应很有耐心，继续保持。"
    
    return SceneResponse(
        child_response=child_response,
        analysis=analysis
    )

@router.post("/agent", response_model=AgentResponse)
async def agent_dialogue(request: AgentRequest):
    """
    AI智能体对话
    """
    # 构建提示词
    chat_history_str = "\n".join([f"{'用户' if msg['role'] == 'user' else 'AI'}: {msg['content']}" for msg in request.chat_history])
    
    prompt = f"""
    你是咿呀智库的AI智能助手，专注于0-30个月婴幼儿的养育咨询。
    
    聊天历史：
    {chat_history_str}
    
    用户现在的问题：{request.message}
    
    请提供：
    1. 专业、温和、实用的回答
    2. 对回答的自信度评分（0-1之间）
    3. 3条简短的建议
    
    格式要求：
    回答：[你的回答]
    自信度：[0-1之间的数字]
    建议：
    1. [建议1]
    2. [建议2]
    3. [建议3]
    """
    
    result = call_deepseek_api(prompt=prompt, max_tokens=500)
    response_text = result["choices"][0]["message"]["content"]
    
    # 解析响应
    lines = response_text.strip().split('\n')
    response = ""
    confidence = 0.8
    suggestions = []
    
    in_suggestions = False
    for line in lines:
        if line.startswith("回答："):
            response = line.replace("回答：", "").strip()
        elif line.startswith("自信度："):
            try:
                confidence = float(line.replace("自信度：", "").strip())
            except:
                confidence = 0.8
        elif line.startswith("建议："):
            in_suggestions = True
        elif in_suggestions and (line.startswith("1.") or line.startswith("2.") or line.startswith("3.")):
            suggestions.append(line.split('.', 1)[1].strip())
    
    if not response:
        response = "感谢您的咨询。作为咿呀智库的AI助手，我专注于0-30个月婴幼儿的养育问题。请问有什么可以帮助您的吗？"
    if len(suggestions) < 3:
        suggestions.extend(["多与孩子进行面对面的交流", "保持耐心，给孩子足够的成长时间", "创造丰富的语言环境"])[:3]
    
    return AgentResponse(
        response=response,
        confidence=confidence,
        suggestions=suggestions
    )
