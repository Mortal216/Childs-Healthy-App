/**
 * 智能任务推送工具类
 * 基于当前时间生成适合的育儿任务
 */

class TaskGenerator {
  /**
   * 根据当前时间获取时段名称
   * @param {number} hour - 当前小时
   * @returns {string} 时段名称
   */
  static getTimeSlotName(hour) {
    if (hour >= 6 && hour < 9) return '早餐时段';
    if (hour >= 9 && hour < 12) return '上午活动时段';
    if (hour >= 12 && hour < 14) return '午餐和午休时段';
    if (hour >= 14 && hour < 17) return '下午活动时段';
    if (hour >= 17 && hour < 19) return '晚餐时段';
    if (hour >= 19 && hour < 21) return '睡前时段';
    return '夜间时段';
  }

  /**
   * 生成早餐时段任务
   * @param {Object} assessment - 测评数据
   * @returns {Array} 任务列表
   */
  static generateMorningTasks(assessment) {
    return [
      {
        title: '晨间亲子互动',
        description: '利用早餐时间与宝宝进行简单的语言互动，如描述食物名称、颜色和形状，促进语言发展。',
        duration: 10,
        difficulty: '简单',
        benefits: ['语言发展', '亲子关系'],
        icon: '🌅'
      },
      {
        title: '手指食物练习',
        description: '为宝宝准备适合抓取的手指食物，如小块水果、蒸蔬菜等，锻炼精细动作和自主进食能力。',
        duration: 15,
        difficulty: '中等',
        benefits: ['精细动作', '自主能力'],
        icon: '🥣'
      }
    ];
  }

  /**
   * 生成上午活动时段任务
   * @param {Object} assessment - 测评数据
   * @returns {Array} 任务列表
   */
  static generateMidMorningTasks(assessment) {
    return [
      {
        title: '感官探索游戏',
        description: '准备不同材质的物品（如软布、塑料玩具、木质积木等），让宝宝触摸感知，促进感官发展。',
        duration: 20,
        difficulty: '中等',
        benefits: ['感官发展', '认知能力'],
        icon: '🎮'
      },
      {
        title: '亲子共读',
        description: '选择适合宝宝年龄的绘本，进行亲子共读，通过图片和简单的语言描述，培养阅读兴趣。',
        duration: 15,
        difficulty: '简单',
        benefits: ['语言发展', '阅读兴趣'],
        icon: '📚'
      }
    ];
  }

  /**
   * 生成午餐和午休时段任务
   * @param {Object} assessment - 测评数据
   * @returns {Array} 任务列表
   */
  static generateLunchTasks(assessment) {
    return [
      {
        title: '规律作息培养',
        description: '建立固定的午餐和午休时间，创造安静舒适的睡眠环境，帮助宝宝养成良好的作息习惯。',
        duration: 60,
        difficulty: '中等',
        benefits: ['作息规律', '健康成长'],
        icon: '😴'
      }
    ];
  }

  /**
   * 生成下午活动时段任务
   * @param {Object} assessment - 测评数据
   * @returns {Array} 任务列表
   */
  static generateAfternoonTasks(assessment) {
    return [
      {
        title: '户外活动时间',
        description: '带宝宝到户外散步、晒太阳，观察周围的环境和事物，促进大动作发展和视觉认知。',
        duration: 30,
        difficulty: '中等',
        benefits: ['大动作发展', '视觉认知'],
        icon: '🌳'
      },
      {
        title: '精细动作训练',
        description: '根据宝宝的发展水平，选择适合的精细动作训练，如堆积木、穿珠子、涂鸦等。',
        duration: 20,
        difficulty: '中等',
        benefits: ['精细动作', '手眼协调'],
        icon: '✋'
      }
    ];
  }

  /**
   * 生成晚餐时段任务
   * @param {Object} assessment - 测评数据
   * @returns {Array} 任务列表
   */
  static generateDinnerTasks(assessment) {
    return [
      {
        title: '家庭聚餐时光',
        description: '让宝宝参与家庭聚餐，培养良好的饮食习惯，同时通过家庭成员的互动，促进社交能力。',
        duration: 30,
        difficulty: '简单',
        benefits: ['饮食习惯', '社交能力'],
        icon: '🍽️'
      }
    ];
  }

  /**
   * 生成睡前时段任务
   * @param {Object} assessment - 测评数据
   * @returns {Array} 任务列表
   */
  static generateBedtimeTasks(assessment) {
    return [
      {
        title: '睡前放松活动',
        description: '进行温和的睡前活动，如洗澡、轻柔的按摩、听安静的音乐或故事，帮助宝宝放松情绪。',
        duration: 20,
        difficulty: '简单',
        benefits: ['情绪管理', '睡眠质量'],
        icon: '🛁'
      },
      {
        title: '亲子晚安仪式',
        description: '建立固定的晚安仪式，如亲吻、拥抱、说晚安，增强宝宝的安全感和亲子情感连接。',
        duration: 10,
        difficulty: '简单',
        benefits: ['安全感', '亲子关系'],
        icon: '🌙'
      }
    ];
  }

  /**
   * 根据当前时间生成任务
   * @param {Date} now - 当前时间
   * @param {Object} assessment - 测评数据
   * @returns {Object} 包含任务和时段的对象
   */
  static generateTasksByTime(now, assessment = {}) {
    const hour = now.getHours();
    let tasks = [];
    
    if (hour >= 6 && hour < 9) {
      tasks = this.generateMorningTasks(assessment);
    } else if (hour >= 9 && hour < 12) {
      tasks = this.generateMidMorningTasks(assessment);
    } else if (hour >= 12 && hour < 14) {
      tasks = this.generateLunchTasks(assessment);
    } else if (hour >= 14 && hour < 17) {
      tasks = this.generateAfternoonTasks(assessment);
    } else if (hour >= 17 && hour < 19) {
      tasks = this.generateDinnerTasks(assessment);
    } else if (hour >= 19 && hour < 21) {
      tasks = this.generateBedtimeTasks(assessment);
    } else {
      tasks = [{
        title: '现在是休息时间',
        description: '建议家长和孩子都保持良好的作息，确保充足的睡眠。',
        duration: 0,
        difficulty: '简单',
        benefits: ['健康作息'],
        icon: '😴'
      }];
    }
    
    return { tasks, timeSlot: this.getTimeSlotName(hour) };
  }

  /**
   * 生成智能任务（主方法）
   * @param {Object} options - 选项
   * @param {Object} [options.assessment={}] - 测评数据
   * @param {Date} [options.now=new Date()] - 当前时间
   * @returns {Object} 任务生成结果
   */
  static generateTasks(options = {}) {
    const { assessment = {}, now = new Date() } = options;
    
    try {
      console.log('智能任务推送触发');
      console.log('当前时间:', now);
      console.log('当前小时:', now.getHours());
      
      const result = this.generateTasksByTime(now, assessment);
      
      console.log('生成的任务:', result.tasks);
      console.log('当前时段:', result.timeSlot);
      
      return {
        success: true,
        data: {
          tasks: result.tasks,
          timeSlot: result.timeSlot,
          currentTime: now.toISOString(),
          hour: now.getHours()
        },
        message: '任务生成成功'
      };
    } catch (error) {
      console.error('任务生成失败:', error);
      return {
        success: false,
        error: error.message,
        message: '任务生成失败'
      };
    }
  }
}

module.exports = TaskGenerator;
