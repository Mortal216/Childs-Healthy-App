"""
算法功能测试脚本

测试所有实现的算法功能
"""
import sys
from pathlib import Path

# 添加 backend 目录到 Python 路径
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from datetime import datetime
from app.algorithms import AlgorithmEngine


def print_section(title):
    """打印测试章节标题"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def print_result(result, title=""):
    """打印测试结果"""
    if title:
        print(f"\n{title}:")
    print(result)


def test_all_algorithms():
    """测试所有算法"""
    
    print_section("算法功能测试")
    
    # 创建算法引擎
    engine = AlgorithmEngine()
    
    # 准备测试数据
    user_profile = {
        "age_months": 24,
        "development_level": "average",
        "weaknesses": ["language"],
        "strengths": ["cognition"]
    }
    
    assessment_history = [
        {
            "total_score": 65,
            "dimension_scores": {
                "language": {"score": 60},
                "cognition": {"score": 70},
                "motor": {"score": 65}
            },
            "age_months": 18,
            "created_at": datetime(2024, 1, 1)
        },
        {
            "total_score": 70,
            "dimension_scores": {
                "language": {"score": 65},
                "cognition": {"score": 75},
                "motor": {"score": 70}
            },
            "age_months": 21,
            "created_at": datetime(2024, 2, 1)
        },
        {
            "total_score": 75,
            "dimension_scores": {
                "language": {"score": 70},
                "cognition": {"score": 80},
                "motor": {"score": 75}
            },
            "age_months": 24,
            "created_at": datetime(2024, 3, 1)
        }
    ]
    
    learning_history = [
        {
            "category": "language",
            "difficulty": 2,
            "duration": 20,
            "completion_rate": 0.8,
            "rating": 4,
            "start_time": datetime(2024, 1, 1, 10, 0),
            "engagement_score": 0.7
        },
        {
            "category": "cognition",
            "difficulty": 2,
            "duration": 20,
            "completion_rate": 0.9,
            "rating": 5,
            "start_time": datetime(2024, 1, 3, 14, 0),
            "engagement_score": 0.8
        },
        {
            "category": "motor",
            "difficulty": 1,
            "duration": 15,
            "completion_rate": 0.7,
            "rating": 3,
            "start_time": datetime(2024, 1, 5, 9, 0),
            "engagement_score": 0.6
        }
    ]
    
    current_assessment = {
        "total_score": 75,
        "dimension_scores": {
            "language": {"score": 70},
            "cognition": {"score": 80},
            "motor": {"score": 75}
        },
        "age_months": 24,
        "created_at": datetime(2024, 4, 1)
    }
    
    # 测试 A04: 测评趋势分析算法
    print_section("A04: 测评趋势分析算法")
    trend_result = engine.analyze_trend(assessment_history)
    print_result(trend_result, "总分趋势分析")
    
    multi_trend_result = engine.analyze_multi_dimension_trend(assessment_history)
    print_result(multi_trend_result, "多维度趋势分析")
    
    # 测试 A06: 发展趋势预测算法
    print_section("A06: 发展趋势预测算法")
    prediction_result = engine.predict_development(
        assessment_history,
        current_age_months=24,
        predict_months=6
    )
    print_result(prediction_result, "整体发展预测")
    
    multi_prediction_result = engine.predict_multi_domain_development(
        assessment_history,
        current_age_months=24,
        predict_months=6
    )
    print_result(multi_prediction_result, "多领域发展预测")
    
    # 测试 A07: 异常检测算法
    print_section("A07: 异常检测算法")
    anomaly_result = engine.detect_anomalies(
        assessment_history[:-1],
        current_assessment
    )
    print_result(anomaly_result, "异常检测结果")
    
    # 测试 A08: 同龄对比算法
    print_section("A08: 同龄对比算法")
    comparison_result = engine.compare_with_peers(current_assessment, 24)
    print_result(comparison_result, "同龄对比分析")
    
    # 测试 A12: 内容推荐算法
    print_section("A12: 内容推荐算法")
    content_result = engine.recommend_content(
        current_assessment,
        age_months=24,
        num_recommendations=3
    )
    print_result(content_result, "内容推荐")
    
    category_result = engine.recommend_by_category(
        current_assessment,
        age_months=24,
        category="language",
        num_recommendations=2
    )
    print_result(category_result, "按类别推荐（语言）")
    
    # 测试 A13: 个性化推荐算法
    print_section("A13: 个性化推荐算法")
    personalized_result = engine.recommend_personalized(
        user_profile,
        learning_history,
        assessment_history,
        num_recommendations=3
    )
    print_result(personalized_result, "个性化推荐")
    
    # 测试 A15: 任务难度匹配算法
    print_section("A15: 任务难度匹配算法")
    difficulty_result = engine.match_difficulty(
        user_profile,
        learning_history,
        current_assessment
    )
    print_result(difficulty_result, "难度匹配")
    
    task_result = {
        "success_rate": 0.85,
        "time_spent": 15,
        "engagement": 0.9
    }
    adjustment_result = engine.get_difficulty_adjustment_suggestion(task_result, 2)
    print_result(adjustment_result, "难度调整建议")
    
    # 测试 A18: 测评数据分析算法
    print_section("A18: 测评数据分析算法")
    analysis_result = engine.analyze_assessment_data(
        assessment_history,
        user_profile
    )
    print_result(analysis_result, "测评数据分析")
    
    # 测试综合分析
    print_section("综合分析")
    comprehensive_result = engine.run_comprehensive_analysis(
        user_profile=user_profile,
        assessment_history=assessment_history,
        learning_history=learning_history,
        current_age_months=24
    )
    print_result(comprehensive_result, "综合分析结果")
    
    # 打印总结
    print_section("测试总结")
    print(f"\n执行的算法数量: {len(comprehensive_result['algorithms_executed'])}")
    print("\n执行的算法列表:")
    for algo in comprehensive_result['algorithms_executed']:
        print(f"  - {algo}")
    
    print("\n关键洞察:")
    for insight in comprehensive_result['analysis_summary']['key_insights']:
        print(f"  - {insight}")
    
    print("\n建议:")
    for rec in comprehensive_result['analysis_summary']['recommendations']:
        print(f"  - {rec}")
    
    print(f"\n整体状态: {comprehensive_result['analysis_summary']['overall_status']}")
    
    print("\n" + "=" * 80)
    print("  所有算法测试完成！")
    print("=" * 80)


if __name__ == "__main__":
    test_all_algorithms()