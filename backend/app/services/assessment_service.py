from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.assessment import Assessment, AssessmentAnswer
from app.models.scale import Scale, Question
from app.models.baby import Baby
from app.algorithms.scoring import TestScoringAlgorithm, PCDI018ScoringAlgorithm, PCDI1830ScoringAlgorithm, ParentingStyleScoringAlgorithm
from app.algorithms.questionnaire_scoring import InteractionQualityScoringAlgorithm, LanguageEnvironmentScoringAlgorithm
from app.algorithms.suggestion import PersonalizedSuggestionAlgorithm
from typing import Dict, List

class AssessmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_scale_config(self, scale_id: str) -> Dict:
        result = await self.db.execute(
            select(Scale).where(Scale.scale_id == scale_id)
        )
        scale = result.scalar_one_or_none()
        
        if not scale:
            return None
        
        questions_result = await self.db.execute(
            select(Question).where(Question.scale_id == scale_id)
        )
        questions = questions_result.scalars().all()
        
        questions_dict = {}
        for q in questions:
            questions_dict[q.question_id] = {
                'question_id': q.question_id,
                'question': q.question,
                'options': q.options,
                'dimension': q.dimension,
                'score': q.weight,
                'time_limit': q.time_limit
            }
        
        return {
            'scale_id': scale.scale_id,
            'scale_name': scale.scale_name,
            'scale_type': scale.scale_type,
            'total_score': scale.total_questions * 2,
            'questions': questions_dict,
            'scoring_rules': scale.scoring_rules,
            'norm_data': scale.norm_data
        }
    
    async def get_user_profile(self, user_id: int) -> Dict:
        baby_result = await self.db.execute(
            select(Baby).where(Baby.user_id == user_id)
        )
        baby = baby_result.scalar_one_or_none()
        
        if not baby:
            return {'age_months': 18, 'gender': 'female'}
        
        return {
            'age_months': baby.age_months or 18,
            'name': baby.name,
            'gender': baby.gender or 'female'
        }
    
    async def create_assessment(
        self,
        user_id: int,
        baby_id: int,
        scale_id: str,
        age_group: str,
        score_result: Dict,
        suggestions: List[str],
        test_duration: int
    ) -> Assessment:
        assessment = Assessment(
            user_id=user_id,
            baby_id=baby_id,
            scale_id=scale_id,
            age_group=age_group,
            total_score=score_result.get('total_score', 0),
            max_score=score_result.get('max_score', 100),
            percent=score_result.get('percent', 0),
            level=score_result.get('level', '未知'),
            dimension_scores=score_result.get('dimension_scores', []),
            suggestions=suggestions,
            test_duration=test_duration
        )
        
        self.db.add(assessment)
        await self.db.commit()
        await self.db.refresh(assessment)
        
        return assessment
    
    async def get_user_assessments(self, user_id: int) -> List[Assessment]:
        result = await self.db.execute(
            select(Assessment)
            .where(Assessment.user_id == user_id)
            .order_by(Assessment.created_at.desc())
        )
        return result.scalars().all()
    
    async def get_assessment_by_id(self, assessment_id: int) -> Assessment:
        result = await self.db.execute(
            select(Assessment).where(Assessment.id == assessment_id)
        )
        return result.scalar_one_or_none()
    
    def calculate_score(
        self,
        scale_config: Dict,
        assessment_data: Dict
    ) -> Dict:
        """
        计算测评分数
        
        Args:
            scale_config: 量表配置
            assessment_data: 测评数据
            
        Returns:
            Dict: 评分结果
        """
        scale_id = scale_config.get('scale_id', '') if scale_config else assessment_data.get('scale_id', '')
        
        # 根据量表ID选择合适的评分算法
        if scale_id == 'PCDI_VOCAB_GESTURE_0_18':
            # 0-18月测评使用专门的评分算法
            algorithm = PCDI018ScoringAlgorithm()
            answers = assessment_data.get('answers', [])
            return algorithm.calculate_score(answers)
        elif scale_id == 'PCDI_VOCAB_SENTENCE_18_30':
            # 18-30月测评使用专门的评分算法
            algorithm = PCDI1830ScoringAlgorithm()
            answers = assessment_data.get('answers', [])
            return algorithm.calculate_score(answers)
        elif scale_id == 'PCDI_INTERACTION_QUALITY':
            # 亲子互动质量分析使用专门的评分算法
            algorithm = InteractionQualityScoringAlgorithm()
            answers = assessment_data.get('answers', [])
            return algorithm.calculate_score(answers)
        elif scale_id == 'PCDI_LANGUAGE_ENVIRONMENT':
            # 家庭语言环境分析使用专门的评分算法
            algorithm = LanguageEnvironmentScoringAlgorithm()
            answers = assessment_data.get('answers', [])
            return algorithm.calculate_score(answers)
        elif scale_id == 'PARENTING_STYLE':
            # 抚养方式测评使用专门的评分算法
            algorithm = ParentingStyleScoringAlgorithm()
            answers = assessment_data.get('answers', [])
            return algorithm.calculate_score(answers)
        else:
            # 使用标准评分算法
            if scale_config:
                standard_algorithm = TestScoringAlgorithm(scale_config)
            else:
                # 如果量表配置不存在，使用默认配置
                standard_algorithm = TestScoringAlgorithm({})
            answers = assessment_data.get('answers', [])
            return standard_algorithm.calculate_score(answers)
    
    def generate_suggestions(
        self,
        score_result: Dict,
        user_profile: Dict
    ) -> List[str]:
        """
        生成个性化建议
        
        Args:
            score_result: 评分结果
            user_profile: 用户画像
            
        Returns:
            List[str]: 建议列表
        """
        suggestion_algorithm = PersonalizedSuggestionAlgorithm()
        return suggestion_algorithm.generate_suggestions(score_result, user_profile)
    
    def determine_level(self, percent: float) -> str:
        """
        根据百分比确定等级
        
        Args:
            percent: 百分比
            
        Returns:
            str: 等级
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
