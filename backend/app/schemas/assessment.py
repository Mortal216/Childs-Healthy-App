from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class AnswerSubmit(BaseModel):
    question_id: str = Field(..., description="题目ID")
    selected_option: Union[str, int] = Field(..., description="选择的选项")

class PCDIEarlyLanguageData(BaseModel):
    language_understanding: List[int] = Field(..., description="叫名字/对'别'反应/找爸妈")
    understand_phrases: List[int] = Field(..., description="27个短语听懂情况")
    start_speaking: List[int] = Field(..., description="模仿/指物发声/用'要'表达/称名")
    vocab: Dict[str, int] = Field(..., description="词汇数据")

class PCDIGestureData(BaseModel):
    early_gesture: List[int] = Field(..., description="11个初期手势")
    game_routine: List[int] = Field(..., description="5个游戏常规")
    interactive_action: List[int] = Field(..., description="15个互动动作")
    pretend_play: List[int] = Field(..., description="5个假扮游戏")
    imitate_adult: List[int] = Field(..., description="7个模仿成人动作")

class PCDIVocabGestureData(BaseModel):
    early_language: PCDIEarlyLanguageData
    gesture: PCDIGestureData
    is_bilingual: Optional[bool] = Field(False, description="是否双语环境")
    unfinished_items: Optional[int] = Field(0, description="未完成项目数")

class PCDIVocabToSentenceData(BaseModel):
    use_vocab: List[int] = Field(..., description="5个词汇使用问题")
    sentence_phrase: List[int] = Field(..., description="4个句子短语问题")
    word_combination: Dict[str, Any] = Field(..., description="组词数据")
    sentence_complexity: List[int] = Field(..., description="27个句子复杂性条目")

class PCDIVocabSentenceData(BaseModel):
    vocab_spoken: int = Field(..., description="会说的词汇总数")
    vocab_to_sentence: PCDIVocabToSentenceData
    is_bilingual: Optional[bool] = Field(False, description="是否双语环境")
    unfinished_items: Optional[int] = Field(0, description="未完成项目数")

class PCDIShortFormData(BaseModel):
    understand_phrases: List[int] = Field(..., description="短语听懂情况")
    vocab_understood: int = Field(..., description="听懂的词汇数")
    vocab_spoken: int = Field(..., description="会说的词汇数")
    grammar_items: Optional[List[int]] = Field(None, description="语法条目")

class AssessmentSubmit(BaseModel):
    user_id: int = Field(..., description="用户ID")
    baby_id: int = Field(..., description="宝宝ID")
    scale_id: str = Field(..., description="量表ID")
    age_group: str = Field(..., description="年龄组")
    age_months: int = Field(..., description="儿童月龄")
    gender: str = Field(..., description="性别")
    answers: Optional[List[AnswerSubmit]] = Field(None, description="答案列表")
    test_duration: int = Field(..., description="测试时长（秒）")
    
    pcdi_type: Optional[str] = Field(None, description="PCDI量表类型：vocab_gesture/vocab_sentence/short_form")
    pcdi_data: Optional[Dict] = Field(None, description="PCDI量表原始数据")

class DimensionScore(BaseModel):
    dimension: str = Field(..., description="维度名称")
    score: float = Field(..., description="得分")
    max_score: float = Field(..., description="满分")
    percent: float = Field(..., description="百分比")
    level: str = Field(..., description="等级")
    percentile: Optional[int] = Field(None, description="百分位")

class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    baby_id: int
    scale_id: str
    scale_name: str
    age_group: str
    total_score: float
    max_score: float
    percent: float
    level: str
    dimension_scores: List[DimensionScore]
    percentile: Optional[int] = None
    special_note: Optional[str] = None
    suggestions: List[str]
    test_duration: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AssessmentHistoryResponse(BaseModel):
    id: int
    scale_id: str
    scale_name: str
    total_score: float
    level: str
    percentile: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True