#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 JSON 量表文件转换为 Markdown 文档
"""

import json
import os

def convert_0_18_to_md(data):
    """转换 0-18 月龄词汇与手势量表 """
    md = f"# {data['title']}\n\n"
    md += f"> {data['description']}\n\n"
    md += "---\n\n"
    
    for section in data['sections']:
        md += f"## {section['title']}\n\n"
        
        for subsection in section['subsections']:
            md += f"### {subsection['title']}\n\n"
            
            if 'description' in subsection:
                md += f"*{subsection['description']}*\n\n"
            
            if subsection['type'] == 'multiple_choice':
                md += f"**选项**: {', '.join(subsection['options'])}\n\n"
                md += "| 序号 | 题目 |\n"
                md += "|------|------|\n"
                for item in subsection['items']:
                    md += f"| {item['id']} | {item['text']} |\n"
                md += "\n"
            
            elif subsection['type'] == 'vocabulary':
                md += f"**选项**: {', '.join(subsection.get('options', ['不懂', '听懂', '能说']))}\n\n"
                for category in subsection['categories']:
                    md += f"#### {category['title']}\n\n"
                    md += "| 词汇 | 不懂 | 听懂 | 能说 |\n"
                    md += "|------|------|------|------|\n"
                    for word in category['words']:
                        md += f"| {word['word']} | ⭕ | ⭕ | ⭕ |\n"
                    md += "\n"
        
        md += "---\n\n"
    
    return md

def convert_18_30_to_md(data):
    """转换 18-30 月龄词汇与句子量表 """
    md = f"# {data['title']}\n\n"
    md += f"> {data['description']}\n\n"
    md += "---\n\n"
    
    for section in data['sections']:
        md += f"## {section['title']}\n\n"
        
        if section.get('type') == 'vocabulary':
            for category in section['categories']:
                md += f"### {category['title']}\n\n"
                md += "| 词汇 | 不会说 | 会说 |\n"
                md += "|------|--------|------|\n"
                for word in category['words']:
                    md += f"| {word['word']} | ⭕ | ⭕ |\n"
                md += "\n"
        
        elif 'questions' in section:
            md += "| 序号 | 题目 | 选项 |\n"
            md += "|------|------|------|\n"
            for q in section['questions']:
                options = ', '.join(q.get('options', []))
                md += f"| {q['id']} | {q['text']} | {options} |\n"
            md += "\n"
        
        md += "---\n\n"
    
    return md

def convert_parenting_to_md(data):
    """转换抚养方式测评 """
    md = f"# {data['title']}\n\n"
    md += f"> {data['description']}\n\n"
    md += "---\n\n"
    
    for section in data['sections']:
        md += f"## {section['title']}\n\n"
        
        if 'description' in section:
            md += f"*{section['description']}*\n\n"
        
        # 检查是否有 questions 字段
        if 'questions' not in section:
            # 可能是复杂结构，如词汇量表或句子复杂度
            if 'categories' in section:
                for category in section['categories']:
                    md += f"### {category.get('title', '未命名分类')}\n\n"
                    if 'words' in category:
                        md += "| 词汇 | 选项 |\n"
                        md += "|------|------|\n"
                        for word in category['words']:
                            word_text = word.get('word', '')
                            options = ', '.join(word.get('options', []))
                            md += f"| {word_text} | {options} |\n"
                    elif 'items' in category:
                        md += "| 项目 | 描述 |\n"
                        md += "|------|------|\n"
                        for item in category['items']:
                            item_id = item.get('id', '')
                            desc = item.get('description', '')
                            md += f"| {item_id} | {desc} |\n"
                    md += "\n"
            elif 'items' in section:
                md += "| 序号 | 题目 |\n"
                md += "|------|------|\n"
                for item in section['items']:
                    item_id = item.get('id', '')
                    text = item.get('text', '')
                    md += f"| {item_id} | {text} |\n"
            md += "\n"
            md += "---\n\n"
            continue
        
        md += "| 序号 | 题目 | 类型 | 选项/说明 |\n"
        md += "|------|------|------|-----------|\n"
        for q in section['questions']:
            q_type = q.get('type', 'text')
            if 'options' in q:
                options = ', '.join(q['options'])
            elif 'placeholder' in q:
                options = f"提示: {q['placeholder']}"
            else:
                options = '文本输入'
            md += f"| {q['id']} | {q['text']} | {q_type} | {options} |\n"
        md += "\n"
        md += "---\n\n"
    
    return md

def convert_family_env_to_md(data):
    """转换家庭语言环境调查问卷 """
    md = f"# {data['title']}\n\n"
    if data.get('description'):
        md += f"> {data['description']}\n\n"
    md += "---\n\n"
    
    for section in data['sections']:
        md += f"## {section['title']}\n\n"
        
        md += "| 序号 | 题目 | 类型 | 选项 |\n"
        md += "|------|------|------|------|\n"
        for q in section['questions']:
            q_type = q.get('type', 'radio')
            options = ', '.join(q.get('options', []))
            md += f"| {q['id']} | {q['text']} | {q_type} | {options} |\n"
        md += "\n"
        md += "---\n\n"
    
    return md

def convert_parent_child_interaction_to_md(data):
    """转换亲子互动量表 """
    md = f"# {data['title']}\n\n"
    md += f"> {data['description']}\n\n"
    md += "---\n\n"
    
    md += "**评分标准**: 总是(5分) > 经常(4分) > 有时(3分) > 极少(2分) > 从未(1分)\n\n"
    md += "| 序号 | 题目 | 总是 | 经常 | 有时 | 极少 | 从未 |\n"
    md += "|------|------|------|------|------|------|------|\n"
    
    for q in data['questions']:
        md += f"| {q['id']} | {q['text']} | ⭕ | ⭕ | ⭕ | ⭕ | ⭕ |\n"
    
    md += "\n---\n\n"
    md += "## 评分说明\n\n"
    md += "- 第6、10、13、15、17题为反向计分题\n"
    md += "- 总分越高表示亲子互动质量越好\n"
    
    return md

def main():
    """主函数 """
    files_to_convert = [
        {
            'input': '0-18（词汇与手势）(1).json',
            'output': '0-18（词汇与手势）.md',
            'converter': convert_0_18_to_md
        },
        {
            'input': '18-30（词汇与句子）(1).json',
            'output': '18-30（词汇与句子）.md',
            'converter': convert_18_30_to_md
        },
        {
            'input': '抚养方式测评(1).json',
            'output': '抚养方式测评.md',
            'converter': convert_parenting_to_md
        },
        {
            'input': '家庭语言环境调查问卷(1).json',
            'output': '家庭语言环境调查问卷.md',
            'converter': convert_family_env_to_md
        },
        {
            'input': '亲子互动量表(1).json',
            'output': '亲子互动量表.md',
            'converter': convert_parent_child_interaction_to_md
        }
    ]
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for item in files_to_convert:
        input_path = os.path.join(base_dir, item['input'])
        output_path = os.path.join(base_dir, item['output'])
        
        if not os.path.exists(input_path):
            print(f"❌ 文件不存在: {item['input']}")
            continue
        
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            md_content = item['converter'](data)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(md_content)
            
            print(f"✅ 已生成: {item['output']}")
        except Exception as e:
            print(f"❌ 转换失败 {item['input']}: {str(e)}")

if __name__ == '__main__':
    main()
