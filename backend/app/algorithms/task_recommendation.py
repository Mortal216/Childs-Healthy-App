from typing import List, Dict
import random

class TaskRecommendationAlgorithm:
    def __init__(self):
        self.difficulty_weights = {
            'easy': 1.0,
            'medium': 1.2,
            'hard': 1.5
        }
    
    def recommend_tasks(
        self, 
        assessment_result: Dict, 
        user_profile: Dict,
        all_tasks: List[Dict],
        count: int = 5
    ) -> List[Dict]:
        """
        推荐干预任务
        
        Args:
            assessment_result: 测评结果
            user_profile: 用户画像
            all_tasks: 所有任务列表
            count: 推荐数量
            
        Returns:
            List[Dict]: 推荐的任务列表
        """
        scored_tasks = []
        
        for task in all_tasks:
            score = self._calculate_task_score(task, assessment_result, user_profile)
            if score > 0:
                scored_tasks.append({
                    'task': task,
                    'score': score
                })
        
        scored_tasks.sort(key=lambda x: x['score'], reverse=True)
        
        recommendations = [item['task'] for item in scored_tasks[:count]]
        
        return recommendations
    
    def _calculate_task_score(
        self, 
        task: Dict, 
        assessment_result: Dict, 
        user_profile: Dict
    ) -> float:
        """
        计算任务推荐分数
        
        Args:
            task: 任务信息
            assessment_result: 测评结果
            user_profile: 用户画像
            
        Returns:
            float: 推荐分数
        """
        score = 0.0
        
        dimension_scores = assessment_result.get('dimension_scores', [])
        target_dimensions = task.get('target_dimensions', [])
        
        for dim_score in dimension_scores:
            dimension = dim_score['dimension']
            level = dim_score['level']
            percent = dim_score['percent']
            
            if dimension in target_dimensions:
                if level in ['需关注', '及格']:
                    score += 30
                elif level == '中等':
                    score += 20
                elif level == '良好':
                    score += 10
                else:
                    score += 5
        
        age_months = user_profile.get('age_months', 0)
        age_range = task.get('age_range', [])
        if age_range and len(age_range) == 2:
            if age_range[0] <= age_months <= age_range[1]:
                score += 20
        
        difficulty = task.get('difficulty', 'medium')
        score *= self.difficulty_weights.get(difficulty, 1.0)
        
        popularity = task.get('popularity', 0.0)
        score += popularity * 10
        
        return score
    
    def match_difficulty(
        self, 
        user_ability: float, 
        task_difficulty: str
    ) -> float:
        """
        匹配任务难度
        
        Args:
            user_ability: 用户能力（0-100）
            task_difficulty: 任务难度（easy/medium/hard）
            
        Returns:
            float: 匹配度
        """
        difficulty_ranges = {
            'easy': (0, 60),
            'medium': (60, 80),
            'hard': (80, 100)
        }
        
        min_score, max_score = difficulty_ranges.get(task_difficulty, (0, 100))
        
        if min_score <= user_ability <= max_score:
            return 1.0
        elif user_ability < min_score:
            return 0.5
        else:
            return 0.3