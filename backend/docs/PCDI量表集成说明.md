# PCDI量表集成说明

## 概述

PCDI（汉语沟通发展量表）是一个专业的儿童语言发展评估工具，已成功集成到"咿呀智库"项目中。该量表基于权威的标准化常模数据，能够准确评估8-30个月儿童的语言沟通能力。

## 集成架构

### 1. 核心算法模块

**文件位置**: `backend/app/algorithms/pcdi_scoring.py`

**主要功能**:
- 词汇和手势量表计分（8~16个月）
- 词汇和句子量表计分（16~30个月）
- 短表快速筛查计分
- 常模百分位匹配
- 特殊情况校验（双语环境、异常值等）

**核心类**: `PCDIScoringAlgorithm`

```python
from app.algorithms.pcdi_scoring import PCDIScoringAlgorithm

# 初始化算法
algorithm = PCDIScoringAlgorithm(scale_config)

# 计算词汇和手势量表分数
result = algorithm.calculate_vocab_gesture_score(data, age_months, gender)

# 计算词汇和句子量表分数
result = algorithm.calculate_vocab_sentence_score(data, age_months, gender)

# 计算短表分数
result = algorithm.calculate_short_form_score(data, age_months, scale_type, gender)
```

### 2. 数据模型

**文件位置**: `backend/app/schemas/assessment.py`

**新增数据结构**:
- `PCDIEarlyLanguageData`: 早期语言数据
- `PCDIGestureData`: 手势数据
- `PCDIVocabGestureData`: 词汇和手势量表数据
- `PCDIVocabSentenceData`: 词汇和句子量表数据
- `PCDIShortFormData`: 短表数据

### 3. 服务层集成

**文件位置**: `backend/app/services/assessment_service.py`

**集成点**: `AssessmentService.calculate_score()`

```python
def calculate_score(self, scale_config: Dict, assessment_data: Dict) -> Dict:
    scale_type = scale_config.get('scale_type', 'standard')
    
    if scale_type == 'pcdi':
        # 使用PCDI算法
        pcdi_algorithm = PCDIScoringAlgorithm(scale_config)
        # ...
    else:
        # 使用标准算法
        standard_algorithm = TestScoringAlgorithm(scale_config)
        # ...
```

### 4. API接口

**文件位置**: `backend/app/api/v1/assessment.py`

**接口**: `POST /api/v1/assessment/submit`

支持两种提交方式：
1. 标准量表：使用 `answers` 字段
2. PCDI量表：使用 `pcdi_type` 和 `pcdi_data` 字段

## 使用示例

### 1. 词汇和手势量表（8~16个月）

```json
{
  "user_id": 1,
  "baby_id": 1,
  "scale_id": "PCDI_VG",
  "age_group": "8-12",
  "age_months": 8,
  "gender": "female",
  "pcdi_type": "vocab_gesture",
  "pcdi_data": {
    "early_language": {
      "language_understanding": [1, 1, 0],
      "understand_phrases": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
      "start_speaking": [1, 2, 1, 2],
      "vocab": {
        "understood": 150,
        "spoken": 80
      }
    },
    "gesture": {
      "early_gesture": [1,1,1,1,1,1,1,1,1,1,2],
      "game_routine": [1,1,1,1,0],
      "interactive_action": [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      "pretend_play": [1,1,1,0,0],
      "imitate_adult": [1,1,1,1,1,0,0]
    },
    "is_bilingual": false,
    "unfinished_items": 0
  },
  "test_duration": 600
}
```

### 2. 词汇和句子量表（16~30个月）

```json
{
  "user_id": 1,
  "baby_id": 1,
  "scale_id": "PCDI_VS",
  "age_group": "18-24",
  "age_months": 24,
  "gender": "male",
  "pcdi_type": "vocab_sentence",
  "pcdi_data": {
    "vocab_spoken": 300,
    "vocab_to_sentence": {
      "use_vocab": [1, 2, 1, 2, 1],
      "sentence_phrase": [1, 2, 1, 2],
      "word_combination": {
        "is_combination": true,
        "longest_sentences": [3, 4, 5]
      },
      "sentence_complexity": [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
    }
  },
  "is_bilingual": true,
  "unfinished_items": 2,
  "test_duration": 900
}
```

### 3. 短表快速筛查

```json
{
  "user_id": 1,
  "baby_id": 1,
  "scale_id": "PCDI_SF",
  "age_group": "12-18",
  "age_months": 12,
  "gender": "female",
  "pcdi_type": "short_form",
  "pcdi_data": {
    "understand_phrases": [1,1,1,1,1],
    "vocab_understood": 50,
    "vocab_spoken": 30
  },
  "test_duration": 300
}
```

## 响应格式

```json
{
  "id": 1,
  "user_id": 1,
  "baby_id": 1,
  "scale_id": "PCDI_VG",
  "scale_name": "汉语沟通发展量表-词汇和手势",
  "age_group": "8-12",
  "total_score": 383,
  "max_score": 472,
  "percent": 81.14,
  "level": "良好",
  "dimension_scores": [
    {
      "dimension": "early_language",
      "score": 233,
      "max_score": 100,
      "percent": 233,
      "level": "优秀"
    },
    {
      "dimension": "gesture",
      "score": 150,
      "max_score": 100,
      "percent": 150,
      "level": "优秀"
    }
  ],
  "percentile": 75,
  "special_note": "无特殊情况",
  "suggestions": [
    "建议继续加强词汇理解训练",
    "可以增加互动游戏时间"
  ],
  "test_duration": 600,
  "created_at": "2024-01-15T10:30:00"
}
```

## 常模数据

### 当前支持的月龄

- 8个月
- 12个月
- 18个月
- 24个月
- 30个月

### 百分位等级

- 5%：低于常模
- 25%：低于平均
- 50%：平均水平
- 75%：高于平均
- 95%：优秀

### 性别差异

系统支持男童和女童的性别差异常模数据。

## 特殊情况处理

### 1. 双语环境

当检测到儿童处于双语环境时，系统会提示"不建议直接套用单语常模"。

### 2. 异常值检测

系统会自动检测异常值，例如8个月婴儿词汇表达分>10分时，会提示"可能存在家长高估，建议复核"。

### 3. 未完成项目

当未完成项目数>5时，系统会提示"结果仅供参考"。

### 4. 低分预警

当得分低于第10百分位时，系统会提示"建议进一步临床评估"。

## 测试

**测试文件**: `backend/tests/test_pcdi.py`

运行测试：
```bash
cd backend
python tests/test_pcdi.py
```

## 数据库配置

在数据库中创建量表记录时，需要设置 `scale_type` 为 `pcdi`：

```sql
INSERT INTO scales (scale_id, scale_name, scale_type, age_range, total_questions, scoring_rules, norm_data)
VALUES (
  'PCDI_VG',
  '汉语沟通发展量表-词汇和手势',
  'pcdi',
  '8-16',
  472,
  '{"type": "pcdi", "subtype": "vocab_gesture"}',
  '{"percentiles": {...}}'
);
```

## 前端集成建议

### 1. 量表选择

根据儿童月龄自动选择合适的量表类型：
- 8-16个月：词汇和手势量表
- 16-30个月：词汇和句子量表
- 快速筛查：短表

### 2. 数据收集

根据量表类型动态生成表单：
- 词汇和手势量表：需要收集早期语言和手势数据
- 词汇和句子量表：需要收集词汇和句子数据
- 短表：简化版数据收集

### 3. 结果展示

- 显示总分和百分位
- 展示各维度得分
- 显示特殊情况说明
- 提供个性化建议

## 扩展性

### 添加新的月龄常模

在 `pcdi_scoring.py` 中的 `PERCENTILE_TABLE` 添加新的月龄数据：

```python
PERCENTILE_TABLE = {
    # ... 现有数据
    36: {
        "female": {
            (0, 250): 5, (251, 500): 25, (501, 750): 50,
            (751, 900): 75, (901, 1000): 95
        },
        "male": {
            (0, 230): 5, (231, 480): 25, (481, 730): 50,
            (731, 880): 75, (881, 1000): 95
        }
    }
}
```

### 自定义评分规则

可以通过继承 `PCDIScoringAlgorithm` 类来实现自定义评分逻辑。

## 注意事项

1. **常模数据准确性**: 确保常模数据来自权威来源
2. **性别区分**: 必须正确区分男童和女童的常模数据
3. **月龄计算**: 精确计算儿童月龄（精确到月）
4. **数据验证**: 在提交前验证数据的完整性和合理性
5. **异常处理**: 妥善处理各种异常情况

## 技术支持

如有问题，请参考：
- PCDI量表原始文档
- 算法实现文件：`backend/app/algorithms/pcdi_scoring.py`
- 测试示例：`backend/tests/test_pcdi.py`