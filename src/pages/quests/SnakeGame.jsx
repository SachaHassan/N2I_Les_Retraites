import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './SnakeGame.css';

const SnakeGame = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [phase, setPhase] = useState('INIT');
    const [gameState, setGameState] = useState('START'); // START, PLAYING, GAME_OVER
    const [alert, setAlert] = useState(null); // { title, sub, count }

    // Game State Refs (Mutable to avoid re-renders in loop)
    const gameRef = useRef({
        isRunning: false,
        lastTime: 0,
        accumulator: 0,
        gameMode: 'SNAKE',
        nextMode: 'SNAKE',
        gameSpeed: 100,
        nextEventScore: 50,
        screenShake: 0,
        glitchIntensity: 0,
        GRID_SIZE: 30,
        TILE_COUNT_X: 0,
        TILE_COUNT_Y: 0,
        width: 0,
        height: 0
    });

    // Entities Refs
    const snakeRef = useRef(null);
    const foodRef = useRef(null);
    const gridRef = useRef(null);
    const particlesRef = useRef([]);
    const flappyManagerRef = useRef(null);
    const dodgeManagerRef = useRef(null);

    // Classes (Defined inside to access refs or just helpers)
    class Vector {
        constructor(x, y) { this.x = x; this.y = y; }
    }

    class Particle {
        constructor(x, y, color, speed = 1) {
            this.x = x; this.y = y;
            this.vx = (Math.random() - 0.5) * 10 * speed;
            this.vy = (Math.random() - 0.5) * 10 * speed;
            this.life = 1.0;
            this.decay = Math.random() * 0.03 + 0.01;
            this.color = color;
            this.size = Math.random() * 4 + 2;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            this.life -= this.decay; this.size *= 0.95;
        }
        draw(ctx) {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    class GridPoint {
        constructor(x, y) {
            this.baseX = x; this.baseY = y;
            this.x = x; this.y = y;
            this.vx = 0; this.vy = 0;
        }
        update() {
            const dx = this.baseX - this.x;
            const dy = this.baseY - this.y;
            this.vx += dx * 0.05; this.vy += dy * 0.05;
            this.vx *= 0.85; this.vy *= 0.85;
            this.x += this.vx; this.y += this.vy;
        }
        distort(tx, ty, force) {
            const dx = this.x - tx;
            const dy = this.y - ty;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const angle = Math.atan2(dy, dx);
                const push = (200 - dist) / 200 * force;
                this.vx += Math.cos(angle) * push;
                this.vy += Math.sin(angle) * push;
            }
        }
    }

    class Grid {
        constructor() { this.points = []; this.cols = 0; this.rows = 0; }
        resize(width, height, gridSize) {
            this.cols = Math.ceil(width / gridSize) + 1;
            this.rows = Math.ceil(height / gridSize) + 1;
            this.points = [];
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    this.points.push(new GridPoint(x * gridSize, y * gridSize));
                }
            }
        }
        update() { this.points.forEach(p => p.update()); }
        distort(x, y, force) { this.points.forEach(p => p.distort(x, y, force)); }
        draw(ctx, mode) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            if (mode === 'FLAPPY') ctx.strokeStyle = 'rgba(255, 0, 255, 0.15)';
            if (mode === 'DODGE') ctx.strokeStyle = 'rgba(255, 0, 0, 0.15)';

            // Draw lines (simplified for performance)
            ctx.beginPath();
            this.points.forEach(p => { ctx.moveTo(p.x, p.y); ctx.rect(p.x, p.y, 1, 1); }); // Just dots for now or full grid? Full grid is expensive in React loop if not careful.
            // Reverting to full grid drawing as in original
            for (let y = 0; y < this.rows; y++) {
                ctx.beginPath();
                for (let x = 0; x < this.cols; x++) {
                    const p = this.points[y * this.cols + x];
                    if (x === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }
            for (let x = 0; x < this.cols; x++) {
                ctx.beginPath();
                for (let y = 0; y < this.rows; y++) {
                    const p = this.points[y * this.cols + x];
                    if (y === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }
        }
    }

    // ... Other classes (Snake, Food, Managers) adapted to use refs or passed in context
    // Ideally, these should be outside component or inside useEffect to avoid recreation, 
    // but inside component allows access to state setters if needed (though we use refs for game loop).

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const G = gameRef.current;

        // Initialize Entities
        gridRef.current = new Grid();

        // Resize Handler
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            G.width = canvas.width;
            G.height = canvas.height;
            G.TILE_COUNT_X = Math.floor(canvas.width / G.GRID_SIZE);
            G.TILE_COUNT_Y = Math.floor(canvas.height / G.GRID_SIZE);
            gridRef.current.resize(G.width, G.height, G.GRID_SIZE);
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        // Game Logic Classes
        class Snake {
            constructor() { this.reset(); }
            reset() {
                this.body = [new Vector(5, 10), new Vector(4, 10), new Vector(3, 10)];
                this.dir = new Vector(1, 0);
                this.nextDir = new Vector(1, 0);
                this.colorHue = 0;
                this.velocity = 0;
                this.gravity = 0.6;
                this.jumpStrength = -10;
                this.yPos = 10 * G.GRID_SIZE;
                this.dodgePos = new Vector(G.width / 2, G.height / 2);
                this.dodgeSpeed = 8;
                this.moveUp = false; this.moveDown = false; this.moveLeft = false; this.moveRight = false;
            }
            updateSnake() {
                this.dir = this.nextDir;
                const head = this.body[0];
                const newHead = new Vector(head.x + this.dir.x, head.y + this.dir.y);

                if (newHead.x < 0 || newHead.x >= G.TILE_COUNT_X || newHead.y < 0 || newHead.y >= G.TILE_COUNT_Y) {
                    gameOver(); return;
                }
                for (let segment of this.body) {
                    if (newHead.x === segment.x && newHead.y === segment.y) { gameOver(); return; }
                }

                this.body.unshift(newHead);
                if (newHead.x === foodRef.current.pos.x && newHead.y === foodRef.current.pos.y) {
                    setScore(s => {
                        const newScore = s + 10;
                        checkPhaseTransition(newScore);
                        return newScore;
                    });
                    spawnParticles(newHead.x * G.GRID_SIZE + G.GRID_SIZE / 2, newHead.y * G.GRID_SIZE + G.GRID_SIZE / 2, '#0ff');
                    G.screenShake = 10;
                    gridRef.current.distort(newHead.x * G.GRID_SIZE, newHead.y * G.GRID_SIZE, 50);
                    foodRef.current.respawn();
                } else {
                    this.body.pop();
                }
                this.colorHue = (this.colorHue + 2) % 360;
            }
            updateFlappy() {
                this.velocity += this.gravity;
                this.yPos += this.velocity;
                const headX = 5 * G.GRID_SIZE;
                if (this.yPos < 0 || this.yPos > G.height) { gameOver(); return; }

                const headRect = { x: headX + 5, y: this.yPos + 5, w: G.GRID_SIZE - 10, h: G.GRID_SIZE - 10 };
                for (let obs of flappyManagerRef.current.obstacles) {
                    if (headRect.x < obs.x + obs.w && headRect.x + headRect.w > obs.x &&
                        (headRect.y < obs.gapY || headRect.y + headRect.h > obs.gapY + obs.gapH)) {
                        gameOver(); return;
                    }
                }
                this.colorHue = (this.colorHue + 5) % 360;
            }
            updateDodge() {
                if (this.moveUp) this.dodgePos.y -= this.dodgeSpeed;
                if (this.moveDown) this.dodgePos.y += this.dodgeSpeed;
                if (this.moveLeft) this.dodgePos.x -= this.dodgeSpeed;
                if (this.moveRight) this.dodgePos.x += this.dodgeSpeed;

                if (this.dodgePos.x < 0) this.dodgePos.x = 0;
                if (this.dodgePos.x > G.width - G.GRID_SIZE) this.dodgePos.x = G.width - G.GRID_SIZE;
                if (this.dodgePos.y < 0) this.dodgePos.y = 0;
                if (this.dodgePos.y > G.height - G.GRID_SIZE) this.dodgePos.y = G.height - G.GRID_SIZE;

                const headRect = { x: this.dodgePos.x + 5, y: this.dodgePos.y + 5, w: G.GRID_SIZE - 10, h: G.GRID_SIZE - 10 };
                for (let laser of dodgeManagerRef.current.lasers) {
                    if (headRect.x < laser.x + laser.w && headRect.x + headRect.w > laser.x &&
                        headRect.y < laser.y + laser.h && headRect.y + headRect.h > laser.y) {
                        gameOver(); return;
                    }
                }
                this.colorHue = (this.colorHue + 10) % 360;
            }
            jump() {
                this.velocity = this.jumpStrength;
                spawnParticles(5 * G.GRID_SIZE, this.yPos, '#ff0', 0.5);
            }
            draw(ctx) {
                ctx.shadowBlur = 20;
                if (G.gameMode === 'SNAKE') {
                    this.body.forEach((seg, i) => {
                        const x = seg.x * G.GRID_SIZE;
                        const y = seg.y * G.GRID_SIZE;
                        ctx.fillStyle = `hsl(${(this.colorHue + i * 5) % 360}, 100%, 50%)`;
                        ctx.shadowColor = ctx.fillStyle;
                        ctx.beginPath();
                        ctx.roundRect(x + 2, y + 2, G.GRID_SIZE - 4, G.GRID_SIZE - 4, 5);
                        ctx.fill();
                    });
                } else if (G.gameMode === 'FLAPPY') {
                    const x = 5 * G.GRID_SIZE;
                    const y = this.yPos;
                    ctx.fillStyle = `hsl(${this.colorHue}, 100%, 50%)`;
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.beginPath();
                    ctx.roundRect(x, y, G.GRID_SIZE, G.GRID_SIZE, 8);
                    ctx.fill();
                } else if (G.gameMode === 'DODGE') {
                    const x = this.dodgePos.x;
                    const y = this.dodgePos.y;
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = '#fff';
                    ctx.beginPath();
                    ctx.arc(x + G.GRID_SIZE / 2, y + G.GRID_SIZE / 2, G.GRID_SIZE / 2 - 2, 0, Math.PI * 2);
                    ctx.fill();
                    spawnParticles(x + G.GRID_SIZE / 2, y + G.GRID_SIZE / 2, '#fff', 0.2);
                }
                ctx.shadowBlur = 0;
            }
        }

        class Food {
            constructor() { this.pos = new Vector(10, 10); this.pulse = 0; }
            respawn() {
                let valid = false;
                while (!valid) {
                    this.pos.x = Math.floor(Math.random() * G.TILE_COUNT_X);
                    this.pos.y = Math.floor(Math.random() * G.TILE_COUNT_Y);
                    valid = true;
                    for (let seg of snakeRef.current.body) {
                        if (seg.x === this.pos.x && seg.y === this.pos.y) { valid = false; break; }
                    }
                }
            }
            update() { this.pulse += 0.1; }
            draw(ctx) {
                if (G.gameMode !== 'SNAKE') return;
                const cx = this.pos.x * G.GRID_SIZE + G.GRID_SIZE / 2;
                const cy = this.pos.y * G.GRID_SIZE + G.GRID_SIZE / 2;
                const size = (Math.sin(this.pulse) * 0.2 + 0.8) * (G.GRID_SIZE / 2 - 2);
                ctx.shadowBlur = 30; ctx.shadowColor = '#f0f'; ctx.fillStyle = '#f0f';
                ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            }
        }

        class FlappyManager {
            constructor() { this.obstacles = []; this.timer = 0; this.spawnRate = 100; this.speed = 5; this.startTime = 0; }
            start() {
                this.obstacles = []; this.timer = 0; this.startTime = Date.now();
                snakeRef.current.yPos = snakeRef.current.body[0].y * G.GRID_SIZE;
                snakeRef.current.velocity = 0;
            }
            update() {
                this.timer++;
                if (this.timer > this.spawnRate) { this.spawnObstacle(); this.timer = 0; }
                for (let i = this.obstacles.length - 1; i >= 0; i--) {
                    let obs = this.obstacles[i];
                    obs.x -= this.speed;
                    if (obs.x + obs.w < 0) {
                        this.obstacles.splice(i, 1);
                        setScore(s => s + 5);
                    }
                }
                if (Date.now() - this.startTime > 10000) prepareTransition('SNAKE');
            }
            spawnObstacle() {
                const gapHeight = 200;
                const gapY = Math.random() * (G.height - gapHeight - 100) + 50;
                this.obstacles.push({ x: G.width, w: 60, gapY, gapH: gapHeight });
            }
            draw(ctx) {
                ctx.fillStyle = '#ff0'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff0';
                this.obstacles.forEach(obs => {
                    ctx.fillRect(obs.x, 0, obs.w, obs.gapY);
                    ctx.fillRect(obs.x, obs.gapY + obs.gapH, obs.w, G.height - (obs.gapY + obs.gapH));
                });
                ctx.shadowBlur = 0;
            }
        }

        class DodgeManager {
            constructor() { this.lasers = []; this.timer = 0; this.spawnRate = 20; this.startTime = 0; }
            start() { this.lasers = []; this.timer = 0; this.startTime = Date.now(); snakeRef.current.dodgePos = new Vector(G.width / 2, G.height / 2); }
            update() {
                this.timer++;
                if (this.timer > this.spawnRate) { this.spawnLaser(); this.timer = 0; }
                for (let i = this.lasers.length - 1; i >= 0; i--) {
                    let l = this.lasers[i];
                    l.x += l.vx; l.y += l.vy;
                    if (l.x < -100 || l.x > G.width + 100 || l.y < -100 || l.y > G.height + 100) {
                        this.lasers.splice(i, 1);
                        setScore(s => s + 1);
                    }
                }
                if (Date.now() - this.startTime > 10000) prepareTransition('SNAKE');
            }
            spawnLaser() {
                const side = Math.floor(Math.random() * 4);
                let x, y, vx, vy, w, h;
                const speed = 7 + (Math.random() * 5);
                const size = 20 + Math.random() * 40;
                if (side === 0) { x = Math.random() * G.width; y = -50; vx = (Math.random() - 0.5) * 2; vy = speed; w = size; h = size * 2; }
                else if (side === 1) { x = G.width + 50; y = Math.random() * G.height; vx = -speed; vy = (Math.random() - 0.5) * 2; w = size * 2; h = size; }
                else if (side === 2) { x = Math.random() * G.width; y = G.height + 50; vx = (Math.random() - 0.5) * 2; vy = -speed; w = size; h = size * 2; }
                else { x = -50; y = Math.random() * G.height; vx = speed; vy = (Math.random() - 0.5) * 2; w = size * 2; h = size; }
                this.lasers.push({ x, y, vx, vy, w, h });
            }
            draw(ctx) {
                ctx.fillStyle = '#f00'; ctx.shadowBlur = 15; ctx.shadowColor = '#f00';
                this.lasers.forEach(l => ctx.fillRect(l.x, l.y, l.w, l.h));
                ctx.shadowBlur = 0;
            }
        }

        snakeRef.current = new Snake();
        foodRef.current = new Food();
        flappyManagerRef.current = new FlappyManager();
        dodgeManagerRef.current = new DodgeManager();

        // Helpers
        const spawnParticles = (x, y, color, speed = 1) => {
            for (let i = 0; i < 15; i++) particlesRef.current.push(new Particle(x, y, color, speed));
        };

        const gameOver = () => {
            G.isRunning = false;
            setGameState('GAME_OVER');
        };

        const checkPhaseTransition = (currentScore) => {
            if (currentScore >= G.nextEventScore) {
                G.nextEventScore += 50;
                const modes = ['FLAPPY', 'DODGE'];
                const pick = modes[Math.floor(Math.random() * modes.length)];
                prepareTransition(pick);
            }
        };

        const prepareTransition = (targetMode) => {
            if (G.gameMode === targetMode) return;
            G.nextMode = targetMode;
            G.gameMode = 'TRANSITION';

            let title = "", sub = "";
            if (G.nextMode === 'FLAPPY') { title = "SYSTEM HACK"; sub = "MODE FLAPPY"; setPhase("FLAPPY HACK"); }
            else if (G.nextMode === 'DODGE') { title = "FIREWALL BREACH"; sub = "MODE SURVIVAL"; setPhase("DODGE SURVIVAL"); }
            else { title = "SYSTEM RESTORED"; sub = "RETOUR AU SNAKE"; setPhase("NEON SNAKE"); }

            setAlert({ title, sub, count: 3 });

            let count = 3;
            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    setAlert(prev => ({ ...prev, count }));
                } else {
                    clearInterval(interval);
                    setAlert(null);
                    switchMode(G.nextMode);
                }
            }, 1000);
        };

        const switchMode = (newMode) => {
            G.gameMode = newMode;
            if (newMode === 'FLAPPY') { flappyManagerRef.current.start(); G.gameSpeed = 16; }
            else if (newMode === 'DODGE') { dodgeManagerRef.current.start(); G.gameSpeed = 16; }
            else {
                snakeRef.current.reset();
                snakeRef.current.body[0].x = 5; snakeRef.current.body[0].y = 10;
                G.gameSpeed = 100;
            }
            G.screenShake = 20; G.glitchIntensity = 10;
        };

        // Game Loop
        const update = (time) => {
            if (!G.isRunning) return;
            const deltaTime = time - G.lastTime;
            G.lastTime = time;

            if (G.gameMode !== 'TRANSITION') {
                G.accumulator += deltaTime;
                if (G.accumulator > G.gameSpeed) {
                    if (G.gameMode === 'SNAKE') {
                        snakeRef.current.updateSnake();
                        const head = snakeRef.current.body[0];
                        gridRef.current.distort(head.x * G.GRID_SIZE, head.y * G.GRID_SIZE, 15);
                    } else if (G.gameMode === 'FLAPPY') {
                        snakeRef.current.updateFlappy();
                        flappyManagerRef.current.update();
                    } else if (G.gameMode === 'DODGE') {
                        snakeRef.current.updateDodge();
                        dodgeManagerRef.current.update();
                    }
                    G.accumulator = 0;
                }
            }

            // Visuals
            foodRef.current.update();
            gridRef.current.update();
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                particlesRef.current[i].update();
                if (particlesRef.current[i].life <= 0) particlesRef.current.splice(i, 1);
            }
            if (G.screenShake > 0) G.screenShake *= 0.9;
            if (G.screenShake < 0.5) G.screenShake = 0;
            if (G.glitchIntensity > 0) G.glitchIntensity *= 0.9;

            draw();
            requestAnimationFrame(update);
        };

        const draw = () => {
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, G.width, G.height);
            ctx.save();

            if (G.screenShake > 0) {
                const dx = (Math.random() - 0.5) * G.screenShake;
                const dy = (Math.random() - 0.5) * G.screenShake;
                ctx.translate(dx, dy);
            }
            if (G.glitchIntensity > 0.5) {
                const gx = (Math.random() - 0.5) * G.glitchIntensity * 5;
                ctx.translate(gx, 0);
            }

            gridRef.current.draw(ctx, G.gameMode);
            if (G.gameMode === 'SNAKE') foodRef.current.draw(ctx);
            else if (G.gameMode === 'FLAPPY') flappyManagerRef.current.draw(ctx);
            else if (G.gameMode === 'DODGE') dodgeManagerRef.current.draw(ctx);

            snakeRef.current.draw(ctx);
            particlesRef.current.forEach(p => p.draw(ctx));
            ctx.restore();
        };

        // Start Loop
        if (gameState === 'PLAYING') {
            G.isRunning = true;
            G.lastTime = performance.now();
            requestAnimationFrame(update);
        }

        return () => {
            G.isRunning = false;
            window.removeEventListener('resize', handleResize);
        };
    }, [gameState]);

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key;
            const G = gameRef.current;
            const snake = snakeRef.current;

            if (G.gameMode === 'SNAKE') {
                if ((key === 'ArrowUp' || key === 'w') && snake.dir.y === 0) snake.nextDir = new Vector(0, -1);
                if ((key === 'ArrowDown' || key === 's') && snake.dir.y === 0) snake.nextDir = new Vector(0, 1);
                if ((key === 'ArrowLeft' || key === 'a') && snake.dir.x === 0) snake.nextDir = new Vector(-1, 0);
                if ((key === 'ArrowRight' || key === 'd') && snake.dir.x === 0) snake.nextDir = new Vector(1, 0);
            } else if (G.gameMode === 'FLAPPY') {
                if (key === ' ' || key === 'ArrowUp' || key === 'w') snake.jump();
            } else if (G.gameMode === 'DODGE') {
                if (key === 'ArrowUp' || key === 'w') snake.moveUp = true;
                if (key === 'ArrowDown' || key === 's') snake.moveDown = true;
                if (key === 'ArrowLeft' || key === 'a') snake.moveLeft = true;
                if (key === 'ArrowRight' || key === 'd') snake.moveRight = true;
            }
        };

        const handleKeyUp = (e) => {
            const key = e.key;
            const G = gameRef.current;
            const snake = snakeRef.current;
            if (G.gameMode === 'DODGE') {
                if (key === 'ArrowUp' || key === 'w') snake.moveUp = false;
                if (key === 'ArrowDown' || key === 's') snake.moveDown = false;
                if (key === 'ArrowLeft' || key === 'a') snake.moveLeft = false;
                if (key === 'ArrowRight' || key === 'd') snake.moveRight = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const startGame = () => {
        setScore(0);
        setPhase('NEON SNAKE');
        setGameState('PLAYING');
        // Reset refs
        const G = gameRef.current;
        G.gameMode = 'SNAKE';
        G.nextEventScore = 50;
        G.gameSpeed = 100;
        snakeRef.current.reset();
        foodRef.current.respawn();
        particlesRef.current = [];
    };

    return (
        <div className="snake-game-container">
            <canvas ref={canvasRef} className="snake-game-canvas"></canvas>

            <div id="ui-layer">
                <div id="score-board">
                    SCORE: <span>{score}</span>
                    <div id="level-indicator">PHASE: <span>{phase}</span></div>
                </div>

                {alert && (
                    <div id="mode-alert">
                        <h2 className="glitch" data-text={alert.title}>{alert.title}</h2>
                        <p>{alert.sub}</p>
                        <div id="countdown">{alert.count}</div>
                    </div>
                )}

                {gameState === 'START' && (
                    <div id="start-screen">
                        <h1 className="glitch" data-text="NEON SNAKE">NEON SNAKE</h1>
                        <h2 className="subtitle">EVOLUTION</h2>
                        <div className="controls-info">
                            <p>WASD / FLÈCHES : Bouger</p>
                            <p>ESPACE : Voler (Flappy)</p>
                            <p>SURVIVRE : Éviter les lasers (Matrix)</p>
                        </div>
                        <button className="snake-btn" onClick={startGame}>LANCER LE SYSTÈME</button>
                        <div style={{ marginTop: '20px' }}>
                            <Link to="/" style={{ color: '#0ff', textDecoration: 'none' }}>RETOUR AU HUB</Link>
                        </div>
                    </div>
                )}

                {gameState === 'GAME_OVER' && (
                    <div id="game-over-screen">
                        <h1 className="glitch" data-text="CRITICAL ERROR">CRITICAL ERROR</h1>
                        <p style={{ fontSize: '24px', margin: '20px 0' }}>Score Final: <span>{score}</span></p>
                        <button className="snake-btn" onClick={startGame}>REBOOT</button>
                        <div style={{ marginTop: '20px' }}>
                            <Link to="/" style={{ color: '#0ff', textDecoration: 'none' }}>RETOUR AU HUB</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SnakeGame;
