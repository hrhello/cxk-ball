class Skill {
  /**
   * 
   * @param {*} main 
   * @param {string} name 技能名称
   * @param {*} icon 技能图标
   * @param {string} desc 技能描述
   * @param {number} cd 技能冷却时间，单位秒
   * @param {number} cost 技能消耗
   * @param {number|string} keyCode 按键
   */
  constructor(main, name, icon, desc, cd, cost, keyCode) {
    this.main = main;
    this.name = name;
    this.icon = icon;
    this.desc = desc;
    this.cd = cd;
    this.cost = cost;
    if(typeof keyCode === 'number') {
      this.keyCode = keyCode;
    } else if(typeof keyCode === 'string' && keyCode.length === 1) {
      this.keyCode = keyCode.toUpperCase().charCodeAt(0);
    } else {
      throw new Error(`技能${name}无法绑定按键${keyCode}`);
    }
    this.lastCastTime = 0; // Date.now();

    this.bindKey();
  }

  bindKey() {
    window.addEventListener('keydown', (event) => {
      if ((typeof this.keyCode === 'number' && event.keyCode === this.keyCode)
        || (Array.isArray(this.keyCode) && this.keyCode.indexOf(event.keyCode) >= 0)
      ) {
        try {
          this.cast();
        } catch (e) {
          // TODO 使用更好的方式提示
          console.log('技能释放失败：', e.message);
        }
      }
    });
    // TODO 通过canvas将技能名称、图标、描述、快捷键等显示出来
    const keyName = typeof this.keyCode === 'number' ? String.fromCharCode(this.keyCode) : this.keyCode.map(key => String.fromCharCode(key)).join('/');
    console.log(`cxk已加载技能：${keyName}-${this.name}`);
  }

  /**
   * 释放技能
   */
  cast() {
    if (this.lastCastTime + this.cd * 1000 > Date.now()) {
      throw new Error('技能尚未冷却');
    } else if (this.main.score.allScore < this.cost) {
      throw new Error('积分不足');
    }
    this.lastCastTime = Date.now(); // 更新上次释放时间
    this.main.score.allScore -= this.cost;  // 扣除积分
    // TODO 显示释放技能的特效
    console.log(`cxk消耗了${this.cost}积分发动了技能——${this.name}！\n${this.desc}`)
  }
}

class SkillQ extends Skill {
  constructor(main) {
    super(main,
      '意念控球',
      '',
      'cxk使用意念控制球转向一次，直接命中最近的一个砖块',
      10,
      1000,
      'Q');
  }

  /**
   * 计算球和砖块的距离(的平方)
   * @param {*} ball 
   * @param {*} block 
   */
  static calDistance(ball, block) {
    return Math.pow(ball.x - block.x, 2) + Math.pow(ball.y - block.y, 2);
  }

  cast() {
    super.cast();
    const { blockList, ball } = this.main;
    console.log(blockList)
    let targetBlock = null;
    let targetDistance = null;

    // 获取距离球最近的砖块
    blockList.forEach(block => {
      const blockDistance = SkillQ.calDistance(ball, block);
      if (!targetDistance || blockDistance < targetDistance) {
        targetBlock = block;
        targetDistance = blockDistance;
      }
    });

    // 使用意念控制球转向
    const speed = Math.pow(ball.speedX, 2) + Math.pow(ball.speedY, 2);
    const expectTime = Math.sqrt(targetDistance / speed);
    ball.speedX = (ball.x - targetBlock.x) / expectTime;
    ball.speedY = (ball.y - targetBlock.y) / expectTime;
  }
}

class SkillW extends Skill {
  constructor(main) {
    super(main,
      '虚鲲鬼步',
      '',
      'cxk发动在美国校队时领悟的绝技，5秒内可以100%接住篮球',
      10,
      1000,
      'W');
    this.duration = 5;  // 持续5秒
  }

  cast() {
    super.cast();
    const {paddle, ball} = this.main;
    this.casting = setInterval(() => {
      paddle.x = ball.x - paddle.w / 2;
    }, 10);
    setTimeout(() => {
      clearInterval(this.casting);
    }, this.duration * 1000);
  }
}