#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PCDI 0-18月词汇与手势量表计分算法 V2
支持甲乙丙丁结构和百分制计分
"""

from typing import Dict, List, Tuple, Optional
from datetime import datetime


class PCDI018ScoringAlgorithm:
    """
    PCDI 0-18月量表计分算法
    
    结构:
    - 甲部分: 初期对语言的反应 (3题, 每题10分, 共30分)
    - 乙部分: 听短句 (27题, 每题2分, 共54分)
    - 丙部分: 开始说话的方式 (4题, 0/1/3分, 共12分)
    - 丁部分: 词汇量表 (约396词, 每词0/1/2分, 共792分)
    
    总分: 888分 -> 转换为百分制
    """
    
    # 各部分配置
    SECTIONS_CONFIG = {
        "A": {
            "name": "初期对语言的反应",
            "question_count": 3,
            "options": ["没有", "有"],
            "scores": [0, 10],
            "max_score": 30,
            "weight": 10  # 百分制权重
        },
        "B": {
            "name": "听短句",
            "question_count": 27,
            "options": ["听不懂", "听懂"],
            "scores": [0, 2],
            "max_score": 54,
            "weight": 15
        },
        "C": {
            "name": "开始说话的方式",
            "question_count": 4,
            "options": ["从不", "有时", "经常"],
            "scores": [0, 1, 3],
            "max_score": 12,
            "weight": 15
        },
        "D": {
            "name": "词汇量表",
            "question_count": 396,  # 约396个词汇
            "options": ["不懂", "听懂", "能说"],
            "scores": [0, 1, 2],
            "max_score": 792,
            "weight": 60
        }
    }
    
    # 总分
    TOTAL_MAX_SCORE = 888
    
    # 百分位等级划分
    PERCENTILE_LEVELS = {
        "excellent": {"min": 85, "max": 100, "percentile": 90, "label": "优秀", "color": "#52c41a"},
        "good": {"min": 70, "max": 84, "percentile": 75, "label": "良好", "color": "#1890ff"},
        "average": {"min": 50, "max": 69, "percentile": 50, "label": "中等", "color": "#faad14"},
        "below_average": {"min": 30, "max": 49, "percentile": 25, "label": "中下", "color": "#fa8c16"},
        "concern": {"min": 0, "max": 29, "percentile": 10, "label": "需关注", "color": "#f5222d"}
    }
    
    def __init__(self):
        pass
    
    def calculate_score(self, answers: List[Dict], age_month: int, gender: str = "female") -> Dict:
        """
        计算 PCDI 0-18月量表得分
        
        Args:
            answers: 答题数据列表
                [
                    {
                        "question_id": "PCDI_VOCAB_GESTURE_0_18_part1_A_001",
                        "section": "A",  # 甲/乙/丙/丁
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
            section_scores = {
                "A": {"score": 0, "max_score": 30, "answered": 0},
                "B": {"score": 0, "max_score": 54, "answered": 0},
                "C": {"score": 0, "max_score": 12, "answered": 0},
                "D": {"score": 0, "max_score": 792, "answered": 0}
            }
            
            # 统计各部分得分
            for answer in answers:
                section = answer.get("section", "")
                option_index = answer.get("selected_option", 0)
                
                if section in self.SECTIONS_CONFIG:
                    config = self.SECTIONS_CONFIG[section]
                    score = config["scores"][option_index] if option_index < len(config["scores"]) else 0
                    section_scores[section]["score"] += score
                    section_scores[section]["answered"] += 1
            
            # 计算原始总分
            raw_total = sum(s["score"] for s in section_scores.values())
            max_possible = sum(s["max_score"] for s in section_scores.values())
            
            # 转换为百分制
            if max_possible > 0:
                percent_score = (raw_total / max_possible) * 100
            else:
                percent_score = 0
            
            percent_score = round(percent_score, 1)
            
            # 确定等级
            level = self._determine_level(percent_score)
            
            # 计算各维度得分率
            dimension_scores = {}
            for section, data in section_scores.items():
                config = self.SECTIONS_CONFIG[section]
                if data["max_score"] > 0:
                    dimension_rate = (data["score"] / data["max_score"]) * 100
                else:
                    dimension_rate = 0
                
                dimension_scores[section] = {
                    "name": config["name"],
                    "score": data["score"],
                    "max_score": data["max_score"],
                    "answered": data["answered"],
                    "rate": round(dimension_rate, 1),
                    "weight": config["weight"]
                }
            
            # 生成建议
            suggestions = self._generate_suggestions(section_scores, percent_score, age_month)
            
            # 特殊情况标记
            special_notes = self._check_special_cases(section_scores, percent_score, age_month)
            
            return {
                "status": "success",
                "age_month": age_month,
                "gender": gender,
                "raw_score": raw_total,
                "max_score": max_possible,
                "percent_score": percent_score,
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
    
    def _determine_level(self, percent_score: float) -> Dict:
        """确定等级"""
        for level_key, level_config in self.PERCENTILE_LEVELS.items():
            if level_config["min"] <= percent_score <= level_config["max"]:
                return {
                    "key": level_key,
                    "label": level_config["label"],
                    "percentile": level_config["percentile"],
                    "color": level_config["color"]
                }
        
        return {
            "key": "unknown",
            "label": "未知",
            "percentile": 0,
            "color": "#999999"
        }
    
    def _generate_suggestions(self, section_scores: Dict, percent_score: float, age_month: int) -> List[str]:
        """生成干预建议"""
        suggestions = []
        
        # 根据总分给出建议
        if percent_score >= 85:
            suggestions.append("🌟 孩子的语言发展状况优秀，请继续保持良好的亲子互动和语言环境。")
        elif percent_score >= 70:
            suggestions.append("👍 孩子的语言发展良好，可以通过增加阅读时间和语言游戏来进一步提升。")
        elif percent_score >= 50:
            suggestions.append("📚 孩子的语言发展处于中等水平，建议增加日常语言互动，多给孩子描述周围的事物。")
        elif percent_score >= 30:
            suggestions.append("💡 孩子的语言发展需要关注，建议：")
            suggestions.append("   - 增加与孩子的面对面交流时间")
            suggestions.append("   - 使用简单清晰的语言")
            suggestions.append("   - 多给孩子回应和等待的时间")
        else:
            suggestions.append("⚠️ 孩子的语言发展明显落后，建议：")
            suggestions.append("   - 尽快咨询专业的言语治疗师或儿科医生")
            suggestions.append("   - 进行更详细的语言评估")
            suggestions.append("   - 制定个性化的干预计划")
        
        # 根据各维度给出具体建议
        # 甲部分 - 初期反应
        if section_scores["A"]["score"] < 20:
            suggestions.append("🔊 孩子对语言指令的反应较弱，建议多使用吸引注意力的语调，配合手势和表情。")
        
        # 乙部分 - 听短句
        if section_scores["B"]["score"] < 30:
            suggestions.append("👂 孩子对短句的理解需要加强，建议从简单的单步指令开始练习。")
        
        # 丙部分 - 说话方式
        if section_scores["C"]["score"] < 6:
            suggestions.append("🗣️ 孩子的主动沟通意愿较低，建议创造更多需要孩子表达需求的情境。")
        
        # 丁部分 - 词汇量
        vocab_rate = (section_scores["D"]["score"] / section_scores["D"]["max_score"]) * 100 if section_scores["D"]["max_score"] > 0 else 0
        if vocab_rate < 40:
            suggestions.append("📖 孩子的词汇量较少，建议：")
            suggestions.append("   - 每天固定时间进行亲子阅读")
            suggestions.append("   - 在生活中多给孩子命名物品")
            suggestions.append("   - 使用丰富的形容词和动词")
        
        return suggestions
    
    def _check_special_cases(self, section_scores: Dict, percent_score: float, age_month: int) -> List[str]:
        """检查特殊情况"""
        notes = []
        
        # 低龄高分
        if age_month <= 12 and percent_score >= 80:
            notes.append("8-12月龄儿童得分较高，请确认家长是否准确理解题目要求")
        
        # 词汇量异常
        vocab_count = section_scores["D"]["score"] // 2  # 估算词汇量（能说）
        if age_month <= 12 and vocab_count > 50:
            notes.append("低龄儿童词汇量数据偏高，可能存在高估情况")
        
        # 完成度检查
        total_answered = sum(s["answered"] for s in section_scores.values())
        expected_total = sum(self.SECTIONS_CONFIG[s]["question_count"] for s in ["A", "B", "C", "D"])
        if total_answered < expected_total * 0.8:
            notes.append(f"测评完成度较低 ({total_answered}/{expected_total})，结果仅供参考")
        
        # 部分得分异常
        if section_scores["A"]["score"] == 0:
            notes.append("初期语言反应得分为0，建议检查听力或寻求专业评估")
        
        return notes
    
    def calculate_section_score(self, section: str, answers: List[int]) -> Dict:
        """
        计算单个部分的得分
        
        Args:
            section: 部分标识 (A/B/C/D)
            answers: 选项索引列表
            
        Returns:
            Dict: 该部分的得分详情
        """
        if section not in self.SECTIONS_CONFIG:
            return {"error": "无效的部分标识"}
        
        config = self.SECTIONS_CONFIG[section]
        scores = config["scores"]
        
        total_score = sum(scores[a] if a < len(scores) else 0 for a in answers)
        max_score = config["max_score"]
        rate = (total_score / max_score * 100) if max_score > 0 else 0
        
        return {
            "section": section,
            "name": config["name"],
            "score": total_score,
            "max_score": max_score,
            "rate": round(rate, 1),
            "answered": len(answers),
            "expected": config["question_count"]
        }


# 便捷函数
def calculate_pcdi_018_score(answers: List[Dict], age_month: int, gender: str = "female") -> Dict:
    """
    便捷计分函数
    
    Args:
        answers: 答题数据
        age_month: 月龄
        gender: 性别
        
    Returns:
        Dict: 计分结果
    """
    algorithm = PCDI018ScoringAlgorithm()
    return algorithm.calculate_score(answers, age_month, gender)


# 测试代码
if __name__ == "__main__":
    # 模拟测试数据
    test_answers = [
        # 甲部分 - 初期反应 (3题)
        {"question_id": "A_001", "section": "A", "selected_option": 1},  # 有
        {"question_id": "A_002", "section": "A", "selected_option": 1},  # 有
        {"question_id": "A_003", "section": "A", "selected_option": 0},  # 没有
        
        # 乙部分 - 听短句 (27题中的5题示例)
        {"question_id": "B_001", "section": "B", "selected_option": 1},  # 听懂
        {"question_id": "B_002", "section": "B", "selected_option": 1},
        {"question_id": "B_003", "section": "B", "selected_option": 0},  # 听不懂
        {"question_id": "B_004", "section": "B", "selected_option": 1},
        {"question_id": "B_005", "section": "B", "selected_option": 1},
        
        # 丙部分 - 说话方式 (4题)
        {"question_id": "C_001", "section": "C", "selected_option": 2},  # 经常
        {"question_id": "C_002", "section": "C", "selected_option": 1},  # 有时
        {"question_id": "C_003", "section": "C", "selected_option": 1},
        {"question_id": "C_004", "section": "C", "selected_option": 0},  # 从不
        
        # 丁部分 - 词汇量表 (示例10词)
        {"question_id": "D_001", "section": "D", "selected_option": 2},  # 能说
        {"question_id": "D_002", "section": "D", "selected_option": 2},
        {"question_id": "D_003", "section": "D", "selected_option": 1},  # 听懂
        {"question_id": "D_004", "section": "D", "selected_option": 2},
        {"question_id": "D_005", "section": "D", "selected_option": 0},  # 不懂
        {"question_id": "D_006", "section": "D", "selected_option": 2},
        {"question_id": "D_007", "section": "D", "selected_option": 1},
        {"question_id": "D_008", "section": "D", "selected_option": 2},
        {"question_id": "D_009", "section": "D", "selected_option": 2},
        {"question_id": "D_010", "section": "D", "selected_option": 1},
    ]
    
    # 计算得分
    result = calculate_pcdi_018_score(test_answers, age_month=12, gender="female")
    
    # 打印结果
    print("=" * 60)
    print("PCDI 0-18月量表计分测试结果")
    print("=" * 60)
    print(f"\n原始总分: {result['raw_score']}/{result['max_score']}")
    print(f"百分制得分: {result['percent_score']}分")
    print(f"等级: {result['level']['label']} (第{result['level']['percentile']}百分位)")
    
    print("\n各维度得分:")
    for section, data in result['dimension_scores'].items():
        print(f"  {data['name']}: {data['score']}/{data['max_score']} ({data['rate']}%) - 权重{data['weight']}%")
    
    print("\n干预建议:")
    for suggestion in result['suggestions'][:3]:
        print(f"  {suggestion}")
    
    if result['special_notes']:
        print("\n特殊说明:")
        for note in result['special_notes']:
            print(f"  ⚠️ {note}")
