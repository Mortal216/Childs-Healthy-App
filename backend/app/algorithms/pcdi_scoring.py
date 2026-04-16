from typing import Dict, Tuple, Optional

PERCENTILE_TABLE = {
    8: {
        "female": {
            (0, 50): 5, (51, 100): 25, (101, 150): 50,
            (151, 200): 75, (201, 472): 95
        },
        "male": {
            (0, 40): 5, (41, 90): 25, (91, 140): 50,
            (141, 190): 75, (191, 472): 95
        }
    },
    12: {
        "female": {
            (0, 80): 5, (81, 180): 25, (181, 320): 50,
            (321, 480): 75, (481, 680): 95
        },
        "male": {
            (0, 70): 5, (71, 160): 25, (161, 300): 50,
            (301, 450): 75, (451, 650): 95
        }
    },
    18: {
        "female": {
            (0, 150): 5, (151, 300): 25, (301, 500): 50,
            (501, 700): 75, (701, 888): 95
        },
        "male": {
            (0, 130): 5, (131, 280): 25, (281, 480): 50,
            (481, 680): 75, (681, 888): 95
        }
    },
    24: {
        "female": {
            (0, 100): 5, (101, 200): 25, (201, 350): 50,
            (351, 500): 75, (501, 888): 95
        },
        "male": {
            (0, 80): 5, (81, 180): 25, (181, 320): 50,
            (321, 480): 75, (481, 888): 95
        }
    },
    30: {
        "female": {
            (0, 200): 5, (201, 400): 25, (401, 600): 50,
            (601, 800): 75, (801, 888): 95
        },
        "male": {
            (0, 180): 5, (181, 380): 25, (381, 580): 50,
            (581, 780): 75, (781, 888): 95
        }
    }
}

SHORT_FORM_CONFIG = {
    "vocab_gesture": {"total_items": 106, "phrase_items": 5, "vocab_items": 101},
    "vocab_sentence": {"total_items": 113, "vocab_items": 111, "grammar_items": 2}
}

class PCDIScoringAlgorithm:
    def __init__(self, scale_config: Dict = None):
        self.scale_config = scale_config or {}
    
    def calculate_vocab_gesture_score(
        self, 
        data: Dict, 
        age_month: int, 
        gender: str = "female"
    ) -> Dict:
        """
        词汇和手势量表计分（8~16个月长表）
        
        Args:
            data: 测评原始数据
            age_month: 儿童月龄（8~16）
            gender: 性别（female/male）
            
        Returns:
            Dict: 计分结果字典
        """
        try:
            el_data = data.get("early_language", {})
            g_data = data.get("gesture", {})
            
            lang_understand = sum(el_data.get("language_understanding", []))
            understand_phrases = sum(el_data.get("understand_phrases", []))
            start_speaking = sum(el_data.get("start_speaking", []))
            
            vocab_data = el_data.get("vocab", {})
            vocab_understand = vocab_data.get("understood", 0) + vocab_data.get("spoken", 0)
            vocab_spoken = vocab_data.get("spoken", 0)
            
            early_language_total = lang_understand + understand_phrases + start_speaking + vocab_understand
            
            early_gesture = sum(g_data.get("early_gesture", []))
            game_routine = sum(g_data.get("game_routine", []))
            interactive_action = sum(g_data.get("interactive_action", []))
            pretend_play = sum(g_data.get("pretend_play", []))
            imitate_adult = sum(g_data.get("imitate_adult", []))
            
            gesture_total = early_gesture + game_routine + interactive_action + pretend_play + imitate_adult
            
            total_score = early_language_total + gesture_total
            
            percentile = self._match_percentile(age_month, gender, total_score, "vocab_gesture")
            special_note = self._validate_special_cases(data, age_month, total_score)
            
            return {
                "status": "success",
                "age_month": age_month,
                "gender": gender,
                "sub_scores": {
                    "early_language": {
                        "lang_understand": lang_understand,
                        "understand_phrases": understand_phrases,
                        "start_speaking": start_speaking,
                        "vocab_understand": vocab_understand,
                        "vocab_spoken": vocab_spoken,
                        "total": early_language_total
                    },
                    "gesture": {
                        "early_gesture": early_gesture,
                        "game_routine": game_routine,
                        "interactive_action": interactive_action,
                        "pretend_play": pretend_play,
                        "imitate_adult": imitate_adult,
                        "total": gesture_total
                    }
                },
                "total_score": total_score,
                "percentile": percentile,
                "special_note": special_note
            }
        except KeyError as e:
            return {"status": "error", "message": f"缺失必填数据项：{str(e)}"}
        except Exception as e:
            return {"status": "error", "message": f"计分失败：{str(e)}"}
    
    def calculate_vocab_sentence_score(
        self, 
        data: Dict, 
        age_month: int, 
        gender: str = "female"
    ) -> Dict:
        """
        词汇和句子量表计分（16~30个月长表）
        
        Args:
            data: 测评原始数据
            age_month: 儿童月龄（16~30）
            gender: 性别（female/male）
            
        Returns:
            Dict: 计分结果字典
        """
        try:
            # 处理前端提交的answers格式数据
            answers = data.get("answers", [])
            
            # 根据年龄段计算得分
            if age_month <= 18:
                # 0-18月龄评分逻辑
                score = 0
                for answer in answers:
                    # 0: 理解但不会说 (50分), 1: 会说 (100分)
                    if answer.get("selected_option") == 1:
                        score += 20  # 5题，每题20分
                    else:
                        score += 10  # 理解但不会说给10分
                
                total_score = min(score, 100)  # 满分100
                percentile = (total_score / 100) * 100
                
                sub_scores = {
                    "vocab_spoken": total_score,
                    "vocab_understanding": score // 2
                }
            else:
                # 18-30月龄评分逻辑
                score = 0
                for answer in answers:
                    # 0: 不能/不会 (0分), 1: 能/会 (20分)
                    if answer.get("selected_option") == 1:
                        score += 20  # 5题，每题20分
                
                total_score = min(score, 100)  # 满分100
                percentile = (total_score / 100) * 100
                
                sub_scores = {
                    "vocab_spoken": total_score,
                    "sentence_ability": score
                }
            
            special_note = self._validate_special_cases(data, age_month, total_score)
            
            return {
                "status": "success",
                "age_month": age_month,
                "gender": gender,
                "sub_scores": sub_scores,
                "total_score": total_score,
                "max_score": 100,
                "percent": percentile,
                "percentile": None,
                "special_note": special_note
            }
        except KeyError as e:
            return {"status": "error", "message": f"缺失必填数据项：{str(e)}"}
        except Exception as e:
            return {"status": "error", "message": f"计分失败：{str(e)}"}
    
    def calculate_short_form_score(
        self, 
        data: Dict, 
        age_month: int, 
        scale_type: str,
        gender: str = "female"
    ) -> Dict:
        """
        短表快速筛查计分
        
        Args:
            data: 短表原始数据
            age_month: 儿童月龄
            scale_type: 短表类型（vocab_gesture/vocab_sentence）
            gender: 性别
            
        Returns:
            Dict: 短表计分结果
        """
        try:
            if scale_type not in SHORT_FORM_CONFIG:
                return {"status": "error", "message": "短表类型错误，仅支持vocab_gesture/vocab_sentence"}
            
            config = SHORT_FORM_CONFIG[scale_type]
            
            if scale_type == "vocab_gesture":
                understand_score = sum(data.get("understand_phrases", [])) + data.get("vocab_understood", 0)
                spoken_score = data.get("vocab_spoken", 0)
                total_score = understand_score + spoken_score
            else:
                vocab_score = data.get("vocab_spoken", 0)
                grammar_score = sum(data.get("grammar_items", []))
                total_score = vocab_score + grammar_score
            
            percentile = self._match_percentile(age_month, gender, total_score, scale_type)
            
            return {
                "status": "success",
                "scale_type": scale_type,
                "total_score": total_score,
                "percentile": percentile,
                "max_score": config["total_items"] if scale_type == "vocab_gesture" else config["total_items"] + 4
            }
        except KeyError as e:
            return {"status": "error", "message": f"缺失必填数据项：{str(e)}"}
        except Exception as e:
            return {"status": "error", "message": f"计分失败：{str(e)}"}
    
    def _match_percentile(
        self, 
        age_month: int, 
        gender: str, 
        score: int, 
        scale_type: str
    ) -> Optional[int]:
        """
        匹配常模百分位
        
        Args:
            age_month: 儿童月龄
            gender: 性别
            score: 得分
            scale_type: 量表类型
            
        Returns:
            Optional[int]: 百分位值（如5/25/50/75/95），无匹配返回None
        """
        gender = gender.lower()
        
        if age_month not in PERCENTILE_TABLE:
            return None
        
        gender_table = PERCENTILE_TABLE[age_month].get(gender, {})
        
        for (score_min, score_max), perc in gender_table.items():
            if score_min <= score <= score_max:
                return perc
        
        return None
    
    def _validate_special_cases(
        self, 
        data: Dict, 
        age_month: int, 
        total_score: int
    ) -> str:
        """
        特殊情况校验
        
        Args:
            data: 测评数据
            age_month: 儿童月龄
            total_score: 总分
            
        Returns:
            str: 特殊情况说明
        """
        notes = []
        
        if age_month == 8 and "vocab_spoken" in data and data["vocab_spoken"] > 10:
            notes.append("8月龄儿童词汇表达分偏高，可能存在家长高估，建议复核")
        
        if "unfinished_items" in data and data["unfinished_items"] > 5:
            notes.append(f"未完成项目数{data['unfinished_items']}，结果仅供参考")
        
        if "is_bilingual" in data and data["is_bilingual"]:
            notes.append("儿童为双语环境，不建议直接套用单语常模")
        
        if age_month in PERCENTILE_TABLE:
            min_score = min(PERCENTILE_TABLE[age_month].get("female", {}).keys(), key=lambda x: x[0])[0]
            if total_score < min_score:
                notes.append("得分低于第10百分位，建议进一步临床评估")
        
        return "; ".join(notes) if notes else "无特殊情况"

    def calculate_interaction_quality_score(
        self,
        data: Dict,
        age_month: int,
        gender: str = "female"
    ) -> Dict:
        """
        亲子互动质量分析计分
        
        Args:
            data: 测评原始数据
            age_month: 儿童月龄
            gender: 性别（female/male）
            
        Returns:
            Dict: 计分结果字典
        """
        try:
            # 处理前端提交的answers格式数据
            answers = data.get("answers", [])
            
            # 计算得分
            score = 0
            for answer in answers:
                # 0-3分，对应选项1-4
                selected_option = answer.get("selected_option", 0)
                score += (selected_option + 1) * 5  # 每题5-20分
            
            total_score = min(score, 100)  # 满分100
            percentile = (total_score / 100) * 100
            
            # 计算维度得分
            interaction_frequency = 0
            interaction_quality = 0
            emotional_expression = 0
            
            if answers:
                # 互动频率（问题1）
                if len(answers) > 0:
                    interaction_frequency = (answers[0].get("selected_option", 0) + 1) * 25
                
                # 互动质量（问题2、3）
                if len(answers) > 2:
                    quality_score = (answers[1].get("selected_option", 0) + answers[2].get("selected_option", 0) + 2) * 12.5
                    interaction_quality = min(quality_score, 100)
                
                # 情感表达（问题4、5）
                if len(answers) > 4:
                    emotion_score = (answers[3].get("selected_option", 0) + answers[4].get("selected_option", 0) + 2) * 12.5
                    emotional_expression = min(emotion_score, 100)
            
            sub_scores = {
                "interaction_frequency": interaction_frequency,
                "interaction_quality": interaction_quality,
                "emotional_expression": emotional_expression
            }
            
            special_note = self._validate_special_cases(data, age_month, total_score)
            
            return {
                "status": "success",
                "age_month": age_month,
                "gender": gender,
                "sub_scores": sub_scores,
                "total_score": total_score,
                "max_score": 100,
                "percent": percentile,
                "percentile": None,
                "special_note": special_note
            }
        except Exception as e:
            return {"status": "error", "message": f"计分失败：{str(e)}"}

    def calculate_language_environment_score(
        self,
        data: Dict,
        age_month: int,
        gender: str = "female"
    ) -> Dict:
        """
        家庭语言环境分析计分
        
        Args:
            data: 测评原始数据
            age_month: 儿童月龄
            gender: 性别（female/male）
            
        Returns:
            Dict: 计分结果字典
        """
        try:
            # 处理前端提交的answers格式数据
            answers = data.get("answers", [])
            
            # 计算得分
            score = 0
            for answer in answers:
                # 0-3分，对应选项1-4
                selected_option = answer.get("selected_option", 0)
                score += (selected_option + 1) * 5  # 每题5-20分
            
            total_score = min(score, 100)  # 满分100
            percentile = (total_score / 100) * 100
            
            # 计算维度得分
            language_input = 0
            reading_environment = 0
            language_stimulation = 0
            
            if answers:
                # 语言输入（问题1、2）
                if len(answers) > 1:
                    input_score = (answers[0].get("selected_option", 0) + answers[1].get("selected_option", 0) + 2) * 12.5
                    language_input = min(input_score, 100)
                
                # 阅读环境（问题3）
                if len(answers) > 2:
                    reading_environment = (answers[2].get("selected_option", 0) + 1) * 25
                
                # 语言刺激（问题4、5）
                if len(answers) > 4:
                    stimulation_score = (answers[3].get("selected_option", 0) + answers[4].get("selected_option", 0) + 2) * 12.5
                    language_stimulation = min(stimulation_score, 100)
            
            sub_scores = {
                "language_input": language_input,
                "reading_environment": reading_environment,
                "language_stimulation": language_stimulation
            }
            
            special_note = self._validate_special_cases(data, age_month, total_score)
            
            return {
                "status": "success",
                "age_month": age_month,
                "gender": gender,
                "sub_scores": sub_scores,
                "total_score": total_score,
                "max_score": 100,
                "percent": percentile,
                "percentile": None,
                "special_note": special_note
            }
        except Exception as e:
            return {"status": "error", "message": f"计分失败：{str(e)}"}