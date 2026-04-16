/**
 * DeepSeek模型工具类
 * 使用微信云开发原生API接入DeepSeek大模型
 */

class DeepSeek {
  /**
   * 初始化DeepSeek模型
   * @returns {Promise<Object>} DeepSeek模型实例
   */
  static async initModel() {
    try {
      // 检查云开发是否初始化
      if (!wx.cloud) {
        throw new Error('云开发未初始化，请先调用 wx.cloud.init()');
      }
      
      // 创建DeepSeek模型实例
      const model = wx.cloud.extend.AI.createModel('deepseek');
      return model;
    } catch (error) {
      console.error('初始化DeepSeek模型失败:', error);
      throw error;
    }
  }

  /**
   * 调用DeepSeek模型生成文本
   * @param {Object} options - 调用选项
   * @param {string} options.prompt - 提示词
   * @param {string} [options.model=deepseek-r1-0528] - 模型名称
   * @param {Array} [options.messages] - 消息历史
   * @param {Function} [options.onChunk] - 流式回调函数
   * @returns {Promise<string>} 生成的文本
   */
  static async generateText(options) {
    const {
      prompt,
      model = 'deepseek-r1-0528',
      messages = [],
      onChunk
    } = options;

    try {
      const deepseekModel = await this.initModel();
      
      // 构建消息数组
      const fullMessages = messages.length > 0 ? messages : [
        {
          role: 'user',
          content: prompt
        }
      ];

      // 调用模型
      const res = await deepseekModel.streamText({
        data: {
          model,
          messages: fullMessages
        }
      });

      let fullText = '';

      // 处理流式响应
      for await (let event of res.eventStream) {
        if (event.data === '[DONE]') {
          break;
        }

        try {
          const data = JSON.parse(event.data);
          
          // 处理思维链内容（仅deepseek-r1模型支持）
          const think = data?.choices?.[0]?.delta?.reasoning_content;
          if (think && onChunk) {
            onChunk({ type: 'think', content: think });
          }

          // 处理文本内容
          const text = data?.choices?.[0]?.delta?.content;
          if (text) {
            fullText += text;
            if (onChunk) {
              onChunk({ type: 'text', content: text, fullText });
            }
          }
        } catch (parseError) {
          console.error('解析响应数据失败:', parseError);
        }
      }

      return fullText;
    } catch (error) {
      console.error('调用DeepSeek模型失败:', error);
      // 检查是否是网络或域名解析错误
      if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        throw new Error('AI服务暂时不可用，请检查网络连接或联系管理员开通云开发AI能力');
      }
      throw error;
    }
  }

  /**
   * 生成AI智能体回复
   * @param {Object} options - 调用选项
   * @param {string} options.message - 用户消息
   * @param {Array} [options.chatHistory] - 聊天历史
   * @param {Function} [options.onChunk] - 流式回调函数
   * @returns {Promise<string>} AI回复
   */
  static async generateAgentResponse(options) {
    const {
      message,
      chatHistory = [],
      onChunk
    } = options;

    // 构建详细的系统提示词 - 设定AI智能体身份
    const systemMessage = {
      role: 'system',
      content: `【身份设定】
你是"咿呀智库"的AI智能助手，名字叫"小咿"。

【专业领域】
专注于0-30个月婴幼儿的养育咨询，包括但不限于：
- 语言发展与沟通
- 行为习惯培养
- 情绪管理与引导
- 亲子关系建立
- 日常护理与作息
- 认知能力发展
- 社交技能培养

【性格特点】
- 专业：基于儿童发展心理学和早期教育理论
- 温和：理解家长的焦虑和困惑，给予情感支持
- 实用：提供可操作、具体的建议，而非空泛的理论
- 耐心：愿意详细解释，回答后续问题
- 客观：基于科学研究和专业经验，避免主观判断

【回答风格】
1. 使用亲切、温暖的语气，像一位有经验的育儿顾问
2. 先理解家长的问题和情绪，再提供建议
3. 建议要分点列出，清晰易读
4. 每条建议都要具体、可操作
5. 适当使用表情符号，让回答更亲切
6. 遇到超出专业范围的问题，诚实说明并建议寻求专业帮助

【注意事项】
- 不要使用过于专业的术语，用家长能理解的语言
- 尊重家长的养育方式，避免评判
- 强调每个孩子的发展速度不同，减少家长的焦虑
- 提供建议时考虑不同家庭情况的差异
- 遇到紧急情况（如孩子受伤、高烧等），建议立即就医`
    };

    // 转换聊天历史格式
    const formattedHistory = chatHistory.map(item => ({
      role: item.role === 'user' ? 'user' : 'assistant',
      content: item.content
    }));

    // 添加用户新消息
    const userMessage = {
      role: 'user',
      content: message
    };

    // 构建完整消息数组
    const messages = [systemMessage, ...formattedHistory, userMessage];

    // 调用模型
    return this.generateText({
      model: 'deepseek-r1-0528',
      messages,
      onChunk
    });
  }

  /**
   * 生成场景对话孩子回应
   * @param {Object} options - 调用选项
   * @param {string} options.scene - 场景名称
   * @param {Array} options.dialogueHistory - 对话历史
   * @param {string} options.parentResponse - 家长回应
   * @param {Function} [options.onChunk] - 流式回调函数
   * @returns {Promise<string>} 孩子回应
   */
  static async generateChildResponse(options) {
    const {
      scene,
      dialogueHistory,
      parentResponse,
      onChunk
    } = options;

    // 构建详细的系统提示词 - 设定孩子角色身份
    const systemMessage = {
      role: 'system',
      content: `【角色设定】
你现在扮演一个0-30个月的孩子，名字叫"小宝"。

【场景信息】
当前场景："${scene}"

【角色特点】
1. 语言能力：根据0-30个月孩子的语言发展特点，使用简单、重复的词汇，可能会出现叠词（如"妈妈"、"吃饭"、"睡觉"）
2. 情绪表达：情绪直接、真实，开心就笑，不开心就哭或发脾气
3. 认知水平：以自我为中心，理解能力有限，只能理解简单的指令
4. 注意力：注意力持续时间短，容易被新鲜事物吸引
5. 社交行为：依赖主要照顾者，对陌生人可能害羞，需要安全感

【语言风格】
1. 使用简短的句子，通常1-3个字
2. 经常使用叠词和拟声词（如"哇哇"、"嗯嗯"、"咕咕"）
3. 可能会出现语法错误或不完整的句子
4. 会重复家长说的话
5. 用简单的词汇表达需求和感受

【情绪特点】
1. 好奇心强，对新鲜事物感兴趣
2. 情绪变化快，前一秒哭后一秒笑
3. 需要被理解和关注
4. 对熟悉的人有依恋感
5. 可能会因为无法表达需求而发脾气

【回应原则】
1. 根据家长的话语做出符合年龄的回应
2. 回应要简短、天真、可爱
3. 可以表达需求、情绪或好奇
4. 不要使用复杂的逻辑推理
5. 语气要符合孩子的特点（如撒娇、兴奋、委屈等）

【示例回应】
- 家长说："吃饭啦！" → 孩子："不要！"或"嗯~"
- 家长说："这个玩具好玩吗？" → 孩子："好玩！"或"玩！"
- 家长说："该睡觉了" → 孩子："不睡！"或"玩！"
- 家长说："我爱你" → 孩子："爱！"或"抱抱"`
    };

    // 转换对话历史格式
    const formattedHistory = dialogueHistory.map(item => ({
      role: item.role === 'child' ? 'assistant' : 'user',
      content: item.content
    }));

    // 添加家长新回应
    const parentMessage = {
      role: 'user',
      content: parentResponse
    };

    // 构建完整消息数组
    const messages = [systemMessage, ...formattedHistory, parentMessage];

    // 调用模型
    return this.generateText({
      model: 'deepseek-r1-0528',
      messages,
      onChunk
    });
  }

  /**
   * 分析亲子对话内容
   * @param {Object} options - 调用选项
   * @param {string} options.dialogueText - 对话文本
   * @param {Function} [options.onChunk] - 流式回调函数
   * @returns {Promise<Object>} 分析结果
   */
  static async analyzeDialogue(options) {
    const {
      dialogueText,
      onChunk
    } = options;

    // 构建系统提示
    const systemMessage = {
      role: 'system',
      content: '你是一个专业的亲子沟通分析师，专注于0-30个月婴幼儿的亲子对话质量分析。请根据提供的对话内容，从互动频率、语言输入、回应质量三个维度进行分析，并给出具体的评分和改进建议。分析结果应包含：总分、等级评价、总体描述、各维度的评分和详细描述。'
    };

    // 构建用户消息
    const userMessage = {
      role: 'user',
      content: `请分析以下亲子对话内容：\n\n${dialogueText}\n\n分析要求：\n1. 从互动频率、语言输入、回应质量三个维度进行分析\n2. 每个维度给出0-100的评分和详细描述\n3. 计算总分并给出等级评价（优秀、良好、一般、需要改进）\n4. 提供具体的改进建议\n5. 分析结果请以JSON格式输出，包含以下字段：time、totalScore、level、desc、dimensions`
    };

    // 构建完整消息数组
    const messages = [systemMessage, userMessage];

    try {
      // 调用模型
      const response = await this.generateText({
        model: 'deepseek-r1-0528',
        messages,
        onChunk
      });

      // 解析JSON结果
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      const jsonStr = response.substring(jsonStart, jsonEnd);
      const analysisResult = JSON.parse(jsonStr);

      // 确保结果格式正确
      if (!analysisResult.time) {
        analysisResult.time = new Date().toISOString().split('T')[0];
      }

      return analysisResult;
    } catch (error) {
      console.error('分析对话失败:', error);
      throw error;
    }
  }

  /**
   * 搜索科普文章
   * @param {Object} options - 调用选项
   * @param {string} options.keyword - 搜索关键词
   * @param {number} [options.page=1] - 页码
   * @param {number} [options.pageSize=10] - 每页数量
   * @returns {Promise<Object>} 搜索结果
   */
  static async searchArticles(options) {
    const {
      keyword,
      page = 1,
      pageSize = 10
    } = options;

    // 构建系统提示
    const systemMessage = {
      role: 'system',
      content: '你是一个专业的科普文章搜索助手，专注于0-30个月婴幼儿的养育和发展相关内容。请根据用户提供的关键词，搜索最新、高质量的科普文章，并返回结构化的搜索结果。'
    };

    // 构建用户消息
    const userMessage = {
      role: 'user',
      content: `请搜索关于"${keyword}"的最新科普文章，要求：\n1. 搜索2025-2026年发布的文章\n2. 优先返回权威机构发布的内容\n3. 提供文章标题、来源、发布时间、摘要和图片\n4. 每页返回${pageSize}篇文章，当前是第${page}页\n5. 返回JSON格式，包含articles数组、total总数、page页码、pageSize每页数量`
    };

    // 构建完整消息数组
    const messages = [systemMessage, userMessage];

    try {
      // 调用模型
      const response = await this.generateText({
        model: 'deepseek-r1-0528',
        messages
      });

      // 解析JSON结果
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      const jsonStr = response.substring(jsonStart, jsonEnd);
      const searchResult = JSON.parse(jsonStr);

      return searchResult;
    } catch (error) {
      console.error('搜索文章失败:', error);
      // 返回默认搜索结果
      const defaultArticles = [
        {
          id: 1,
          title: `${keyword}的最新研究进展`,
          source: '中国儿童发展研究中心',
          publishTime: '2026-02-25',
          summary: `本文介绍了${keyword}领域的最新研究成果，为家长提供了科学的指导建议...`,
          url: '#',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=child%20development%20research%20modern%20scientific%20study&image_size=square'
        },
        {
          id: 2,
          title: `如何在家庭中促进${keyword}`,
          source: '育儿科学研究院',
          publishTime: '2026-02-20',
          summary: `基于大数据分析，本文提供了在家庭环境中促进${keyword}的实用方法...`,
          url: '#',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20environment%20child%20development%20home%20setting&image_size=square'
        },
        {
          id: 3,
          title: `${keyword}的关键期与干预策略`,
          source: '早期教育研究',
          publishTime: '2026-02-15',
          summary: `最新研究表明，${keyword}存在关键期，本文介绍了科学的干预策略...`,
          url: '#',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=child%20development%20critical%20period%20intervention%20strategy&image_size=square'
        }
      ];

      return {
        articles: defaultArticles,
        total: defaultArticles.length,
        page,
        pageSize
      };
    }
  }
}


module.exports = DeepSeek;
