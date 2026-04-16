#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
导入 PCDI 18-30月 词汇与句子量表到数据库
"""

import json
import asyncio
import aiomysql
from datetime import datetime

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'db': 'yiya_db',
    'charset': 'utf8mb4'
}

async def import_scale():
    """导入量表数据"""
    
    # 读取JSON文件
    import os
    json_path = r'D:\Environment\engineer\0220-0210咿呀-小程序\Dataset\18-30（词汇与句子）(1).json'
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    async with aiomysql.create_pool(**DB_CONFIG) as pool:
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                
                # 1. 插入量表基本信息
                scale_id = 'PCDI_VOCAB_SENTENCE_18_30'
                scale_name = data['title']
                scale_type = 'vocabulary_sentence'
                
                # 计算总题数
                total_questions = 0
                for section in data['sections']:
                    if section.get('type') == 'vocabulary':
                        for category in section['categories']:
                            total_questions += len(category['words'])
                    elif 'subsections' in section:
                        for subsection in section['subsections']:
                            if 'items' in subsection:
                                total_questions += len(subsection['items'])
                            elif 'groups' in subsection:
                                total_questions += len(subsection['groups'])
                            elif 'question' in subsection:
                                total_questions += 1
                
                # 计分规则
                scoring_rules = {
                    'vocabulary': {
                        'part1': {
                            'description': '词汇量表',
                            'options': ['不会说', '会说'],
                            'scores': [0, 1],
                            'max_score': '动态计算'
                        }
                    },
                    'sentence': {
                        'part2': {
                            'description': '句子复杂度',
                            'subsections': {
                                'A': {
                                    'name': '小孩怎么使用词',
                                    'options': ['还没有', '有时会', '经常会'],
                                    'scores': [0, 1, 2],
                                    'max_score': 10
                                },
                                'B': {
                                    'name': '句子与语句',
                                    'options': ['还没有', '有时会', '经常会'],
                                    'scores': [0, 1, 2],
                                    'max_score': 8
                                },
                                'C': {
                                    'name': '句子组合',
                                    'type': 'special',
                                    'max_score': 2
                                },
                                'D': {
                                    'name': '复杂性',
                                    'type': 'complexity',
                                    'max_score': 27
                                }
                            }
                        }
                    }
                }
                
                dimensions = [
                    '词汇量表-象声和感叹词',
                    '词汇量表-人名',
                    '词汇量表-游戏和常做的事',
                    '词汇量表-动词',
                    '词汇量表-吃和喝的',
                    '词汇量表-身体的部分',
                    '词汇量表-动物',
                    '词汇量表-形容词和副词',
                    '词汇量表-家里的小东西',
                    '词汇量表-玩具和娱乐用品',
                    '词汇量表-衣服',
                    '词汇量表-家具、屋子等',
                    '词汇量表-户外用品',
                    '词汇量表-食物',
                    '词汇量表-蔬菜',
                    '词汇量表-水果',
                    '词汇量表-动物（户外）',
                    '词汇量表-交通工具',
                    '词汇量表-代词',
                    '词汇量表-量词',
                    '词汇量表-疑问词',
                    '句子复杂度-使用词',
                    '句子复杂度-句子与语句',
                    '句子复杂度-句子组合',
                    '句子复杂度-复杂性'
                ]
                
                await cursor.execute("""
                    INSERT INTO scales (scale_id, scale_name, scale_type, min_age, max_age, 
                                      total_questions, estimated_duration, dimensions, scoring_rules, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE
                    scale_name = VALUES(scale_name),
                    total_questions = VALUES(total_questions),
                    dimensions = VALUES(dimensions),
                    scoring_rules = VALUES(scoring_rules),
                    updated_at = NOW()
                """, (
                    scale_id,
                    scale_name,
                    scale_type,
                    18,  # min_age (月)
                    30,  # max_age (月)
                    total_questions,
                    45,  # estimated_duration (分钟)
                    json.dumps(dimensions, ensure_ascii=False),
                    json.dumps(scoring_rules, ensure_ascii=False)
                ))
                
                print(f"✅ 量表信息已导入: {scale_name}")
                print(f"   总题数: {total_questions}")
                
                # 2. 删除旧题目
                await cursor.execute("""
                    DELETE FROM questions WHERE scale_id = %s
                """, (scale_id,))
                print(f"   已清理旧题目")
                
                # 3. 插入新题目
                question_count = 0
                
                for section in data['sections']:
                    section_id = section['id']
                    
                    if section.get('type') == 'vocabulary':
                        # 第一部分：词汇量表
                        for category in section['categories']:
                            category_title = category['title']
                            dimension = f"词汇量表-{category_title.split('(')[0].strip()}"
                            
                            for word_item in category['words']:
                                question_id = f"{scale_id}_part1_cat{category['id']}_{question_count}"
                                question_text = word_item['word']
                                options = json.dumps(word_item['options'], ensure_ascii=False)
                                
                                await cursor.execute("""
                                    INSERT INTO questions 
                                    (question_id, scale_id, question, dimension, options, 
                                     question_type, age_group, created_at, updated_at)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                                """, (
                                    question_id,
                                    scale_id,
                                    question_text,
                                    dimension,
                                    options,
                                    'vocabulary',
                                    '18-30月'
                                ))
                                question_count += 1
                    
                    elif 'subsections' in section:
                        # 第二部分：句子复杂度
                        for subsection in section['subsections']:
                            subsection_id = subsection['id']
                            subsection_title = subsection['title']
                            dimension = f"句子复杂度-{subsection_title.split('.')[1].strip() if '.' in subsection_title else subsection_title}"
                            
                            if 'items' in subsection:
                                # A、B 部分：普通选择题
                                for item in subsection['items']:
                                    question_id = f"{scale_id}_part2_{subsection_id}_{item['id']}"
                                    question_text = item['text']
                                    options = json.dumps(subsection['options'], ensure_ascii=False)
                                    
                                    await cursor.execute("""
                                        INSERT INTO questions 
                                        (question_id, scale_id, question, dimension, options,
                                         question_type, age_group, created_at, updated_at)
                                        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                                    """, (
                                        question_id,
                                        scale_id,
                                        question_text,
                                        dimension,
                                        options,
                                        'multiple_choice',
                                        '18-30月'
                                    ))
                                    question_count += 1
                            
                            elif 'question' in subsection:
                                # C 部分：句子组合
                                question = subsection['question']
                                question_id = f"{scale_id}_part2_{subsection_id}_1"
                                question_text = question['text']
                                options = json.dumps(question['options'], ensure_ascii=False)
                                
                                await cursor.execute("""
                                    INSERT INTO questions 
                                    (question_id, scale_id, question, dimension, options,
                                     question_type, age_group, created_at, updated_at)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                                """, (
                                    question_id,
                                    scale_id,
                                    question_text,
                                    dimension,
                                    options,
                                    'multiple_choice',
                                    '18-30月'
                                ))
                                question_count += 1
                            
                            elif 'groups' in subsection:
                                # D 部分：复杂性
                                for group in subsection['groups']:
                                    question_id = f"{scale_id}_part2_{subsection_id}_{group['id']}"
                                    question_text = group['description']
                                    options = json.dumps(group['options'], ensure_ascii=False)
                                    
                                    await cursor.execute("""
                                        INSERT INTO questions 
                                        (question_id, scale_id, question, dimension, options,
                                         question_type, age_group, created_at, updated_at)
                                        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                                    """, (
                                        question_id,
                                        scale_id,
                                        question_text,
                                        dimension,
                                        options,
                                        'complexity',
                                        '18-30月'
                                    ))
                                    question_count += 1
                
                await conn.commit()
                print(f"✅ 题目导入完成: {question_count} 题")
                print(f"\n量表结构:")
                print(f"  - 第一部分: 词汇量表 (多个词汇分类)")
                print(f"  - 第二部分: 句子复杂度 (A-D四个小节)")

if __name__ == '__main__':
    asyncio.run(import_scale())
