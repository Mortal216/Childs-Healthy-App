#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据初始化脚本
- 导入PCDI量表数据
- 添加默认干预任务
"""

import json
import asyncio
import sys
from datetime import datetime
from pathlib import Path

# 添加 backend 目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.scale import Scale, Question
from app.models.task import InterventionTask
from app.config import settings


async def init_pcdi_data(db_session: AsyncSession):
    """导入PCDI量表数据"""
    print("开始导入PCDI量表数据...")
    
    # 读取PCDI.json文件
    pcdi_file = Path(__file__).parent.parent / "PCDI.json"
    if not pcdi_file.exists():
        print(f"错误：PCDI.json文件不存在: {pcdi_file}")
        return
    
    with open(pcdi_file, 'r', encoding='utf-8') as f:
        pcdi_data = json.load(f)
    
    # 导入量表数据
    scale_meta = pcdi_data.get('scale_meta', {})
    long_forms = pcdi_data.get('long_form', [])
    short_forms = pcdi_data.get('short_form', [])
    
    # 添加长表
    for long_form in long_forms:
        scale_type = long_form.get('scale_type')
        scale_name = long_form.get('scale_name')
        applicable_age = long_form.get('applicable_age')
        
        # 解析适用年龄范围
        age_range = applicable_age.split('~')
        min_age = int(age_range[0])
        max_age = int(age_range[1].replace('个月', ''))
        
        # 创建量表记录
        scale = Scale(
            scale_id=f"PCDI_{scale_type.upper()}",
            scale_name=scale_name,
            scale_type=scale_type,
            min_age=min_age,
            max_age=max_age,
            total_questions=0,  # 后续计算
            estimated_duration=30,  # 估计时长（分钟）
            dimensions=scale_meta.get('description', ''),
            scoring_rules=pcdi_data.get('score_rules_summary', {}),
            norm_data={}
        )
        
        db_session.add(scale)
        await db_session.flush()
        
        # 计算总问题数
        total_questions = 0
        
        # 导入问题
        for module in long_form.get('modules', []):
            for item in module.get('items', []):
                question_id = item.get('item_id')
                question_content = item.get('item_content')
                question_type = item.get('item_type')
                options = item.get('options', [])
                score_rule = item.get('score_rule', '')
                
                # 创建问题记录
                question = Question(
                    question_id=question_id,
                    scale_id=scale.scale_id,
                    age_group=applicable_age,
                    question_type=question_type,
                    question=question_content,
                    image_url=None,
                    audio_url=None,
                    options=options,
                    dimension=module.get('module_name', ''),
                    weight=1.0,
                    time_limit=60,  # 每题时间限制（秒）
                    required=True
                )
                
                db_session.add(question)
                total_questions += 1
        
        # 更新量表总问题数
        scale.total_questions = total_questions
    
    # 添加短表
    for short_form in short_forms:
        scale_type = short_form.get('scale_type')
        scale_name = short_form.get('scale_name')
        applicable_age = short_form.get('applicable_age')
        
        # 解析适用年龄范围
        age_range = applicable_age.split('~')
        min_age = int(age_range[0])
        max_age = int(age_range[1].replace('个月', ''))
        
        # 创建量表记录
        scale = Scale(
            scale_id=f"PCDI_{scale_type.upper()}",
            scale_name=scale_name,
            scale_type=scale_type,
            min_age=min_age,
            max_age=max_age,
            total_questions=0,  # 后续计算
            estimated_duration=15,  # 估计时长（分钟）
            dimensions=scale_meta.get('description', ''),
            scoring_rules=pcdi_data.get('score_rules_summary', {}),
            norm_data={}
        )
        
        db_session.add(scale)
        await db_session.flush()
        
        # 计算总问题数
        total_questions = 0
        
        # 导入问题
        for module in short_form.get('modules', []):
            for item in module.get('items', []):
                question_id = item.get('item_id')
                question_content = item.get('item_content')
                question_type = item.get('item_type')
                options = item.get('options', [])
                score_rule = item.get('score_rule', '')
                
                # 创建问题记录
                question = Question(
                    question_id=question_id,
                    scale_id=scale.scale_id,
                    age_group=applicable_age,
                    question_type=question_type,
                    question=question_content,
                    image_url=None,
                    audio_url=None,
                    options=options,
                    dimension=module.get('module_name', ''),
                    weight=1.0,
                    time_limit=30,  # 每题时间限制（秒）
                    required=True
                )
                
                db_session.add(question)
                total_questions += 1
        
        # 更新量表总问题数
        scale.total_questions = total_questions
    
    # 添加亲子互动质量分析量表
    interaction_scale = Scale(
        scale_id="PCDI_INTERACTION_QUALITY",
        scale_name="亲子互动质量分析",
        scale_type="pcdi",
        min_age=0,
        max_age=30,
        total_questions=5,
        estimated_duration=10,
        dimensions="互动频率、互动质量、情感表达",
        scoring_rules={"method": "5-point scale", "max_score": 100},
        norm_data={}
    )
    db_session.add(interaction_scale)
    await db_session.flush()
    
    # 添加亲子互动质量分析问题
    interaction_questions = [
        {
            "question_id": "IQ_001",
            "question": "您每天与孩子进行高质量互动的时间大约有多少？",
            "options": [
                {"text": "很少（少于30分钟）", "value": 0},
                {"text": "一般（30分钟-1小时）", "value": 1},
                {"text": "较多（1-2小时）", "value": 2},
                {"text": "很多（2小时以上）", "value": 3}
            ],
            "dimension": "互动频率"
        },
        {
            "question_id": "IQ_002",
            "question": "在与孩子互动时，您会主动回应孩子的语言和行为吗？",
            "options": [
                {"text": "很少回应", "value": 0},
                {"text": "偶尔回应", "value": 1},
                {"text": "经常回应", "value": 2},
                {"text": "总是回应", "value": 3}
            ],
            "dimension": "互动质量"
        },
        {
            "question_id": "IQ_003",
            "question": "您会与孩子进行双向交流，鼓励孩子表达自己的想法吗？",
            "options": [
                {"text": "很少", "value": 0},
                {"text": "偶尔", "value": 1},
                {"text": "经常", "value": 2},
                {"text": "总是", "value": 3}
            ],
            "dimension": "互动质量"
        },
        {
            "question_id": "IQ_004",
            "question": "您会通过拥抱、亲吻等方式向孩子表达爱意吗？",
            "options": [
                {"text": "很少", "value": 0},
                {"text": "偶尔", "value": 1},
                {"text": "经常", "value": 2},
                {"text": "总是", "value": 3}
            ],
            "dimension": "情感表达"
        },
        {
            "question_id": "IQ_005",
            "question": "在与孩子互动时，您会保持耐心和积极的态度吗？",
            "options": [
                {"text": "很少", "value": 0},
                {"text": "偶尔", "value": 1},
                {"text": "经常", "value": 2},
                {"text": "总是", "value": 3}
            ],
            "dimension": "情感表达"
        }
    ]
    
    for q_data in interaction_questions:
        question = Question(
            question_id=q_data["question_id"],
            scale_id=interaction_scale.scale_id,
            age_group="0~30个月",
            question_type="single_choice",
            question=q_data["question"],
            image_url=None,
            audio_url=None,
            options=q_data["options"],
            dimension=q_data["dimension"],
            weight=1.0,
            time_limit=60,
            required=True
        )
        db_session.add(question)
    
    # 添加家庭语言环境分析量表
    environment_scale = Scale(
        scale_id="PCDI_LANGUAGE_ENVIRONMENT",
        scale_name="家庭语言环境分析",
        scale_type="pcdi",
        min_age=0,
        max_age=30,
        total_questions=5,
        estimated_duration=10,
        dimensions="语言输入、阅读环境、语言刺激",
        scoring_rules={"method": "5-point scale", "max_score": 100},
        norm_data={}
    )
    db_session.add(environment_scale)
    await db_session.flush()
    
    # 添加家庭语言环境分析问题
    environment_questions = [
        {
            "question_id": "LE_001",
            "question": "您每天与孩子说话的时间大约有多少？",
            "options": [
                {"text": "很少（少于1小时）", "value": 0},
                {"text": "一般（1-3小时）", "value": 1},
                {"text": "较多（3-6小时）", "value": 2},
                {"text": "很多（6小时以上）", "value": 3}
            ],
            "dimension": "语言输入"
        },
        {
            "question_id": "LE_002",
            "question": "您会使用丰富多样的词汇与孩子交流吗？",
            "options": [
                {"text": "很少", "value": 0},
                {"text": "偶尔", "value": 1},
                {"text": "经常", "value": 2},
                {"text": "总是", "value": 3}
            ],
            "dimension": "语言输入"
        },
        {
            "question_id": "LE_003",
            "question": "您会每天给孩子阅读绘本或讲故事吗？",
            "options": [
                {"text": "很少", "value": 0},
                {"text": "偶尔", "value": 1},
                {"text": "经常", "value": 2},
                {"text": "总是", "value": 3}
            ],
            "dimension": "阅读环境"
        },
        {
            "question_id": "LE_004",
            "question": "您会鼓励孩子模仿和使用语言吗？",
            "options": [
                {"text": "很少", "value": 0},
                {"text": "偶尔", "value": 1},
                {"text": "经常", "value": 2},
                {"text": "总是", "value": 3}
            ],
            "dimension": "语言刺激"
        },
        {
            "question_id": "LE_005",
            "question": "您会为孩子创造丰富的语言学习机会吗？",
            "options": [
                {"text": "很少", "value": 0},
                {"text": "偶尔", "value": 1},
                {"text": "经常", "value": 2},
                {"text": "总是", "value": 3}
            ],
            "dimension": "语言刺激"
        }
    ]
    
    for q_data in environment_questions:
        question = Question(
            question_id=q_data["question_id"],
            scale_id=environment_scale.scale_id,
            age_group="0~30个月",
            question_type="single_choice",
            question=q_data["question"],
            image_url=None,
            audio_url=None,
            options=q_data["options"],
            dimension=q_data["dimension"],
            weight=1.0,
            time_limit=60,
            required=True
        )
        db_session.add(question)
    
    # 提交所有更改
    await db_session.commit()
    print("PCDI量表数据导入完成！")


async def init_intervention_tasks(db_session: AsyncSession):
    """导入默认干预任务"""
    print("开始导入默认干预任务...")
    
    # 默认干预任务数据
    default_tasks = [
        {
            "task_id": "TASK_001",
            "title": "亲子共读时间",
            "description": "每天固定时间与宝宝一起阅读绘本，培养语言理解能力",
            "task_type": "language",
            "difficulty": "easy",
            "duration": 15,
            "frequency": "daily",
            "target_dimensions": ["词汇理解", "语言表达"],
            "age_range": {"min": 8, "max": 30},
            "content": {
                "steps": [
                    "选择适合宝宝年龄的绘本",
                    "用生动的语调朗读",
                    "鼓励宝宝参与互动",
                    "重复关键词汇"
                ],
                "tips": "保持阅读环境安静，避免干扰"
            },
            "action_items": [
                "准备5-10本适合的绘本",
                "每天固定在同一时间进行",
                "记录宝宝的反应和进步"
            ],
            "expected_improvement": "词汇量增加，语言理解能力提升",
            "time_to_effect": "2-4周",
            "popularity": 4.8
        },
        {
            "task_id": "TASK_002",
            "title": "日常对话练习",
            "description": "在日常生活中与宝宝进行更多对话，扩展语言环境",
            "task_type": "language",
            "difficulty": "easy",
            "duration": 10,
            "frequency": "daily",
            "target_dimensions": ["语言表达", "社交沟通"],
            "age_range": {"min": 8, "max": 30},
            "content": {
                "steps": [
                    "描述正在做的事情",
                    "询问宝宝的意见",
                    "鼓励宝宝用语言表达需求",
                    "回应宝宝的每一次尝试"
                ],
                "tips": "保持耐心，给予宝宝足够的回应时间"
            },
            "action_items": [
                "在穿衣、吃饭时与宝宝对话",
                "使用简单明了的语言",
                "重复宝宝的发音并纠正"
            ],
            "expected_improvement": "语言表达能力提升，沟通意愿增强",
            "time_to_effect": "1-2周",
            "popularity": 4.7
        },
        {
            "task_id": "TASK_003",
            "title": "词汇扩展游戏",
            "description": "通过游戏的方式帮助宝宝学习新词汇",
            "task_type": "language",
            "difficulty": "medium",
            "duration": 20,
            "frequency": "weekly",
            "target_dimensions": ["词汇理解", "词汇表达"],
            "age_range": {"min": 12, "max": 30},
            "content": {
                "steps": [
                    "选择一个主题（如动物、食物）",
                    "展示相关图片或实物",
                    "说出词汇并鼓励宝宝重复",
                    "进行简单的问答游戏"
                ],
                "tips": "使用卡片或实物增强视觉效果"
            },
            "action_items": [
                "准备相关主题的卡片或实物",
                "设计简单的游戏规则",
                "记录宝宝学会的新词汇"
            ],
            "expected_improvement": "词汇量显著增加，语言表达更丰富",
            "time_to_effect": "3-5周",
            "popularity": 4.5
        },
        {
            "task_id": "TASK_004",
            "title": "句子构建练习",
            "description": "帮助宝宝从单词过渡到简单句子",
            "task_type": "language",
            "difficulty": "medium",
            "duration": 15,
            "frequency": "biweekly",
            "target_dimensions": ["句子表达", "语法理解"],
            "age_range": {"min": 16, "max": 30},
            "content": {
                "steps": [
                    "从简单的双词句开始",
                    "逐渐扩展为三词句",
                    "鼓励宝宝模仿完整句子",
                    "纠正语法错误但保持鼓励"
                ],
                "tips": "使用日常生活场景进行练习"
            },
            "action_items": [
                "准备常用的句子模板",
                "在实际场景中引导宝宝",
                "记录宝宝的句子发展"
            ],
            "expected_improvement": "句子表达能力提升，语法使用更准确",
            "time_to_effect": "4-6周",
            "popularity": 4.3
        },
        {
            "task_id": "TASK_005",
            "title": "故事创编活动",
            "description": "鼓励宝宝参与故事的创编，培养想象力和语言表达能力",
            "task_type": "language",
            "difficulty": "hard",
            "duration": 25,
            "frequency": "weekly",
            "target_dimensions": ["语言表达", "想象力", "逻辑思维"],
            "age_range": {"min": 20, "max": 30},
            "content": {
                "steps": [
                    "从熟悉的故事开始",
                    "鼓励宝宝续编结尾",
                    "逐渐让宝宝主导故事发展",
                    "用绘画或表演的方式呈现故事"
                ],
                "tips": "不要限制宝宝的想象力，给予积极反馈"
            },
            "action_items": [
                "准备故事开始的线索",
                "提供绘画工具或道具",
                "记录宝宝创编的故事"
            ],
            "expected_improvement": "语言表达更丰富，想象力和创造力提升",
            "time_to_effect": "6-8周",
            "popularity": 4.2
        }
    ]
    
    # 导入任务数据
    for task_data in default_tasks:
        task = InterventionTask(
            task_id=task_data['task_id'],
            title=task_data['title'],
            description=task_data['description'],
            task_type=task_data['task_type'],
            difficulty=task_data['difficulty'],
            duration=task_data['duration'],
            frequency=task_data['frequency'],
            target_dimensions=task_data['target_dimensions'],
            age_range=task_data['age_range'],
            content=task_data['content'],
            action_items=task_data['action_items'],
            expected_improvement=task_data['expected_improvement'],
            time_to_effect=task_data['time_to_effect'],
            popularity=task_data['popularity']
        )
        
        db_session.add(task)
    
    await db_session.commit()
    print("默认干预任务导入完成！")


async def init_data():
    """初始化所有基础数据"""
    print("开始初始化基础数据...")
    
    # 创建数据库引擎
    engine = create_async_engine(
        settings.database_url,
        echo=True
    )
    
    # 创建会话
    async_session = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            # 导入PCDI量表数据
            await init_pcdi_data(session)
            
            # 导入默认干预任务
            await init_intervention_tasks(session)
            
            await session.commit()
            print("\n🎉 基础数据初始化成功！")
            print("\n已导入的内容：")
            print("1. PCDI量表完整数据（长表和短表）")
            print("2. 5个默认干预任务")
            
        except Exception as e:
            print(f"\n❌ 初始化失败：{str(e)}")
            await session.rollback()
        finally:
            await session.close()
    
    # 关闭引擎
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_data())
