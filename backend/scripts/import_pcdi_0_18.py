#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
导入 PCDI 0-18月词汇与手势量表到 MySQL 数据库
支持甲乙丙丁结构和百分制计分
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

# JSON 文件路径
JSON_FILE = 'd:\\Environment\\engineer\\0220-0210咿呀-小程序\\Dataset\\0-18（词汇与手势）(1).json'

async def import_pcdi_scale():
    """导入 PCDI 0-18月量表"""
    
    print("=" * 70)
    print("开始导入 PCDI 0-18月词汇与手势量表")
    print("=" * 70)
    
    # 读取 JSON 文件
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"\n量表标题: {data['title']}")
    print(f"量表说明: {data['description'][:50]}...")
    
    async with aiomysql.create_pool(**DB_CONFIG) as pool:
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 1. 插入量表基本信息
                print("\n1. 插入量表基本信息...")
                
                scale_id = "PCDI_VOCAB_GESTURE_0_18"
                scale_name = data['title']
                scale_type = "pcdi_vocab_gesture"
                
                # 计算总题数
                total_questions = 0
                for section in data['sections']:
                    for subsection in section['subsections']:
                        if 'items' in subsection:
                            total_questions += len(subsection['items'])
                        elif 'categories' in subsection:
                            for category in subsection['categories']:
                                total_questions += len(category['words'])
                
                # 删除已存在的量表
                await cursor.execute("DELETE FROM questions WHERE scale_id = %s", (scale_id,))
                await cursor.execute("DELETE FROM scales WHERE scale_id = %s", (scale_id,))
                
                # 插入量表
                scoring_rules = {
                    "type": "pcdi_0_18_structure",
                    "sections": {
                        "A": {"name": "初期对语言的反应", "weight": 10, "max_score": 30},
                        "B": {"name": "听短句", "weight": 15, "max_score": 54},
                        "C": {"name": "开始说话的方式", "weight": 15, "max_score": 12},
                        "D": {"name": "词汇量表", "weight": 60, "max_score": 792}
                    },
                    "grading": {
                        "A": {"type": "binary", "options": ["没有", "有"], "scores": [0, 10]},
                        "B": {"type": "binary", "options": ["听不懂", "听懂"], "scores": [0, 2]},
                        "C": {"type": "ternary", "options": ["从不", "有时", "经常"], "scores": [0, 1, 3]},
                        "D": {"type": "vocabulary", "options": ["不懂", "听懂", "能说"], "scores": [0, 1, 2]}
                    },
                    "total_max_score": 888,
                    "percentile_ranges": {
                        "excellent": {"min": 85, "max": 100, "percentile": 90},
                        "good": {"min": 70, "max": 84, "percentile": 75},
                        "average": {"min": 50, "max": 69, "percentile": 50},
                        "below_average": {"min": 30, "max": 49, "percentile": 25},
                        "concern": {"min": 0, "max": 29, "percentile": 10}
                    }
                }
                
                await cursor.execute("""
                    INSERT INTO scales (scale_id, scale_name, scale_type, min_age, max_age, 
                                      total_questions, estimated_duration, dimensions, scoring_rules, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """, (
                    scale_id,
                    scale_name,
                    scale_type,
                    0,  # min_age (月)
                    18,  # max_age (月)
                    total_questions,
                    30,  # estimated_duration (分钟)
                    json.dumps(["语言理解", "语言表达", "手势沟通"]),
                    json.dumps(scoring_rules)
                ))
                
                print(f"   ✓ 量表已创建: {scale_id}")
                print(f"   ✓ 总题数: {total_questions}")
                
                # 2. 插入题目
                print("\n2. 插入题目数据...")
                question_count = 0
                
                for section in data['sections']:
                    section_id = section['id']
                    section_title = section['title']
                    
                    for subsection in section['subsections']:
                        subsection_id = subsection['id']
                        subsection_title = subsection['title']
                        subsection_type = subsection.get('type', 'multiple_choice')
                        options = subsection.get('options', [])
                        
                        # 处理 part1 的甲、乙、丙部分（有 items）
                        if section_id == 'part1' and 'items' in subsection:
                            for item in subsection['items']:
                                question_count += 1
                                question_id = f"{scale_id}_{section_id}_{subsection_id}_{item['id']:03d}"
                                
                                question_text = item['text']
                                if subsection_id == 'A':
                                    dimension = "初期对语言的反应"
                                elif subsection_id == 'B':
                                    dimension = "听短句理解"
                                elif subsection_id == 'C':
                                    dimension = "开始说话的方式"
                                else:
                                    dimension = "其他"
                                
                                await cursor.execute("""
                                    INSERT INTO questions (question_id, scale_id, age_group, 
                                                         question_type, question, options, 
                                                         dimension, weight, required, created_at, updated_at)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                                """, (
                                    question_id,
                                    scale_id,
                                    "0~18个月",
                                    subsection_type,
                                    question_text,
                                    json.dumps(options),
                                    dimension,
                                    1.0,
                                    True
                                ))
                        
                        # 处理 part1 的丁部分（词汇量表，有 categories）
                        elif section_id == 'part1' and 'categories' in subsection:
                            for category in subsection['categories']:
                                category_id = category['id']
                                category_title = category['title']
                                
                                if 'words' in category:
                                    for word_item in category['words']:
                                        question_count += 1
                                        word = word_item['word']
                                        question_id = f"{scale_id}_{section_id}_{subsection_id}_CAT{category_id}_{question_count:04d}"
                                        
                                        await cursor.execute("""
                                            INSERT INTO questions (question_id, scale_id, age_group, 
                                                                 question_type, question, options, 
                                                                 dimension, weight, required, created_at, updated_at)
                                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                                        """, (
                                            question_id,
                                            scale_id,
                                            "0~18个月",
                                            "vocabulary",
                                            word,
                                            json.dumps(["不懂", "听懂", "能说"]),
                                            f"词汇量表-{category_title}",
                                            1.0,
                                            True
                                        ))
                        
                        # 处理 part2（动作及手势）
                        elif section_id == 'part2' and 'items' in subsection:
                            for item in subsection['items']:
                                question_count += 1
                                question_id = f"{scale_id}_{section_id}_{subsection_id}_{item['id']:03d}"
                                
                                # part2 的 dimension 映射
                                dimension_map = {
                                    'A': '动作及手势-初期沟通手势',
                                    'B': '动作及手势-游戏和常做的事',
                                    'C': '动作及手势-动作',
                                    'D': '动作及手势-模仿做父母',
                                    'E': '动作及手势-模仿成人的动作'
                                }
                                dimension = dimension_map.get(subsection_id, '动作及手势')
                                
                                await cursor.execute("""
                                    INSERT INTO questions (question_id, scale_id, age_group, 
                                                         question_type, question, options, 
                                                         dimension, weight, required, created_at, updated_at)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                                """, (
                                    question_id,
                                    scale_id,
                                    "0~18个月",
                                    subsection_type,
                                    item['text'],
                                    json.dumps(options),
                                    dimension,
                                    1.0,
                                    True
                                ))
                
                print(f"   ✓ 已插入 {question_count} 道题目")
                
                # 3. 验证导入结果
                print("\n3. 验证导入结果...")
                await cursor.execute("SELECT COUNT(*) as count FROM scales WHERE scale_id = %s", (scale_id,))
                scale_count = await cursor.fetchone()
                
                await cursor.execute("SELECT COUNT(*) as count FROM questions WHERE scale_id = %s", (scale_id,))
                question_count_db = await cursor.fetchone()
                
                print(f"   ✓ 量表数量: {scale_count['count']}")
                print(f"   ✓ 题目数量: {question_count_db['count']}")
                
                # 4. 查询题目示例
                print("\n4. 查询题目分布...")
                await cursor.execute("""
                    SELECT dimension, COUNT(*) as count 
                    FROM questions 
                    WHERE scale_id = %s 
                    GROUP BY dimension
                    ORDER BY dimension
                """, (scale_id,))
                
                dimensions = await cursor.fetchall()
                print("   题目分布:")
                for dim in dimensions:
                    print(f"     - {dim['dimension']}: {dim['count']} 题")
                
                await conn.commit()
                print("\n" + "=" * 70)
                print("导入完成！")
                print("=" * 70)

if __name__ == '__main__':
    asyncio.run(import_pcdi_scale())
