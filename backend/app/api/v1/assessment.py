from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.schemas.assessment import (
    AssessmentSubmit, 
    AssessmentResponse, 
    AssessmentHistoryResponse
)
from app.services.assessment_service import AssessmentService
from app.models.scale import Scale, Question
from app.models.user import User
from app.models.baby import Baby

router = APIRouter(prefix="/assessment", tags=["测评"])

@router.get("/scales", response_model=List[dict])
async def get_scales(db: AsyncSession = Depends(get_db)):
    """获取所有量表列表"""
    result = await db.execute(select(Scale))
    scales = result.scalars().all()
    
    return [
        {
            "scale_id": scale.scale_id,
            "scale_name": scale.scale_name,
            "scale_type": scale.scale_type,
            "min_age": scale.min_age,
            "max_age": scale.max_age,
            "total_questions": scale.total_questions,
            "estimated_duration": scale.estimated_duration
        }
        for scale in scales
    ]

@router.get("/scales/{scale_id}/questions", response_model=List[dict])
async def get_scale_questions(
    scale_id: str,
    age_group: str,
    db: AsyncSession = Depends(get_db)
):
    """获取指定量表的题目"""
    result = await db.execute(
        select(Question).where(
            Question.scale_id == scale_id,
            Question.age_group == age_group
        )
    )
    questions = result.scalars().all()
    
    return [
        {
            "question_id": question.question_id,
            "question": question.question,
            "question_type": question.question_type,
            "options": question.options,
            "dimension": question.dimension,
            "time_limit": question.time_limit,
            "required": question.required
        }
        for question in questions
    ]

@router.post("/submit", response_model=AssessmentResponse)
async def submit_assessment(
    assessment_data: AssessmentSubmit,
    db: AsyncSession = Depends(get_db)
):
    """
    提交测评
    
    支持两种量表类型：
    1. 标准量表：使用answers字段
    2. PCDI量表：使用pcdi_type和pcdi_data字段
    """
    assessment_service = AssessmentService(db)
    
    # 检查并创建用户（如果不存在）
    result = await db.execute(
        select(User).where(User.id == assessment_data.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # 创建默认用户
        user = User(
            id=assessment_data.user_id,
            phone=f"user_{assessment_data.user_id}",
            password_hash="default_password"
        )
        db.add(user)
        await db.flush()
        print(f"创建默认用户: ID={user.id}")
    
    # 检查并创建宝宝（如果不存在）
    result = await db.execute(
        select(Baby).where(Baby.id == assessment_data.baby_id)
    )
    baby = result.scalar_one_or_none()
    
    if not baby:
        # 创建默认宝宝
        baby = Baby(
            id=assessment_data.baby_id,
            user_id=assessment_data.user_id,
            name=f"宝宝{assessment_data.baby_id}",
            age_months=assessment_data.age_months or 24,
            gender=assessment_data.gender or 'female',
            birth_date='2022-01-01'  # 默认出生日期
        )
        db.add(baby)
        await db.flush()
        print(f"创建默认宝宝: ID={baby.id}")
    
    scale_config = await assessment_service.get_scale_config(assessment_data.scale_id)
    # 即使量表不存在，也继续处理，使用默认评分算法
    
    score_result = assessment_service.calculate_score(scale_config, assessment_data.dict())
    
    if score_result.get('status') == 'error':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=score_result.get('message', '评分失败')
        )
    
    user_profile = await assessment_service.get_user_profile(assessment_data.user_id)
    
    suggestions = assessment_service.generate_suggestions(score_result, user_profile)
    
    level = score_result.get('level') or assessment_service.determine_level(score_result.get('percent', 0))
    
    final_score_result = {
        'total_score': score_result.get('total_score', 0),
        'max_score': score_result.get('max_score', 100),
        'percent': score_result.get('percent', 0),
        'level': level,
        'dimension_scores': score_result.get('dimension_scores', score_result.get('sub_scores', {})),
        'percentile': score_result.get('percentile'),
        'special_note': score_result.get('special_note')
    }
    
    assessment = await assessment_service.create_assessment(
        user_id=assessment_data.user_id,
        baby_id=assessment_data.baby_id,
        scale_id=assessment_data.scale_id,
        age_group=assessment_data.age_group,
        score_result=final_score_result,
        suggestions=suggestions,
        test_duration=assessment_data.test_duration
    )
    
    scale_name = scale_config.get('scale_name', '') if scale_config else assessment_data.scale_id
    
    return AssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        baby_id=assessment.baby_id,
        scale_id=assessment.scale_id,
        scale_name=scale_name,
        age_group=assessment.age_group,
        total_score=final_score_result['total_score'],
        max_score=final_score_result['max_score'],
        percent=final_score_result['percent'],
        level=final_score_result['level'],
        dimension_scores=_convert_dimension_scores(final_score_result['dimension_scores']),
        percentile=final_score_result['percentile'],
        special_note=final_score_result['special_note'],
        suggestions=suggestions,
        test_duration=assessment.test_duration,
        created_at=assessment.created_at
    )

@router.get("/history/{user_id}", response_model=List[AssessmentHistoryResponse])
async def get_assessment_history(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    assessment_service = AssessmentService(db)
    assessments = await assessment_service.get_user_assessments(user_id)
    
    history = []
    for assessment in assessments:
        history.append({
            'id': assessment.id,
            'scale_id': assessment.scale_id,
            'scale_name': assessment.scale_id,
            'total_score': assessment.total_score,
            'level': assessment.level,
            'percentile': None,
            'created_at': assessment.created_at
        })
    
    return history

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment_detail(
    assessment_id: int,
    db: AsyncSession = Depends(get_db)
):
    assessment_service = AssessmentService(db)
    assessment = await assessment_service.get_assessment_by_id(assessment_id)
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="测评记录不存在"
        )
    
    dimension_scores = _convert_dimension_scores(assessment.dimension_scores)
    
    return AssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        baby_id=assessment.baby_id,
        scale_id=assessment.scale_id,
        scale_name=assessment.scale_id,
        age_group=assessment.age_group,
        total_score=assessment.total_score,
        max_score=assessment.max_score,
        percent=assessment.percent,
        level=assessment.level,
        dimension_scores=dimension_scores,
        percentile=None,
        special_note=None,
        suggestions=assessment.suggestions,
        test_duration=assessment.test_duration,
        created_at=assessment.created_at
    )

def _convert_dimension_scores(dimension_scores: dict) -> List:
    """
    转换维度得分为标准格式
    
    Args:
        dimension_scores: 维度得分字典
        
    Returns:
        List: 维度得分列表
    """
    result = []
    
    if isinstance(dimension_scores, list):
        for item in dimension_scores:
            if not isinstance(item, dict):
                continue

            score = item.get('score', item.get('total', 0))
            max_score = item.get('max_score', item.get('maxScore', 100))
            percent = item.get('percent')
            if percent is None:
                percent = (score / max_score) * 100 if max_score else 0

            result.append({
                'dimension': item.get('dimension', ''),
                'score': score,
                'max_score': max_score,
                'percent': round(percent, 2),
                'level': item.get('level') or _determine_level(percent)
            })
    elif isinstance(dimension_scores, dict):
        for dimension, scores in dimension_scores.items():
            if isinstance(scores, dict):
                total = scores.get('total', 0)
                max_score = scores.get('max_score', 100)
                percent = (total / max_score) * 100 if max_score > 0 else 0
                level = _determine_level(percent)
                
                result.append({
                    'dimension': dimension,
                    'score': total,
                    'max_score': max_score,
                    'percent': round(percent, 2),
                    'level': level
                })
            else:
                result.append({
                    'dimension': dimension,
                    'score': scores,
                    'max_score': 100,
                    'percent': scores,
                    'level': _determine_level(scores)
                })
    
    return result

def _determine_level(percent: float) -> str:
    """
    根据百分比确定等级
    """
    if percent >= 90:
        return '优秀'
    elif percent >= 80:
        return '良好'
    elif percent >= 70:
        return '中等'
    elif percent >= 60:
        return '及格'
    else:
        return '需关注'
