#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
导入抚养方式测评量表到 MySQL 数据库
"""

import asyncio
import json
import aiomysql
from datetime import datetime

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'db': 'yiya_db',
    'charset': 'utf8mb4',
    'cursorclass': aiomysql.DictCursor
}

# 抚养方式测评题目数据
SCALE_DATA = {
    "scale_id": "PARENTING_STYLE",
    "scale_name": "抚养方式测评",
    "scale_type": "parenting",
    "min_age": 0,
    "max_age": 36,
    "questions": [
        {
            "question_id": "PARENTING_001",
            "question": "主要由谁负责照顾孩子的日常起居（饮食、洗漱、睡眠）？",
            "dimension": "主要抚养人",
            "options": ["妈妈", "爸爸", "祖辈（爷爷奶奶/外公外婆）", "保姆/托育机构"],
            "scores": [1, 2, 3, 4]
        },
        {
            "question_id": "PARENTING_002",
            "question": "每天陪伴孩子进行互动游戏/亲子阅读的时间大概是多久？",
            "dimension": "陪伴时间",
            "options": ["少于30分钟", "30分钟-1小时", "1小时以上"],
            "scores": [1, 2, 3]
        },
        {
            "question_id": "PARENTING_003",
            "question": "孩子哭闹/发脾气时，主要采用哪种应对方式？",
            "dimension": "情绪应对",
            "options": ["耐心安抚，了解需求", "暂时不理会，等情绪平复", "批评/制止，要求立刻安静", "满足所有要求，快速哄好"],
            "scores": [4, 2, 1, 3]
        },
        {
            "question_id": "PARENTING_004",
            "question": "是否会有意识地引导孩子自主完成简单事务（如自己吃饭、穿袜子）？",
            "dimension": "自主性培养",
            "options": ["总是，刻意引导", "偶尔，看情况", "很少，怕孩子做不好"],
            "scores": [3, 2, 1]
        },
        {
            "question_id": "PARENTING_005",
            "question": "日常抚养中，更倾向于哪种教育理念？",
            "dimension": "教育理念",
            "options": ["自由探索，不过多干预", "严格要求，建立规则", "顺其自然，快乐就好", "科学引导，全面发展"],
            "scores": [3, 2, 2, 4]
        }
    ]
}

async def import_fuyang_scale():
    """导入抚养方式测评量表"""
    
    print("=" * 70)
    print("开始导入抚养方式测评量表")
    print("=" * 70)
    
    async with aiomysql.create_pool(**DB_CONFIG) as pool:
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                scale_id = SCALE_DATA["scale_id"]
                
                # 1. 删除已存在的量表和题目
                print("\n1. 清理旧数据...")
                await cursor.execute("DELETE FROM questions WHERE scale_id = %s", (scale_id,))
                await cursor.execute("DELETE FROM scales WHERE scale_id = %s", (scale_id,))
                
                # 2. 插入量表基本信息
                print("\n2. 插入量表基本信息...")
                scoring_rules = {
                    "type": "parenting_style",
                    "dimensions": {
                        "主要抚养人": {"weight": 0.2},
                        "陪伴时间": {"weight": 0.2},
                        "情绪应对": {"weight": 0.25},
                        "自主性培养": {"weight": 0.15},
                        "教育理念": {"weight": 0.2}
                    },
                    "grading": {
                        "excellent": {"min": 16, "max": 20, "label": "科学抚养"},
                        "good": {"min": 12, "max": 15, "label": "良好抚养"},
                        "average": {"min": 8, "max": 11, "label": "一般抚养"},
                        "needs_improvement": {"min": 0, "max": 7, "label": "需要改进"}
                    }
                }
                
                await cursor.execute("""
                    INSERT INTO scales (scale_id, scale_name, scale_type, min_age, max_age, 
                                      total_questions, estimated_duration, dimensions, scoring_rules, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """, (
                    scale_id,
                    SCALE_DATA["scale_name"],
                    SCALE_DATA["scale_type"],
                    SCALE_DATA["min_age"],
                    SCALE_DATA["max_age"],
                    len(SCALE_DATA["questions"]),
                    5,
                    json.dumps(list(set(q["dimension"] for q in SCALE_DATA["questions"]))),
                    json.dumps(scoring_rules)
                ))
                print(f"   ✓ 量表已创建: {scale_id}")
                
                # 3. 插入题目
                print("\n3. 插入题目数据...")
                for q in SCALE_DATA["questions"]:
                    await cursor.execute("""
                        INSERT INTO questions (question_id, scale_id, age_group, question_type, 
                                             question, options, dimension, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    """, (
                        q["question_id"],
                        scale_id,
                        "0~36个月",
                        "single_choice",
                        q["question"],
                        json.dumps(q["options"]),
                        q["dimension"]
                    ))
                
                print(f"   ✓ 已插入 {len(SCALE_DATA['questions'])} 道题目")
                
                # 4. 验证导入结果
                print("\n4. 验证导入结果...")
                await cursor.execute("SELECT COUNT(*) as count FROM scales WHERE scale_id = %s", (scale_id,))
                scale_count = (await cursor.fetchone())['count']
                
                await cursor.execute("SELECT COUNT(*) as count FROM questions WHERE scale_id = %s", (scale_id,))
                question_count = (await cursor.fetchone())['count']
                
                print(f"   ✓ 量表数量: {scale_count}")
                print(f"   ✓ 题目数量: {question_count}")
                
                await conn.commit()
    
    print("\n" + "=" * 70)
    print("导入完成！")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(import_fuyang_scale())
