#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PCDI 18-30月 词汇与句子量表计分算法
"""

from typing import List, Dict
from datetime import datetime


class PCDI1830Scoring:
    """PCDI 18-30月量表计分器"""
    
    # 选项分值映射
    VOCAB_OPTIONS = ["不会说", "会说"]
    VOCAB_SCORES = [0, 1]
    
    SENTENCE_OPTIONS = ["还没有", "有时会", "经常会"]
    SENTENCE_SCORES = [0, 1, 2]
    
    def calculate_score(self, answers: List[Dict], age_month: int, gender: str = "female") -> Dict:
        """
        计算 PCDI 18-30月量表得分
        
        Args:
            answers: 答题数据列表
                [
                    {
                        "question_id": "...",
                        "section": "part1",  # 或 part2_A, part2_B, part2_C, part2_D
                        "selected_option": 0/1/2  # 选项索引
                    },
                    ...
                ]
            age_month: 儿童月龄
            gender: 性别 (female/male)
            
        Returns:
            Dict: 计分结果
        """
        try:
            # 初始化各部分得分
            part1_vocab_score = 0  # 第一部分：词汇量表
            part1_total = 0
            
            part2_scores = {
                "A": {"score": 0, "max": 10, "answered": 0},  # 使用词
                "B": {"score": 0, "max": 8, "answered": 0},   # 句子与语句
                "C": {"score": 0, "max": 2, "answered": 0},   # 句子组合
                "D": {"score": 0, "max": 27, "answered": 0}   # 复杂性
            }
            
            # 统计各部分得分
            for answer in answers:
                section = answer.get("section", "")
                option_index = answer.get("selected_option", 0)
                
                if section == "part1":
                    # 第一部分：词汇量表
                    score = self.VOCAB_SCORES[option_index] if option_index < len(self.VOCAB_SCORES) else 0
                    part1_vocab_score += score
                    part1_total += 1
                    
                elif section.startswith("part2_"):
                    # 第二部分：句子复杂度
                    subsection = section.split("_")[1]  # A, B, C, D
                    
                    if subsection in ["A", "B"]:
                        score = self.SENTENCE_SCORES[option_index] if option_index < len(self.SENTENCE_SCORES) else 0
                        part2_scores[subsection]["score"] += score
                        part2_scores[subsection]["answered"] += 1
                        
                    elif subsection == "C":
                        # 句子组合：0=还没有, 1=有时会, 2=经常会
                        score = self.SENTENCE_SCORES[option_index] if option_index < len(self.SENTENCE_SCORES) else 0
                        part2_scores[subsection]["score"] = score
                        part2_scores[subsection]["answered"] = 1
                        
                    elif subsection == "D":
                        # 复杂性：根据选择的复杂度计分
                        # 0=比第一个更简单(0分), 1=第一个选项(1分), 2=第二个选项(2分)...
                        score = option_index if option_index > 0 else 0
                        part2_scores[subsection]["score"] += score
                        part2_scores[subsection]["answered"] += 1
            
            # 计算第二部分总分
            part2_total_score = sum(s["score"] for s in part2_scores.values())
            part2_max_score = sum(s["max"] for s in part2_scores.values())
            
            # 计算百分制得分
            # 词汇量表：按已答题数计算百分比
            vocab_percent = (part1_vocab_score / part1_total * 100) if part1_total > 0 else 0
            
            # 句子复杂度：按满分计算百分比
            sentence_percent = (part2_total_score / part2_max_score * 100) if part2_max_score > 0 else 0
            
            # 综合得分（词汇占60%，句子占40%）
            total_percent = vocab_percent * 0.6 + sentence_percent * 0.4
            
            # 确定等级
            level = self._determine_level(total_percent)
            
            # 计算各维度得分率
            dimension_scores = {
                "vocabulary": {
                    "name": "词汇量表",
                    "score": part1_vocab_score,
                    "max_score": part1_total,
                    "answered": part1_total,
                    "rate": round(vocab_percent, 1),
                    "weight": 0.6
                },
                "sentence_A": {
                    "name": "使用词",
                    "score": part2_scores["A"]["score"],
                    "max_score": part2_scores["A"]["max"],
                    "answered": part2_scores["A"]["answered"],
                    "rate": round((part2_scores["A"]["score"] / part2_scores["A"]["max"] * 100), 1) if part2_scores["A"]["max"] > 0 else 0,
                    "weight": 0.1
                },
                "sentence_B": {
                    "name": "句子与语句",
                    "score": part2_scores["B"]["score"],
                    "max_score": part2_scores["B"]["max"],
                    "answered": part2_scores["B"]["answered"],
                    "rate": round((part2_scores["B"]["score"] / part2_scores["B"]["max"] * 100), 1) if part2_scores["B"]["max"] > 0 else 0,
                    "weight": 0.1
                },
                "sentence_C": {
                    "name": "句子组合",
                    "score": part2_scores["C"]["score"],
                    "max_score": part2_scores["C"]["max"],
                    "answered": part2_scores["C"]["answered"],
                    "rate": round((part2_scores["C"]["score"] / part2_scores["C"]["max"] * 100), 1) if part2_scores["C"]["max"] > 0 else 0,
                    "weight": 0.1
                },
                "sentence_D": {
                    "name": "复杂性",
                    "score": part2_scores["D"]["score"],
                    "max_score": part2_scores["D"]["max"],
                    "answered": part2_scores["D"]["answered"],
                    "rate": round((part2_scores["D"]["score"] / part2_scores["D"]["max"] * 100), 1) if part2_scores["D"]["max"] > 0 else 0,
                    "weight": 0.1
                }
            }
            
            # 生成建议
            suggestions = self._generate_suggestions(
                part1_vocab_score, part1_total,
                part2_scores, total_percent, age_month
            )
            
            # 特殊情况标记
            special_notes = self._check_special_cases(
                part1_vocab_score, part1_total,
                part2_scores, total_percent, age_month
            )
            
            return {
                "status": "success",
                "age_month": age_month,
                "gender": gender,
                "vocabulary": {
                    "score": part1_vocab_score,
                    "total": part1_total,
                    "percent": round(vocab_percent, 1)
                },
                "sentence": {
                    "score": part2_total_score,
                    "max_score": part2_max_score,
                    "percent": round(sentence_percent, 1),
                    "breakdown": {
                        "A": part2_scores["A"],
                        "B": part2_scores["B"],
                        "C": part2_scores["C"],
                        "D": part2_scores["D"]
                    }
                },
                "total_percent": round(total_percent, 1),
                "level": level,
                "dimension_scores": dimension_scores,
                "suggestions": suggestions,
                "special_notes": special_notes,
                "scoring_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"计分失败: {str(e)}"
            }
    
    def _determine_level(self, percent_score: float) -> str:
        """确定语言发展水平等级"""
        if percent_score >= 80:
            return "优秀"
        elif percent_score >= 60:
            return "良好"
        elif percent_score >= 40:
            return "中等"
        elif percent_score >= 20:
            return "待提高"
        else:
            return "需关注"
    
    def _generate_suggestions(self, vocab_score: int, vocab_total: int,
                              part2_scores: Dict, total_percent: float,
                              age_month: int) -> List[str]:
        """生成发展建议"""
        suggestions = []
        
        # 词汇量建议
        vocab_percent = (vocab_score / vocab_total * 100) if vocab_total > 0 else 0
        if vocab_percent < 30:
            suggestions.append("词汇量发展较慢，建议多与孩子进行日常对话，指认常见物品")
        elif vocab_percent < 60:
            suggestions.append("词汇量发展正常，可通过阅读绘本、户外活动丰富词汇")
        else:
            suggestions.append("词汇量发展良好，可尝试引入更复杂的词汇和概念")
        
        # 句子复杂度建议
        if part2_scores["A"]["score"] < part2_scores["A"]["max"] * 0.5:
            suggestions.append("建议多使用指代性语言，如\"妈妈的鞋\"、\"你的玩具\"")
        
        if part2_scores["B"]["score"] < part2_scores["B"]["max"] * 0.5:
            suggestions.append("可引导孩子使用\"的\"表示所属，如\"我的球\"")
        
        if part2_scores["C"]["score"] < 2:
            suggestions.append("鼓励孩子组合词语表达，如\"妈妈抱\"、\"吃苹果\"")
        
        if part2_scores["D"]["score"] < part2_scores["D"]["max"] * 0.3:
            suggestions.append("可通过游戏引导孩子使用更复杂的句子表达")
        
        # 综合建议
        if total_percent < 40:
            suggestions.append("建议定期进行评估，必要时咨询专业语言治疗师")
        
        return suggestions
    
    def _check_special_cases(self, vocab_score: int, vocab_total: int,
                            part2_scores: Dict, total_percent: float,
                            age_month: int) -> List[str]:
        """检查特殊情况"""
        notes = []
        
        # 词汇量极低
        vocab_percent = (vocab_score / vocab_total * 100) if vocab_total > 0 else 0
        if vocab_percent < 10 and age_month >= 24:
            notes.append("词汇量明显低于同龄儿童平均水平，建议关注语言发展")
        
        # 句子复杂度极低
        sentence_score = sum(s["score"] for s in part2_scores.values())
        sentence_max = sum(s["max"] for s in part2_scores.values())
        if sentence_max > 0 and (sentence_score / sentence_max) < 0.2 and age_month >= 24:
            notes.append("句子复杂度明显低于同龄儿童，建议加强语言互动")
        
        # 发展不均衡
        if vocab_percent > 70 and part2_scores["D"]["score"] < 5:
            notes.append("词汇量发展良好，但句子复杂度有待提高")
        
        return notes


# 使用示例
if __name__ == "__main__":
    scorer = PCDI1830Scoring()
    
    # 示例答题数据
    sample_answers = [
        {"question_id": "1", "section": "part1", "selected_option": 1},
        {"question_id": "2", "section": "part1", "selected_option": 1},
        {"question_id": "3", "section": "part2_A", "selected_option": 2},
        {"question_id": "4", "section": "part2_B", "selected_option": 1},
        {"question_id": "5", "section": "part2_C", "selected_option": 2},
        {"question_id": "6", "section": "part2_D", "selected_option": 3},
    ]
    
    result = scorer.calculate_score(sample_answers, age_month=24)
    print(json.dumps(result, ensure_ascii=False, indent=2))
