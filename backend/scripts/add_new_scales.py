#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
添加新的PCDI量表数据
- 亲子互动质量分析
- 家庭语言环境分析
"""

import asyncio
import sys
from pathlib import Path

# 添加 backend 目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from app.models.base import Base
from app.models.scale import Scale, Question
from app.config import settings


async def add_new_scales(db_session: AsyncSession):
    """添加新的PCDI量表"""
    print("开始添加新的PCDI量表...")
    
    # 检查亲子互动质量分析量表是否已存在
    result = await db_session.execute(
        text("SELECT id FROM scales WHERE scale_id = 'PCDI_INTERACTION_QUALITY'")
    )
    if result.scalar_one_or_none():
        print("亲子互动质量分析量表已存在，跳过...")
    ele:
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
        
        print("亲子互动质量分析量表添加完成！")
    
    # 检查家庭语言环境分析量表是否已存在
    result = await db_session.execute(
        text("SELECT id FROM scales WHERE scale_id = 'PCDI_LANGUAGE_ENVIRONMENT'")
    )
    if result.scalar_one_or_none():
        print("家庭语言环境分析量表已存在，跳过...")
    else:
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
        
        print("家庭语言环境分析量表添加完成！")
    
    # 提交所有更改
    await db_session.commit()
    print("新的PCDI量表添加完成！")


async def main():
    """主函数"""
    # 创建数据库引擎
    engine = create_async_engine(
        settings.database_url,
        echo=False
    )
    
    # 创建会话工厂
    async_session = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    # 运行添加新量表的函数
    async with async_session() as session:
        await add_new_scales(session)
    
    # 关闭引擎
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
s