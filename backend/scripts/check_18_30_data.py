#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import asyncio
import aiomysql

DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'db': 'yiya_db',
    'charset': 'utf8mb4'
}

async def check_data():
    async with aiomysql.create_pool(**DB_CONFIG) as pool:
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # 检查量表
                print("=== 检查量表 ===")
                await cursor.execute("SELECT scale_id, scale_name, min_age, max_age FROM scales WHERE scale_id LIKE '%18_30%'")
                scales = await cursor.fetchall()
                for scale in scales:
                    print(f"  {scale['scale_id']}: {scale['scale_name']} ({scale['min_age']}-{scale['max_age']}月)")
                
                # 检查题目数量
                print("\n=== 检查题目 ===")
                await cursor.execute("SELECT COUNT(*) as count FROM questions WHERE scale_id = 'PCDI_VOCAB_SENTENCE_18_30'")
                result = await cursor.fetchone()
                print(f"  PCDI_VOCAB_SENTENCE_18_30 题目数: {result['count']}")
                
                # 检查 age_group
                print("\n=== 检查年龄组 ===")
                await cursor.execute("SELECT DISTINCT age_group FROM questions WHERE scale_id = 'PCDI_VOCAB_SENTENCE_18_30'")
                age_groups = await cursor.fetchall()
                for ag in age_groups:
                    print(f"  {ag['age_group']}")
                
                # 检查各维度题目数
                print("\n=== 各维度题目数 ===")
                await cursor.execute("""
                    SELECT dimension, COUNT(*) as count 
                    FROM questions 
                    WHERE scale_id = 'PCDI_VOCAB_SENTENCE_18_30'
                    GROUP BY dimension
                """)
                dims = await cursor.fetchall()
                for d in dims:
                    print(f"  {d['dimension']}: {d['count']}题")

if __name__ == '__main__':
    asyncio.run(check_data())
