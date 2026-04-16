import sys
from pathlib import Path


backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.algorithms.questionnaire_scoring import (  # noqa: E402
    InteractionQualityScoringAlgorithm,
    LanguageEnvironmentScoringAlgorithm,
)


def test_interaction_questionnaire_full_score():
    algorithm = InteractionQualityScoringAlgorithm()
    answers = []

    for question_id in InteractionQualityScoringAlgorithm.QUESTION_DIMENSIONS:
        if question_id in InteractionQualityScoringAlgorithm.REVERSE_QUESTIONS:
            selected_option = 4
        else:
            selected_option = 0

        answers.append({
            'question_id': question_id,
            'selected_option': selected_option
        })

    result = algorithm.calculate_score(answers)

    assert result['total_score'] == 100
    assert result['max_score'] == 100
    assert result['percent'] == 100.0
    assert [item['score'] for item in result['dimension_scores']] == [40, 30, 30]


def test_interaction_reverse_question_scores_low_when_selected_as_always():
    algorithm = InteractionQualityScoringAlgorithm()
    result = algorithm.calculate_score([
        {
            'question_id': 'PIQ_06',
            'selected_option': 0
        }
    ])

    assert result['total_score'] == 1
    assert result['dimension_scores'][-1]['score'] == 1


def test_language_environment_questionnaire_full_score():
    algorithm = LanguageEnvironmentScoringAlgorithm()
    answers = []

    for question_id in LanguageEnvironmentScoringAlgorithm.RESOURCE_QUESTIONS:
        answers.append({
            'question_id': question_id,
            'selected_option': 4
        })

    for question_id in LanguageEnvironmentScoringAlgorithm.ACTIVITY_QUESTIONS:
        answers.append({
            'question_id': question_id,
            'selected_option': 1 if question_id == 'HLE_34' else 4
        })

    for question_id in LanguageEnvironmentScoringAlgorithm.BELIEF_QUESTIONS:
        answers.append({
            'question_id': question_id,
            'selected_option': 0 if question_id in LanguageEnvironmentScoringAlgorithm.REVERSE_BELIEF_QUESTIONS else 4
        })

    result = algorithm.calculate_score(answers)

    assert result['total_score'] == 112
    assert result['max_score'] == 112
    assert result['percent'] == 100.0
    assert [item['score'] for item in result['dimension_scores']] == [10, 47, 55]


def test_language_environment_reverse_belief_question():
    algorithm = LanguageEnvironmentScoringAlgorithm()
    result = algorithm.calculate_score([
        {
            'question_id': 'HLE_36',
            'selected_option': 4
        }
    ])

    assert result['total_score'] == 1
    assert result['dimension_scores'][-1]['score'] == 1
