"""
PCDI量表测试示例

展示如何使用PCDI量表进行测评
"""
import requests
import json
import os

BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000/api/v1")

def test_pcdi_vocab_gesture():
    """
    测试：词汇和手势量表（8~16个月）
    """
    print("=== 测试：词汇和手势量表 ===")
    
    assessment_data = {
        "user_id": 1,
        "baby_id": 1,
        "scale_id": "PCDI_VG",
        "scale_name": "汉语沟通发展量表-词汇和手势",
        "age_group": "8-12",
        "age_months": 8,
        "gender": "female",
        "pcdi_type": "vocab_gesture",
        "pcdi_data": {
            "early_language": {
                "language_understanding": [1, 1, 0],
                "understand_phrases": [1]*20 + [0]*7,
                "start_speaking": [1, 2, 1, 2],
                "vocab": {
                    "understood": 150,
                    "spoken": 80
                }
            },
            "gesture": {
                "early_gesture": [1]*10 + [2]*1,
                "game_routine": [1]*4 + [0]*1,
                "interactive_action": [1]*12 + [0]*3,
                "pretend_play": [1]*3 + [0]*2,
                "imitate_adult": [1]*5 + [0]*2
            },
            "is_bilingual": False,
            "unfinished_items": 0
        },
        "test_duration": 600
    }
    
    response = requests.post(f"{BASE_URL}/assessment/submit", json=assessment_data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")

def test_pcdi_vocab_sentence():
    """
    测试：词汇和句子量表（16~30个月）
    """
    print("\n=== 测试：词汇和句子量表 ===")
    
    assessment_data = {
        "user_id": 1,
        "baby_id": 1,
        "scale_id": "PCDI_VS",
        "scale_name": "汉语沟通发展量表-词汇和句子",
        "age_group": "18-24",
        "age_months": 24,
        "gender": "male",
        "pcdi_type": "vocab_sentence",
        "pcdi_data": {
            "vocab_spoken": 300,
            "vocab_to_sentence": {
                "use_vocab": [1, 2, 1, 2, 1],
                "sentence_phrase": [1, 2, 1, 2],
                "word_combination": {
                    "is_combination": True,
                    "longest_sentences": [3, 4, 5]
                },
                "sentence_complexity": [3]*27
            },
            "is_bilingual": True,
            "unfinished_items": 2
        },
        "test_duration": 900
    }
    
    response = requests.post(f"{BASE_URL}/assessment/submit", json=assessment_data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")

def test_pcdi_short_form():
    """
    测试：短表快速筛查
    """
    print("\n=== 测试：短表快速筛查 ===")
    
    assessment_data = {
        "user_id": 1,
        "baby_id": 1,
        "scale_id": "PCDI_SF",
        "scale_name": "汉语沟通发展量表-短表",
        "age_group": "12-18",
        "age_months": 12,
        "gender": "female",
        "pcdi_type": "short_form",
        "pcdi_data": {
            "understand_phrases": [1]*5,
            "vocab_understood": 50,
            "vocab_spoken": 30
        },
        "test_duration": 300
    }
    
    response = requests.post(f"{BASE_URL}/assessment/submit", json=assessment_data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")

def test_standard_scale():
    """
    测试：标准量表（非PCDI）
    """
    print("\n=== 测试：标准量表 ===")
    
    assessment_data = {
        "user_id": 1,
        "baby_id": 1,
        "scale_id": "S01",
        "scale_name": "词汇理解量表",
        "age_group": "12-18",
        "age_months": 18,
        "gender": "female",
        "answers": [
            {
                "question_id": "S01_001",
                "selected_option": "A"
            },
            {
                "question_id": "S01_002",
                "selected_option": "B"
            }
        ],
        "test_duration": 300
    }
    
    response = requests.post(f"{BASE_URL}/assessment/submit", json=assessment_data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")

def get_assessment_history():
    """
    获取测评历史
    """
    print("\n=== 获取测评历史 ===")
    
    response = requests.get(f"{BASE_URL}/assessment/history/1")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")

def get_assessment_detail(assessment_id: int):
    """
    获取测评详情
    """
    print(f"\n=== 获取测评详情（ID: {assessment_id}） ===")
    
    response = requests.get(f"{BASE_URL}/assessment/{assessment_id}")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")

if __name__ == "__main__":
    print("PCDI量表测试示例")
    print("=" * 50)
    
    # 测试PCDI量表
    test_pcdi_vocab_gesture()
    test_pcdi_vocab_sentence()
    test_pcdi_short_form()
    
    # 测试标准量表
    test_standard_scale()
    
    # 获取历史
    get_assessment_history()
    
    print("\n" + "=" * 50)
    print("测试完成！")
