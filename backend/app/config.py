from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "咿呀智库"
    app_version: str = "1.0.0"
    debug: bool = True
    
    database_url: str = "mysql+aiomysql://root:password@localhost:3306/yiya_db"
    use_cloudbase: bool = False
    
    cloudbase_env: str = "cloud1-1gu5xrfwd5ca8920"
    cloudbase_api_key: str = ""
    
    redis_url: str = "redis://localhost:6379/0"
    
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30 * 24 * 7
    
    baidu_app_id: str = ""
    baidu_api_key: str = ""
    baidu_secret_key: str = ""
    
    llm_api_key: str = ""
    llm_model: str = "gpt-4"
    
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"

    # Coze 智能体 stream_run（仅服务端使用，勿提交真实 token）
    coze_api_token: str = ""
    coze_base_url: str = ""
    coze_project_id: str = ""
    coze_session_id: str = ""

    milvus_host: str = "localhost"
    milvus_port: int = 19530
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()