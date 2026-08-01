import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Animations } from '../../animations';

interface Obstacle {
  x: number;
  width: number;
  height: number;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

type GameState = 'idle' | 'playing' | 'gameover';

const BEST_SCORE_KEY = 'portfolio-demo-game-best';

@Component({
  selector: 'app-demo-game',
  templateUrl: './demo-game.component.html',
  styleUrls: ['./demo-game.component.scss'],
  animations: Animations.animate,
})
export class DemoGameComponent implements AfterViewInit, OnDestroy {
  state = 'active';
  gameState: GameState = 'idle';
  score = 0;
  best = 0;

  @ViewChild('canvasRef') private canvasRef?: ElementRef<HTMLCanvasElement>;
  private ctx?: CanvasRenderingContext2D;

  private readonly logicalWidth = 640;
  private readonly logicalHeight = 220;
  private readonly groundY = 170;
  private readonly gravity = 2200;
  private readonly jumpVelocity = -760;
  private readonly playerSize = 28;
  private readonly playerX = 60;

  private playerY = this.groundY;
  private playerVy = 0;
  private obstacles: Obstacle[] = [];
  private speed = 260;
  private spawnTimer = 0;
  private nextSpawnIn = 900;
  private elapsed = 0;

  private rafId: number | undefined;
  private lastTime: number | undefined;
  private colors = {
    accent: '#7c5cff',
    obstacle: '#12a294',
    ground: 'rgba(255, 255, 255, 0.16)',
  };

  private readonly resizeCanvas = (): void => {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = this.logicalWidth * dpr;
    canvas.height = this.logicalHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  };

  private readonly handleVisibility = (): void => {
    if (document.hidden) {
      if (this.rafId != null) cancelAnimationFrame(this.rafId);
    } else if (this.gameState === 'playing') {
      this.lastTime = undefined;
      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  get actionLabel(): string {
    if (this.gameState === 'playing') return 'Jump';
    if (this.gameState === 'gameover') return 'Play again';
    return 'Start game';
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    this.ctx = ctx;
    this.readThemeColors(canvas);
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    document.addEventListener('visibilitychange', this.handleVisibility);

    const stored = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0);
    this.best = Number.isFinite(stored) ? stored : 0;
    this.draw();
  }

  ngOnDestroy(): void {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeCanvas);
    document.removeEventListener('visibilitychange', this.handleVisibility);
  }

  handleAction(): void {
    if (this.gameState === 'playing') {
      this.jump();
    } else {
      this.startGame();
    }
  }

  private jump(): void {
    if (this.playerY >= this.groundY - 0.5) {
      this.playerVy = this.jumpVelocity;
    }
  }

  private startGame(): void {
    this.gameState = 'playing';
    this.score = 0;
    this.obstacles = [];
    this.speed = 260;
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.nextSpawnIn = 900;
    this.playerY = this.groundY;
    this.playerVy = 0;
    this.lastTime = undefined;
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(this.loop);
  }

  private readonly loop = (time: number): void => {
    if (this.gameState !== 'playing') return;
    const last = this.lastTime ?? time;
    const dt = Math.min((time - last) / 1000, 0.05);
    this.lastTime = time;

    this.update(dt);
    this.draw();

    if (this.gameState === 'playing') {
      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  private update(dt: number): void {
    this.elapsed += dt;
    this.score = Math.floor(this.elapsed * 12);
    this.speed = 260 + this.elapsed * 14;

    this.playerVy += this.gravity * dt;
    this.playerY += this.playerVy * dt;
    if (this.playerY > this.groundY) {
      this.playerY = this.groundY;
      this.playerVy = 0;
    }

    this.spawnTimer += dt * 1000;
    if (this.spawnTimer >= this.nextSpawnIn) {
      this.spawnTimer = 0;
      this.nextSpawnIn = 650 + Math.random() * 700;
      this.obstacles.push({
        x: this.logicalWidth + 10,
        width: 16 + Math.random() * 12,
        height: 22 + Math.random() * 24,
      });
    }

    for (const obstacle of this.obstacles) {
      obstacle.x -= this.speed * dt;
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > -10);

    const playerBox: Box = {
      x: this.playerX - this.playerSize / 2,
      y: this.playerY - this.playerSize,
      w: this.playerSize,
      h: this.playerSize,
    };
    for (const obstacle of this.obstacles) {
      const obstacleBox: Box = {
        x: obstacle.x,
        y: this.groundY - obstacle.height,
        w: obstacle.width,
        h: obstacle.height,
      };
      if (this.intersects(playerBox, obstacleBox)) {
        this.endGame();
        return;
      }
    }
  }

  private intersects(a: Box, b: Box): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  private endGame(): void {
    this.gameState = 'gameover';
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    if (this.score > this.best) {
      this.best = this.score;
      window.localStorage.setItem(BEST_SCORE_KEY, String(this.best));
    }
    this.draw();
  }

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

    ctx.strokeStyle = this.colors.ground;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY + 1);
    ctx.lineTo(this.logicalWidth, this.groundY + 1);
    ctx.stroke();

    ctx.fillStyle = this.colors.accent;
    this.roundRectPath(ctx, this.playerX - this.playerSize / 2, this.playerY - this.playerSize, this.playerSize, this.playerSize, 6);
    ctx.fill();

    ctx.fillStyle = this.colors.obstacle;
    for (const obstacle of this.obstacles) {
      this.roundRectPath(ctx, obstacle.x, this.groundY - obstacle.height, obstacle.width, obstacle.height, 4);
      ctx.fill();
    }
  }

  private roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private readThemeColors(canvas: HTMLCanvasElement): void {
    const styles = getComputedStyle(canvas);
    const accent = styles.getPropertyValue('--accent').trim();
    const obstacle = styles.getPropertyValue('--chart-series-2').trim();
    const ground = styles.getPropertyValue('--border-2').trim();
    if (accent) this.colors.accent = accent;
    if (obstacle) this.colors.obstacle = obstacle;
    if (ground) this.colors.ground = ground;
  }
}
