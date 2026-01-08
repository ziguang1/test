// 贪吃蛇游戏 - JavaScript 实现
class SnakeGame {
    constructor() {
        // 游戏常量
        this.GRID_SIZE = 20;
        this.GAME_SPEED = 150; // 毫秒
        
        // 游戏状态
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.isGameRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        // 蛇的初始状态
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = {x: 1, y: 0}; // 初始向右移动
        this.nextDirection = {x: 1, y: 0};
        
        // 食物位置
        this.food = {x: 15, y: 15};
        
        // 获取DOM元素
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        
        // 按钮元素
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        // 初始化游戏
        this.init();
    }
    
    init() {
        // 设置高分显示
        this.highScoreElement.textContent = this.highScore;
        
        // 绘制初始游戏状态
        this.draw();
        
        // 绑定事件监听器
        this.bindEvents();
    }
    
    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 按钮事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        
        // 触摸控制（移动设备）
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        // 为移动设备添加触摸控制
        const touchArea = this.canvas;
        let touchStartX = 0;
        let touchStartY = 0;
        
        touchArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        touchArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        touchArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            // 确定滑动方向
            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平滑动
                if (dx > 0 && this.direction.x !== -1) {
                    this.nextDirection = {x: 1, y: 0}; // 右
                } else if (dx < 0 && this.direction.x !== 1) {
                    this.nextDirection = {x: -1, y: 0}; // 左
                }
            } else {
                // 垂直滑动
                if (dy > 0 && this.direction.y !== -1) {
                    this.nextDirection = {x: 0, y: 1}; // 下
                } else if (dy < 0 && this.direction.y !== 1) {
                    this.nextDirection = {x: 0, y: -1}; // 上
                }
            }
        });
    }
    
    handleKeyPress(e) {
        // 防止方向键滚动页面
        if ([37, 38, 39, 40, 65, 87, 68, 83].includes(e.keyCode)) {
            e.preventDefault();
        }
        
        // 方向键控制
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.direction.y !== 1) this.nextDirection = {x: 0, y: -1};
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.direction.y !== -1) this.nextDirection = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.direction.x !== 1) this.nextDirection = {x: -1, y: 0};
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.direction.x !== -1) this.nextDirection = {x: 1, y: 0};
                break;
            case ' ':
                // 空格键暂停/继续
                this.togglePause();
                break;
        }
    }
    
    startGame() {
        if (!this.isGameRunning) {
            this.isGameRunning = true;
            this.isPaused = false;
            this.startBtn.textContent = '游戏进行中';
            this.startBtn.disabled = true;
            this.pauseBtn.textContent = '暂停游戏';
            this.pauseBtn.disabled = false;
            this.gameOverScreen.style.display = 'none';
            
            // 开始游戏循环
            this.gameLoop = setInterval(() => this.update(), this.GAME_SPEED);
        }
    }
    
    togglePause() {
        if (!this.isGameRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            clearInterval(this.gameLoop);
            this.pauseBtn.textContent = '继续游戏';
        } else {
            this.gameLoop = setInterval(() => this.update(), this.GAME_SPEED);
            this.pauseBtn.textContent = '暂停游戏';
        }
    }
    
    restartGame() {
        // 重置游戏状态
        clearInterval(this.gameLoop);
        
        this.score = 0;
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.generateFood();
        
        this.isGameRunning = false;
        this.isPaused = false;
        
        // 更新UI
        this.scoreElement.textContent = this.score;
        this.startBtn.textContent = '开始游戏';
        this.startBtn.disabled = false;
        this.pauseBtn.textContent = '暂停游戏';
        this.pauseBtn.disabled = true;
        this.gameOverScreen.style.display = 'none';
        
        // 重新绘制
        this.draw();
    }
    
    update() {
        if (this.isPaused) return;
        
        // 更新方向
        this.direction = {...this.nextDirection};
        
        // 计算新的蛇头位置
        const head = {...this.snake[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        // 添加新的蛇头
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            // 增加分数
            this.score += 10;
            this.scoreElement.textContent = this.score;
            
            // 生成新食物
            this.generateFood();
            
            // 更新最高分
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.highScoreElement.textContent = this.highScore;
                localStorage.setItem('snakeHighScore', this.highScore);
            }
        } else {
            // 如果没有吃到食物，移除蛇尾
            this.snake.pop();
        }
        
        // 绘制游戏
        this.draw();
    }
    
    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.canvas.width / this.GRID_SIZE ||
            head.y < 0 || head.y >= this.canvas.height / this.GRID_SIZE) {
            return true;
        }
        
        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    generateFood() {
        let newFood;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.GRID_SIZE)),
                y: Math.floor(Math.random() * (this.canvas.height / this.GRID_SIZE))
            };
            
            // 检查食物是否生成在蛇身上
            for (let segment of this.snake) {
                if (newFood.x === segment.x && newFood.y === segment.y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        this.food = newFood;
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格（可选）
        this.drawGrid();
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头 - 绿色
                this.ctx.fillStyle = '#00ff88';
                this.ctx.fillRect(
                    segment.x * this.GRID_SIZE,
                    segment.y * this.GRID_SIZE,
                    this.GRID_SIZE,
                    this.GRID_SIZE
                );
                
                // 蛇头眼睛
                this.ctx.fillStyle = '#000';
                const eyeSize = this.GRID_SIZE / 5;
                const eyeOffset = this.GRID_SIZE / 3;
                
                // 根据方向绘制眼睛
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                if (this.direction.x === 1) { // 向右
                    leftEyeX = segment.x * this.GRID_SIZE + this.GRID_SIZE - eyeOffset;
                    leftEyeY = segment.y * this.GRID_SIZE + eyeOffset;
                    rightEyeX = segment.x * this.GRID_SIZE + this.GRID_SIZE - eyeOffset;
                    rightEyeY = segment.y * this.GRID_SIZE + this.GRID_SIZE - eyeOffset;
                } else if (this.direction.x === -1) { // 向左
                    leftEyeX = segment.x * this.GRID_SIZE + eyeOffset;
                    leftEyeY = segment.y * this.GRID_SIZE + eyeOffset;
                    rightEyeX = segment.x * this.GRID_SIZE + eyeOffset;
                    rightEyeY = segment.y * this.GRID_SIZE + this.GRID_SIZE - eyeOffset;
                } else if (this.direction.y === 1) { // 向下
                    leftEyeX = segment.x * this.GRID_SIZE + eyeOffset;
                    leftEyeY = segment.y * this.GRID_SIZE + this.GRID_SIZE - eyeOffset;
                    rightEyeX = segment.x * this.GRID_SIZE + this.GRID_SIZE - eyeOffset;
                    rightEyeY = segment.y * this.GRID_SIZE + this.GRID_SIZE - eyeOffset;
                } else { // 向上
                    leftEyeX = segment.x * this.GRID_SIZE + eyeOffset;
                    leftEyeY = segment.y * this.GRID_SIZE + eyeOffset;
                    rightEyeX = segment.x * this.GRID_SIZE + this.GRID_SIZE - eyeOffset;
                    rightEyeY = segment.y * this.GRID_SIZE + eyeOffset;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // 蛇身 - 渐变色
                const colorValue = Math.max(100, 255 - index * 10);
                this.ctx.fillStyle = `rgb(0, ${colorValue}, 100)`;
                this.ctx.fillRect(
                    segment.x * this.GRID_SIZE,
                    segment.y * this.GRID_SIZE,
                    this.GRID_SIZE,
                    this.GRID_SIZE
                );
                
                // 蛇身内部细节
                this.ctx.fillStyle = `rgba(0, 255, 136, 0.3)`;
                this.ctx.fillRect(
                    segment.x * this.GRID_SIZE + 2,
                    segment.y * this.GRID_SIZE + 2,
                    this.GRID_SIZE - 4,
                    this.GRID_SIZE - 4
                );
            }
            
            // 蛇身边框
            this.ctx.strokeStyle = '#00cc6a';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                segment.x * this.GRID_SIZE,
                segment.y * this.GRID_SIZE,
                this.GRID_SIZE,
                this.GRID_SIZE
            );
        });
        
        // 绘制食物
        this.ctx.fillStyle = '#ff4444';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.GRID_SIZE + this.GRID_SIZE / 2,
            this.food.y * this.GRID_SIZE + this.GRID_SIZE / 2,
            this.GRID_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 食物高光效果
        this.ctx.fillStyle = '#ff8888';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.GRID_SIZE + this.GRID_SIZE / 3,
            this.food.y * this.GRID_SIZE + this.GRID_SIZE / 3,
            this.GRID_SIZE / 6,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // 绘制垂直线
        for (let x = 0; x <= this.canvas.width; x += this.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.canvas.height; y += this.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.isGameRunning = false;
        
        // 显示最终分数
        this.finalScoreElement.textContent = this.score;
        
        // 显示游戏结束界面
        this.gameOverScreen.style.display = 'block';
        
        // 更新按钮状态
        this.startBtn.textContent = '开始游戏';
        this.startBtn.disabled = false;
        this.pauseBtn.textContent = '暂停游戏';
        this.pauseBtn.disabled = true;
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
});