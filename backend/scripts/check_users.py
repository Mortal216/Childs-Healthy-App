#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查数据库中的用户数据
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

async def check_users():
    """检查用户数据"""
    
    print("=" * 70)
    print("检查数据库用户数据")
    print("=" * 70)
    
    async with aiomysql.create_pool(**DB_CONFIG) as pool:
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 1. 检查用户总数
                print("\n1. 检查用户总数...")
                await cursor.execute("SELECT COUNT(*) as count FROM users")
                result = await cursor.fetchone()
                print(f"   用户总数: {result['count']}")
                
                # 2. 查看前10个用户
                print("\n2. 查看前10个用户...")
                await cursor.execute("SELECT id, phone, created_at FROM users LIMIT 10")
                users = await cursor.fetchall()
                
                for user in users:
                    print(f"   ID: {user['id']}, 手机号: {user['phone']}, 创建时间: {user['created_at']}")
                
                # 3. 检查测评记录
                print("\n3. 检查测评记录...")
                await cursor.execute("SELECT COUNT(*) as count FROM assessments")
                result = await cursor.fetchone()
                print(f"   测评记录总数: {result['count']}")
                
                # 4. 查看最近的测评记录
                print("\n4. 查看最近的测评记录...")
                await cursor.execute("""
                    SELECT id, user_id, scale_id, total_score, created_at 
                    FROM assessments 
                    ORDER BY created_at DESC 
                    LIMIT 5
                """)
                assessments = await cursor.fetchall()
                
                for assessment in assessments:
                    print(f"   ID: {assessment['id']}, 用户ID: {assessment['user_id']}, 量表: {assessment['scale_id']}, 分数: {assessment['total_score']}")
    
    print("\n" + "=" * 70)
    print("检查完成")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(check_users())
