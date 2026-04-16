from typing import List, Dict

class PersonalizedSuggestionAlgorithm:
    def __init__(self):
        self.suggestion_templates = self._load_templates()
    
    def generate_suggestions(self, assessment_result: Dict, user_profile: Dict) -> List[str]:
        suggestions = []
        
        dimension_scores = assessment_result.get('dimension_scores', [])
        
        for dim_score in dimension_scores:
            # 添加类型检查，确保dim_score是字典类型
            if isinstance(dim_score, dict):
                dimension = dim_score.get('dimension')
                level = dim_score.get('level')
                
                if dimension and level:
                    suggestion = self._generate_dimension_suggestion(dimension, level)
                    if suggestion:
                        suggestions.append(suggestion)
        
        user_suggestions = self._generate_user_suggestions(user_profile)
        suggestions.extend(user_suggestions)
        
        return suggestions
    
    def _generate_dimension_suggestion(self, dimension: str, level: str) -> str:
        templates = self.suggestion_templates.get(dimension, {}).get(level, [])
        if templates:
            return templates[0] if isinstance(templates, list) else templates
        return None
    
    def _generate_user_suggestions(self, user_profile: Dict) -> List[str]:
        suggestions = []
        age_months = user_profile.get('age_months', 0)
        
        if age_months < 12:
            suggestions.append("建议多进行亲子互动，促进语言发展")
        elif age_months < 24:
            suggestions.append("可以开始进行简单的词汇训练")
        else:
            suggestions.append("可以进行更复杂的对话练习")
        
        return suggestions
    
    def _load_templates(self) -> Dict:
        return {
            '词汇理解': {
                '优秀': '继续保持良好的词汇理解能力，可以尝试学习更多新词汇',
                '良好': '每日亲子对话：每天15分钟，多提问引导宝宝回应',
                '中等': '建议增加词汇输入，多读绘本、讲故事',
                '需关注': '建议寻求专业帮助，进行语言干预'
            },
            '语言表达': {
                '优秀': '继续保持良好的语言表达能力，可以尝试更复杂的对话',
                '良好': '每天提问3-5个开放式问题，鼓励宝宝完整表达需求',
                '中等': '多给宝宝说话的机会，耐心引导',
                '需关注': '建议咨询语言治疗师'
            },
            '社交沟通': {
                '优秀': '宝宝的社交能力发展很好，可以尝试更多社交活动',
                '良好': '多创造社交机会，鼓励宝宝与他人互动',
                '中等': '可以通过游戏和互动提升社交能力',
                '需关注': '建议寻求专业指导'
            },
            '抚养方式': {
                '优秀': '您的抚养方式非常科学，继续保持',
                '良好': '建议适当增加独立探索的机会',
                '中等': '可以尝试更民主的沟通方式',
                '需关注': '建议学习科学的育儿方法'
            }
        }