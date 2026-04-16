#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
删除数据库中的 PCDI 量表数据
用于重新导入新的量表数据
"""

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
    'charset': 'utf8mb4',
    'cursorclass': aiomysql.DictCursor
}

async def delete_pcdi_scales():
    """删除 PCDI 相关的量表和题目数据"""
    
    print("=" * 60)
    print("开始删除 PCDI 量表数据")
    print("=" * 60)
    
    async with aiomysql.create_pool(**DB_CONFIG) as pool:
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 1. 查询现有的 PCDI 量表
                print("\n1. 查询现有的 PCDI 量表...")
                await cursor.execute("""
                    SELECT scale_id, scale_name, scale_type 
                    FROM scales 
                    WHERE scale_id LIKE '%PCDI%' OR scale_name LIKE '%PCDI%'
                """)
                pcdi_scales = await cursor.fetchall()
                
                if not pcdi_scales:
                    print("   未找到 PCDI 量表")
                else:
                    print(f"   找到 {len(pcdi_scales)} 个 PCDI 量表:")
                    for scale in pcdi_scales:
                        print(f"   - {scale['scale_id']}: {scale['scale_name']}")
                
                # 2. 查询所有量表（用于确认）
                print("\n2. 查询所有量表...")
                await cursor.execute("SELECT scale_id, scale_name FROM scales")
                all_scales = await cursor.fetchall()
                print(f"   数据库中共有 {len(all_scales)} 个量表:")
                for scale in all_scales:
                    print(f"   - {scale['scale_id']}: {scale['scale_name']}")
                
                # 3. 删除 PCDI 相关的题目
                print("\n3. 删除 PCDI 相关的题目...")
                if pcdi_scales:
                    scale_ids = [scale['scale_id'] for scale in pcdi_scales]
                    placeholders = ','.join(['%s'] * len(scale_ids))
                    
                    # 先查询要删除的题目数量
                    await cursor.execute(f"""
                        SELECT COUNT(*) as count 
                        FROM questions 
                        WHERE scale_id IN ({placeholders})
                    """, scale_ids)
                    question_count = await cursor.fetchone()
                    
                    print(f"   准备删除 {question_count['count']} 道题目")
                    
                    # 删除题目
                    await cursor.execute(f"""
                        DELETE FROM questions 
                        WHERE scale_id IN ({placeholders})
                    """, scale_ids)
                    
                    print(f"   已删除 {cursor.rowcount} 道题目")
                
                # 4. 删除 PCDI 量表
                print("\n4. 删除 PCDI 量表...")
                if pcdi_scales:
                    scale_ids = [scale['scale_id'] for scale in pcdi_scales]
                    placeholders = ','.join(['%s'] * len(scale_ids))
                    
                    await cursor.execute(f"""
                        DELETE FROM scales 
                        WHERE scale_id IN ({placeholders})
                    """, scale_ids)
                    
                    print(f"   已删除 {cursor.rowcount} 个量表")
                
                # 5. 确认删除结果
                print("\n5. 确认删除结果...")
                await cursor.execute("""
                    SELECT scale_id, scale_name 
                    FROM scales 
                    WHERE scale_id LIKE '%PCDI%' OR scale_name LIKE '%PCDI%'
                """)
                remaining = await cursor.fetchall()
                
                if not remaining:
                    print("   ✅ PCDI 量表已全部删除")
                else:
                    print(f"   ⚠️ 仍有 {len(remaining)} 个 PCDI 量表:")
                    for scale in remaining:
                        print(f"   - {scale['scale_id']}: {scale['scale_name']}")
                
                # 6. 查询剩余的所有量表
                print("\n6. 剩余量表列表...")
                await cursor.execute("SELECT scale_id, scale_name FROM scales")
                remaining_scales = await cursor.fetchall()
                print(f"   数据库中剩余 {len(remaining_scales)} 个量表:")
                for scale in remaining_scales:
                    print(f"   - {scale['scale_id']}: {scale['scale_name']}")
                
                # 提交事务
                await conn.commit()
                
    print("\n" + "=" * 60)
    print("PCDI 量表删除完成")
    print("=" * 60)
    print(f"\n时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n提示: 现在可以运行 init_data.py 导入新的量表数据")

if __name__ == "__main__":
    asyncio.run(delete_pcdi_scales())
