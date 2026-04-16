from typing import Dict, List, Optional


def _to_int(value: Optional[object]) -> Optional[int]:
    if value is None:
        return None

    if isinstance(value, bool):
        return int(value)

    if isinstance(value, int):
        return value

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _extract_answer(answer: object) -> tuple[str, Optional[int]]:
    if isinstance(answer, dict):
        question_id = answer.get('question_id', '')
        selected_option = _to_int(answer.get('selected_option'))
    else:
        question_id = getattr(answer, 'question_id', '')
        selected_option = _to_int(getattr(answer, 'selected_option', None))

    return question_id, selected_option


def _get_level(percent: float) -> str:
    if percent >= 85:
        return '优势明显'
    if percent >= 70:
        return '发展良好'
    if percent >= 55:
        return '稳步提升'
    return '重点关注'


def _build_dimension_result(dimension: str, score: float, max_score: float) -> Dict:
    percent = round((score / max_score) * 100, 2) if max_score > 0 else 0
    return {
      'dimension': dimension,
      'score': round(score, 2),
      'max_score': max_score,
      'percent': percent,
      'level': _get_level(percent)
    }


class InteractionQualityScoringAlgorithm:
    QUESTION_DIMENSIONS = {
        'PIQ_01': '回应性',
        'PIQ_02': '亲密性',
        'PIQ_03': '回应性',
        'PIQ_04': '引导性',
        'PIQ_05': '引导性',
        'PIQ_06': '回应性',
        'PIQ_07': '引导性',
        'PIQ_08': '引导性',
        'PIQ_09': '回应性',
        'PIQ_10': '亲密性',
        'PIQ_11': '亲密性',
        'PIQ_12': '引导性',
        'PIQ_13': '亲密性',
        'PIQ_14': '亲密性',
        'PIQ_15': '引导性',
        'PIQ_16': '亲密性',
        'PIQ_17': '引导性',
        'PIQ_18': '回应性',
        'PIQ_19': '引导性',
        'PIQ_20': '回应性'
    }

    REVERSE_QUESTIONS = {'PIQ_06', 'PIQ_10', 'PIQ_13', 'PIQ_15', 'PIQ_17'}
    DIMENSION_ORDER = ['引导性', '亲密性', '回应性']
    MAX_SCORE = 100

    def calculate_score(self, answers: List[object]) -> Dict:
        dimension_totals = {
            '引导性': 0,
            '亲密性': 0,
            '回应性': 0
        }

        for answer in answers:
            question_id, selected_option = _extract_answer(answer)
            if question_id not in self.QUESTION_DIMENSIONS or selected_option is None:
                continue

            if question_id in self.REVERSE_QUESTIONS:
                score = selected_option + 1
            else:
                score = 5 - selected_option

            dimension = self.QUESTION_DIMENSIONS[question_id]
            dimension_totals[dimension] += score

        dimension_max_scores = {
            '引导性': 40,
            '亲密性': 30,
            '回应性': 30
        }

        total_score = sum(dimension_totals.values())
        percent = round((total_score / self.MAX_SCORE) * 100, 2) if self.MAX_SCORE > 0 else 0

        return {
            'total_score': total_score,
            'max_score': self.MAX_SCORE,
            'percent': percent,
            'level': _get_level(percent),
            'dimension_scores': [
                _build_dimension_result(dimension, dimension_totals[dimension], dimension_max_scores[dimension])
                for dimension in self.DIMENSION_ORDER
            ]
        }


class LanguageEnvironmentScoringAlgorithm:
    RESOURCE_QUESTIONS = {'HLE_23', 'HLE_24'}
    ACTIVITY_QUESTIONS = {'HLE_25', 'HLE_26', 'HLE_27', 'HLE_28', 'HLE_29', 'HLE_30', 'HLE_31', 'HLE_32', 'HLE_33', 'HLE_34'}
    BELIEF_QUESTIONS = {'HLE_35', 'HLE_36', 'HLE_37', 'HLE_38', 'HLE_39', 'HLE_40', 'HLE_41', 'HLE_42', 'HLE_43', 'HLE_44', 'HLE_45'}
    REVERSE_BELIEF_QUESTIONS = {'HLE_36', 'HLE_39', 'HLE_41', 'HLE_43', 'HLE_45'}
    DIMENSION_ORDER = ['物质资源', '语言文化活动', '家长语言教育观念']
    DIMENSION_MAX = {
        '物质资源': 10,
        '语言文化活动': 47,
        '家长语言教育观念': 55
    }
    MAX_SCORE = 112

    def calculate_score(self, answers: List[object]) -> Dict:
        dimension_totals = {
            '物质资源': 0,
            '语言文化活动': 0,
            '家长语言教育观念': 0
        }

        for answer in answers:
            question_id, selected_option = _extract_answer(answer)
            if question_id == '' or selected_option is None:
                continue

            if question_id in self.RESOURCE_QUESTIONS:
                score = selected_option + 1
                dimension_totals['物质资源'] += score
            elif question_id in self.ACTIVITY_QUESTIONS:
                if question_id == 'HLE_34':
                    score_map = [0, 2, 1]
                    if 0 <= selected_option < len(score_map):
                        score = score_map[selected_option]
                    else:
                        score = 0
                else:
                    score = selected_option + 1
                dimension_totals['语言文化活动'] += score
            elif question_id in self.BELIEF_QUESTIONS:
                if question_id in self.REVERSE_BELIEF_QUESTIONS:
                    score = 5 - selected_option
                else:
                    score = selected_option + 1
                dimension_totals['家长语言教育观念'] += score

        total_score = sum(dimension_totals.values())
        percent = round((total_score / self.MAX_SCORE) * 100, 2) if self.MAX_SCORE > 0 else 0

        return {
            'total_score': total_score,
            'max_score': self.MAX_SCORE,
            'percent': percent,
            'level': _get_level(percent),
            'dimension_scores': [
                _build_dimension_result(dimension, dimension_totals[dimension], self.DIMENSION_MAX[dimension])
                for dimension in self.DIMENSION_ORDER
            ]
        }
