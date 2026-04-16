#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查 PCDI 0-18月量表的题目数据
"""

import asyncio
import aiomysql

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

async def check_questions():
    """检查题目数据"""
    
    print("=" * 70)
    print("检查 PCDI 0-18月量表题目数据")
    print("=" * 70)
    
    async with aiomysql.create_pool(**DB_CONFIG) as pool:
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 1. 检查量表是否存在
                print("\n1. 检查量表信息...")
                await cursor.execute("""
                    SELECT scale_id, scale_name, total_questions 
                    FROM scales 
                    WHERE scale_id = 'PCDI_VOCAB_GESTURE_0_18'
                """)
                scale = await cursor.fetchone()
                
                if scale:
                    print(f"   ✓ 量表存在: {scale['scale_name']}")
                    print(f"   ✓ 总题数: {scale['total_questions']}")
                else:
                    print("   ✗ 量表不存在")
                    return
                
                # 2. 检查题目总数
                print("\n2. 检查题目总数...")
                await cursor.execute("""
                    SELECT COUNT(*) as count 
                    FROM questions 
                    WHERE scale_id = 'PCDI_VOCAB_GESTURE_0_18'
                """)
                result = await cursor.fetchone()
                print(f"   ✓ 题目总数: {result['count']}")
                
                # 3. 检查各 dimension 的题目数量
                print("\n3. 检查各 dimension 的题目分布...")
                await cursor.execute("""
                    SELECT dimension, COUNT(*) as count 
                    FROM questions 
                    WHERE scale_id = 'PCDI_VOCAB_GESTURE_0_18'
                    GROUP BY dimension
                    ORDER BY count DESC
                """)
                dimensions = await cursor.fetchall()
                
                for dim in dimensions:
                    print(f"   - {dim['dimension']}: {dim['count']}题")
                
                # 4. 查看部分题目示例
                print("\n4. 题目示例（前10题）:")
                await cursor.execute("""
                    SELECT question_id, question, dimension, options
                    FROM questions 
                    WHERE scale_id = 'PCDI_VOCAB_GESTURE_0_18'
                    LIMIT 10
                """)
                questions = await cursor.fetchall()
                
                for q in questions:
                    print(f"   - [{q['dimension']}] {q['question'][:30]}...")
                    print(f"     选项: {q['options']}")
                
                # 5. 检查 age_group
                print("\n5. 检查 age_group 分布...")
                await cursor.execute("""
                    SELECT age_group, COUNT(*) as count 
                    FROM questions 
                    WHERE scale_id = 'PCDI_VOCAB_GESTURE_0_18'
                    GROUP BY age_group
                """)
                age_groups = await cursor.fetchall()
                
                for ag in age_groups:
                    print(f"   - {ag['age_group']}: {ag['count']}题")
    
    print("\n" + "=" * 70)
    print("检查完成")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(check_questions())
