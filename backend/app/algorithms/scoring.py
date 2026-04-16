from typing import List, Dict
from app.schemas.assessment import AnswerSubmit

class TestScoringAlgorithm:
    def __init__(self, scale_config: Dict):
        self.scale_config = scale_config
    
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        correct_count = 0
        dimension_scores = {}
        
        for answer in answers:
            # 处理字典或对象
            if isinstance(answer, dict):
                question_id = answer.get('question_id')
            else:
                question_id = answer.question_id
                
            question = self._get_question(question_id)
            
            if question:
                is_correct = self._check_correct(answer, question)
                question_score = question.get('score')
                # 确保question_score是整数
                if question_score is None or not isinstance(question_score, (int, float)):
                    question_score = 0
                score = question_score if is_correct else 0
                
                total_score += score
                if is_correct:
                    correct_count += 1
                
                dimension = question['dimension']
                if dimension not in dimension_scores:
                    dimension_scores[dimension] = {'score': 0, 'max_score': 0}
                dimension_scores[dimension]['score'] += score
                dimension_scores[dimension]['max_score'] += question_score
        
        max_score = self.scale_config.get('total_score', 100)
        percent = (total_score / max_score) * 100 if max_score > 0 else 0
        level = self._get_level(percent)
        
        dimension_results = []
        for dimension, scores in dimension_scores.items():
            dim_percent = (scores['score'] / scores['max_score']) * 100 if scores['max_score'] > 0 else 0
            dimension_results.append({
                'dimension': dimension,
                'score': scores['score'],
                'max_score': scores['max_score'],
                'percent': round(dim_percent, 2),
                'level': self._get_level(dim_percent)
            })
        
        return {
            'total_score': round(total_score, 2),
            'max_score': max_score,
            'percent': round(percent, 2),
            'level': level,
            'correct_count': correct_count,
            'total_count': len(answers),
            'dimension_scores': dimension_results
        }
    
    def _get_question(self, question_id: str) -> Dict:
        questions = self.scale_config.get('questions', {})
        return questions.get(question_id)
    
    def _check_correct(self, answer: any, question: Dict) -> bool:
        options = question.get('options', [])
        
        # 处理字典或对象
        if isinstance(answer, dict):
            selected_option = answer.get('selected_option')
        else:
            selected_option = answer.selected_option
            
        for option in options:
            # 检查option的类型
            if isinstance(option, dict):
                if option.get('option_value') == selected_option:
                    return True
            elif isinstance(option, str):
                # 如果option是字符串，直接比较
                if option == selected_option:
                    return True
        return False
    
    def _get_level(self, percent: float) -> str:
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


class ParentingStyleScoringAlgorithm:
    """抚养方式测评评分算法"""
    
    # 题目配置：每个选项对应的得分
    QUESTION_SCORES = {
        'PARENTING_001': [1, 2, 3, 4],  # 主要抚养人
        'PARENTING_002': [1, 2, 3],     # 陪伴时间
        'PARENTING_003': [4, 2, 1, 3],  # 情绪应对
        'PARENTING_004': [3, 2, 1],     # 自主性培养
        'PARENTING_005': [3, 2, 2, 4],  # 教育理念
    }
    
    # 维度映射
    DIMENSION_MAP = {
        'PARENTING_001': '主要抚养人',
        'PARENTING_002': '陪伴时间',
        'PARENTING_003': '情绪应对',
        'PARENTING_004': '自主性培养',
        'PARENTING_005': '教育理念',
    }
    
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        dimension_scores = {}
        
        print(f"抚养方式测评answers数据长度: {len(answers)}")
        
        for answer in answers:
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            if question_id and selected_option is not None:
                # 获取该题目的得分配置
                scores = self.QUESTION_SCORES.get(question_id, [1, 2, 3, 4])
                
                # 计算得分（selected_option是索引，从0开始）
                if 0 <= selected_option < len(scores):
                    score = scores[selected_option]
                else:
                    score = 1
                
                total_score += score
                
                # 记录维度得分
                dimension = self.DIMENSION_MAP.get(question_id, '其他')
                if dimension not in dimension_scores:
                    dimension_scores[dimension] = {'score': 0, 'max_score': 0, 'count': 0}
                dimension_scores[dimension]['score'] += score
                dimension_scores[dimension]['max_score'] += max(scores)
                dimension_scores[dimension]['count'] += 1
        
        # 计算百分制得分（满分20分）
        max_score = 20
        percent = (total_score / max_score) * 100 if max_score > 0 else 0
        
        # 确定等级
        level = self._get_level(total_score)
        
        # 构建维度得分列表
        dimension_results = []
        for dimension, scores in dimension_scores.items():
            dim_percent = (scores['score'] / scores['max_score']) * 100 if scores['max_score'] > 0 else 0
            dim_level = self._get_level_by_score(scores['score'], scores['max_score'])
            dimension_results.append({
                'dimension': dimension,
                'score': scores['score'],
                'max_score': scores['max_score'],
                'percent': round(dim_percent, 2),
                'level': dim_level
            })
        
        print(f"抚养方式测评得分统计:")
        print(f"总得分: {total_score}/{max_score}")
        print(f"百分制得分: {percent:.2f}%")
        print(f"等级: {level}")
        
        return {
            'total_score': total_score,
            'max_score': max_score,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_results
        }
    
    def _get_level(self, score: float) -> str:
        """根据总分获取等级"""
        if score >= 16:
            return '科学抚养'
        elif score >= 12:
            return '良好抚养'
        elif score >= 8:
            return '一般抚养'
        else:
            return '需要改进'
    
    def _get_level_by_score(self, score: float, max_score: float) -> str:
        """根据维度得分获取等级"""
        if max_score == 0:
            return '需关注'
        percent = (score / max_score) * 100
        if percent >= 80:
            return '优秀'
        elif percent >= 60:
            return '良好'
        elif percent >= 40:
            return '一般'
        else:
            return '需关注'


class InteractionQualityScoringAlgorithm:
    """亲子互动质量分析评分算法"""
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        question_count = 0
        
        # 调试：查看answers数据结构
        print(f"亲子互动质量分析answers数据长度: {len(answers)}")
        if answers:
            print(f"第一个answer的结构: {list(answers[0].keys()) if isinstance(answers[0], dict) else dir(answers[0])}")
        
        for i, answer in enumerate(answers):
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            # 调试：查看前5个answer
            if i < 5:
                print(f"Answer {i}: selected_option={selected_option}, question_id={question_id}")
            
            if selected_option is not None:
                # 选项得分：0->1分, 1->2分, 2->3分, 3->4分
                score = selected_option + 1
                total_score += score
                question_count += 1
        
        # 计算最大可能得分
        max_possible_score = question_count * 4
        
        # 确保max_possible_score不为0
        if max_possible_score == 0:
            max_possible_score = 1
        
        percent = (total_score / max_possible_score) * 100
        level = self._get_level(percent)
        
        # 计算各维度得分（简化版）
        dimension_scores = [
            {
                'dimension': '互动时间',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '互动质量',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '情感表达',
                'score': total_score,
                'level': level
            }
        ]
        
        # 调试信息
        print(f"亲子互动质量分析得分统计:")
        print(f"总得分: {total_score}")
        print(f"最大可能得分: {max_possible_score}")
        print(f"百分制得分: {percent}")
        
        return {
            'total_score': round(percent, 2),
            'max_score': 100,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_scores
        }
    
    def _get_level(self, percent: float) -> str:
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


class LanguageEnvironmentScoringAlgorithm:
    """家庭语言环境分析评分算法"""
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        question_count = 0
        
        # 调试：查看answers数据结构
        print(f"家庭语言环境分析answers数据长度: {len(answers)}")
        if answers:
            print(f"第一个answer的结构: {list(answers[0].keys()) if isinstance(answers[0], dict) else dir(answers[0])}")
        
        for i, answer in enumerate(answers):
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            # 调试：查看前5个answer
            if i < 5:
                print(f"Answer {i}: selected_option={selected_option}, question_id={question_id}")
            
            if selected_option is not None:
                # 选项得分：0->1分, 1->2分, 2->3分, 3->4分
                score = selected_option + 1
                total_score += score
                question_count += 1
        
        # 计算最大可能得分
        max_possible_score = question_count * 4
        
        # 确保max_possible_score不为0
        if max_possible_score == 0:
            max_possible_score = 1
        
        percent = (total_score / max_possible_score) * 100
        level = self._get_level(percent)
        
        # 计算各维度得分（简化版）
        dimension_scores = [
            {
                'dimension': '语言输入量',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '语言丰富度',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '阅读环境',
                'score': total_score,
                'level': level
            }
        ]
        
        # 调试信息
        print(f"家庭语言环境分析得分统计:")
        print(f"总得分: {total_score}")
        print(f"最大可能得分: {max_possible_score}")
        print(f"百分制得分: {percent}")
        
        return {
            'total_score': round(percent, 2),
            'max_score': 100,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_scores
        }
    
    def _get_level(self, percent: float) -> str:
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


class PCDI018ScoringAlgorithm:
    """0-18月测评评分算法"""
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        a_count = 0
        b_count = 0
        c_count = 0
        d_count = 0
        a_score = 0
        b_score = 0
        c_score = 0
        d_score = 0
        
        # 调试：查看answers数据结构
        print(f"0-18月测评answers数据长度: {len(answers)}")
        if answers:
            print(f"第一个answer的结构: {list(answers[0].keys()) if isinstance(answers[0], dict) else dir(answers[0])}")
        
        for i, answer in enumerate(answers):
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            # 直接根据question_id判断部分
            if question_id:
                if '_A_' in question_id:
                    # A部分：初期对语言的反应
                    a_count += 1
                    a_score += 10 if selected_option == 1 else 0
                    total_score += 10 if selected_option == 1 else 0
                elif '_B_' in question_id:
                    # B部分：听短句
                    b_count += 1
                    b_score += 2 if selected_option == 1 else 0
                    total_score += 2 if selected_option == 1 else 0
                elif '_C_' in question_id:
                    # C部分：开始说话的方式
                    c_count += 1
                    if selected_option == 0:
                        c_score += 0
                        total_score += 0
                    elif selected_option == 1:
                        c_score += 1
                        total_score += 1
                    else:  # selected_option == 2
                        c_score += 3
                        total_score += 3
                elif '_D_' in question_id:
                    # D部分：词汇量表
                    d_count += 1
                    d_score += selected_option  # 0: 不懂, 1: 听懂, 2: 能说
                    total_score += selected_option
            
            # 调试：查看前5个answer
            if i < 5:
                print(f"Answer {i}: selected_option={selected_option}, question_id={question_id}")
        
        # 计算最大可能得分
        max_possible_score = a_count * 10 + b_count * 2 + c_count * 3 + d_count * 2
        
        # 确保max_possible_score不为0
        if max_possible_score == 0:
            max_possible_score = 1
        
        percent = (total_score / max_possible_score) * 100
        level = self._get_level(percent)
        
        # 计算各维度得分
        dimension_scores = [
            {
                'dimension': '初期语言反应',
                'score': a_score,
                'level': self._get_level((a_score / (a_count * 10)) * 100 if a_count > 0 else 0)
            },
            {
                'dimension': '词汇理解',
                'score': b_score + d_score,
                'level': self._get_level(((b_score + d_score) / ((b_count * 2) + (d_count * 2))) * 100 if (b_count + d_count) > 0 else 0)
            },
            {
                'dimension': '语言表达',
                'score': c_score + d_score,
                'level': self._get_level(((c_score + d_score) / ((c_count * 3) + (d_count * 2))) * 100 if (c_count + d_count) > 0 else 0)
            }
        ]
        
        # 调试信息
        print(f"0-18月测评得分统计:")
        print(f"A部分: {a_count}题, 得分: {a_score}")
        print(f"B部分: {b_count}题, 得分: {b_score}")
        print(f"C部分: {c_count}题, 得分: {c_score}")
        print(f"D部分: {d_count}题, 得分: {d_score}")
        print(f"总得分: {total_score}")
        print(f"最大可能得分: {max_possible_score}")
        print(f"百分制得分: {percent}")
        
        return {
            'total_score': round(percent, 2),
            'max_score': 100,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_scores
        }
    
    def _get_level(self, percent: float) -> str:
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


class InteractionQualityScoringAlgorithm:
    """亲子互动质量分析评分算法"""
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        question_count = 0
        
        # 调试：查看answers数据结构
        print(f"亲子互动质量分析answers数据长度: {len(answers)}")
        if answers:
            print(f"第一个answer的结构: {list(answers[0].keys()) if isinstance(answers[0], dict) else dir(answers[0])}")
        
        for i, answer in enumerate(answers):
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            # 调试：查看前5个answer
            if i < 5:
                print(f"Answer {i}: selected_option={selected_option}, question_id={question_id}")
            
            if selected_option is not None:
                # 选项得分：0->1分, 1->2分, 2->3分, 3->4分
                score = selected_option + 1
                total_score += score
                question_count += 1
        
        # 计算最大可能得分
        max_possible_score = question_count * 4
        
        # 确保max_possible_score不为0
        if max_possible_score == 0:
            max_possible_score = 1
        
        percent = (total_score / max_possible_score) * 100
        level = self._get_level(percent)
        
        # 计算各维度得分（简化版）
        dimension_scores = [
            {
                'dimension': '互动时间',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '互动质量',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '情感表达',
                'score': total_score,
                'level': level
            }
        ]
        
        # 调试信息
        print(f"亲子互动质量分析得分统计:")
        print(f"总得分: {total_score}")
        print(f"最大可能得分: {max_possible_score}")
        print(f"百分制得分: {percent}")
        
        return {
            'total_score': round(percent, 2),
            'max_score': 100,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_scores
        }
    
    def _get_level(self, percent: float) -> str:
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


class LanguageEnvironmentScoringAlgorithm:
    """家庭语言环境分析评分算法"""
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        question_count = 0
        
        # 调试：查看answers数据结构
        print(f"家庭语言环境分析answers数据长度: {len(answers)}")
        if answers:
            print(f"第一个answer的结构: {list(answers[0].keys()) if isinstance(answers[0], dict) else dir(answers[0])}")
        
        for i, answer in enumerate(answers):
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            # 调试：查看前5个answer
            if i < 5:
                print(f"Answer {i}: selected_option={selected_option}, question_id={question_id}")
            
            if selected_option is not None:
                # 选项得分：0->1分, 1->2分, 2->3分, 3->4分
                score = selected_option + 1
                total_score += score
                question_count += 1
        
        # 计算最大可能得分
        max_possible_score = question_count * 4
        
        # 确保max_possible_score不为0
        if max_possible_score == 0:
            max_possible_score = 1
        
        percent = (total_score / max_possible_score) * 100
        level = self._get_level(percent)
        
        # 计算各维度得分（简化版）
        dimension_scores = [
            {
                'dimension': '语言输入量',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '语言丰富度',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '阅读环境',
                'score': total_score,
                'level': level
            }
        ]
        
        # 调试信息
        print(f"家庭语言环境分析得分统计:")
        print(f"总得分: {total_score}")
        print(f"最大可能得分: {max_possible_score}")
        print(f"百分制得分: {percent}")
        
        return {
            'total_score': round(percent, 2),
            'max_score': 100,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_scores
        }
    
    def _get_level(self, percent: float) -> str:
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


class PCDI1830ScoringAlgorithm:
    """18-30月测评评分算法"""
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        part1_count = 0
        part2a_count = 0
        part2b_count = 0
        part2c_count = 0
        part2d_count = 0
        part1_score = 0
        part2a_score = 0
        part2b_score = 0
        part2c_score = 0
        part2d_score = 0
        
        # 调试：查看answers数据结构
        print(f"18-30月测评answers数据长度: {len(answers)}")
        if answers:
            print(f"第一个answer的结构: {list(answers[0].keys()) if isinstance(answers[0], dict) else dir(answers[0])}")
        
        for i, answer in enumerate(answers):
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            # 直接根据question_id判断部分
            if question_id:
                if 'part1_' in question_id:
                    # part1：词汇量表
                    part1_count += 1
                    part1_score += 1 if selected_option == 1 else 0
                    total_score += 1 if selected_option == 1 else 0
                elif 'part2_A_' in question_id:
                    # part2_A：小孩怎么使用词
                    part2a_count += 1
                    part2a_score += selected_option  # 0: 还没有, 1: 有时会, 2: 经常会
                    total_score += selected_option
                elif 'part2_B_' in question_id:
                    # part2_B：句子与语句
                    part2b_count += 1
                    part2b_score += selected_option  # 0: 还没有, 1: 有时会, 2: 经常会
                    total_score += selected_option
                elif 'part2_C_' in question_id:
                    # part2_C：句子组合
                    part2c_count += 1
                    part2c_score += selected_option  # 0: 还没有, 1: 有时会, 2: 经常会
                    total_score += selected_option
                elif 'part2_D_' in question_id:
                    # part2_D：复杂性
                    part2d_count += 1
                    part2d_score += selected_option  # 0-4分
                    total_score += selected_option
            
            # 调试：查看前5个answer
            if i < 5:
                print(f"Answer {i}: selected_option={selected_option}, question_id={question_id}")
        
        # 计算最大可能得分
        max_possible_score = part1_count * 1 + part2a_count * 2 + part2b_count * 2 + part2c_count * 2 + part2d_count * 4
        
        # 确保max_possible_score不为0
        if max_possible_score == 0:
            max_possible_score = 1
        
        percent = (total_score / max_possible_score) * 100
        level = self._get_level(percent)
        
        # 计算各维度得分
        dimension_scores = [
            {
                'dimension': '词汇产出',
                'score': part1_score,
                'level': self._get_level((part1_score / (part1_count * 1)) * 100 if part1_count > 0 else 0)
            },
            {
                'dimension': '句子结构',
                'score': part2b_score + part2c_score,
                'level': self._get_level(((part2b_score + part2c_score) / ((part2b_count * 2) + (part2c_count * 2))) * 100 if (part2b_count + part2c_count) > 0 else 0)
            },
            {
                'dimension': '语言复杂度',
                'score': part2d_score,
                'level': self._get_level((part2d_score / (part2d_count * 4)) * 100 if part2d_count > 0 else 0)
            }
        ]
        
        # 调试信息
        print(f"18-30月测评得分统计:")
        print(f"part1: {part1_count}题, 得分: {part1_score}")
        print(f"part2_A: {part2a_count}题, 得分: {part2a_score}")
        print(f"part2_B: {part2b_count}题, 得分: {part2b_score}")
        print(f"part2_C: {part2c_count}题, 得分: {part2c_score}")
        print(f"part2_D: {part2d_count}题, 得分: {part2d_score}")
        print(f"总得分: {total_score}")
        print(f"最大可能得分: {max_possible_score}")
        print(f"百分制得分: {percent}")
        
        return {
            'total_score': round(percent, 2),
            'max_score': 100,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_scores
        }
    
    def _get_level(self, percent: float) -> str:
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


class InteractionQualityScoringAlgorithm:
    """亲子互动质量分析评分算法"""
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        question_count = 0
        
        # 调试：查看answers数据结构
        print(f"亲子互动质量分析answers数据长度: {len(answers)}")
        if answers:
            print(f"第一个answer的结构: {list(answers[0].keys()) if isinstance(answers[0], dict) else dir(answers[0])}")
        
        for i, answer in enumerate(answers):
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            # 调试：查看前5个answer
            if i < 5:
                print(f"Answer {i}: selected_option={selected_option}, question_id={question_id}")
            
            if selected_option is not None:
                # 选项得分：0->1分, 1->2分, 2->3分, 3->4分
                score = selected_option + 1
                total_score += score
                question_count += 1
        
        # 计算最大可能得分
        max_possible_score = question_count * 4
        
        # 确保max_possible_score不为0
        if max_possible_score == 0:
            max_possible_score = 1
        
        percent = (total_score / max_possible_score) * 100
        level = self._get_level(percent)
        
        # 计算各维度得分（简化版）
        dimension_scores = [
            {
                'dimension': '互动时间',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '互动质量',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '情感表达',
                'score': total_score,
                'level': level
            }
        ]
        
        # 调试信息
        print(f"亲子互动质量分析得分统计:")
        print(f"总得分: {total_score}")
        print(f"最大可能得分: {max_possible_score}")
        print(f"百分制得分: {percent}")
        
        return {
            'total_score': round(percent, 2),
            'max_score': 100,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_scores
        }
    
    def _get_level(self, percent: float) -> str:
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


class LanguageEnvironmentScoringAlgorithm:
    """家庭语言环境分析评分算法"""
    def calculate_score(self, answers: list) -> Dict:
        total_score = 0
        question_count = 0
        
        # 调试：查看answers数据结构
        print(f"家庭语言环境分析answers数据长度: {len(answers)}")
        if answers:
            print(f"第一个answer的结构: {list(answers[0].keys()) if isinstance(answers[0], dict) else dir(answers[0])}")
        
        for i, answer in enumerate(answers):
            if isinstance(answer, dict):
                selected_option = answer.get('selected_option')
                question_id = answer.get('question_id')
            else:
                selected_option = getattr(answer, 'selected_option', None)
                question_id = getattr(answer, 'question_id', None)
            
            # 调试：查看前5个answer
            if i < 5:
                print(f"Answer {i}: selected_option={selected_option}, question_id={question_id}")
            
            if selected_option is not None:
                # 选项得分：0->1分, 1->2分, 2->3分, 3->4分
                score = selected_option + 1
                total_score += score
                question_count += 1
        
        # 计算最大可能得分
        max_possible_score = question_count * 4
        
        # 确保max_possible_score不为0
        if max_possible_score == 0:
            max_possible_score = 1
        
        percent = (total_score / max_possible_score) * 100
        level = self._get_level(percent)
        
        # 计算各维度得分（简化版）
        dimension_scores = [
            {
                'dimension': '语言输入量',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '语言丰富度',
                'score': total_score,
                'level': level
            },
            {
                'dimension': '阅读环境',
                'score': total_score,
                'level': level
            }
        ]
        
        # 调试信息
        print(f"家庭语言环境分析得分统计:")
        print(f"总得分: {total_score}")
        print(f"最大可能得分: {max_possible_score}")
        print(f"百分制得分: {percent}")
        
        return {
            'total_score': round(percent, 2),
            'max_score': 100,
            'percent': round(percent, 2),
            'level': level,
            'dimension_scores': dimension_scores
        }
    
    def _get_level(self, percent: float) -> str:
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