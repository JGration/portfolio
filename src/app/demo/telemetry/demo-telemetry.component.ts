import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Animations } from '../../animations';

type SeriesKey = 'a' | 'b';

interface TelemetryPoint {
  t: number;
  a: number;
  b: number;
}

interface SeriesDef {
  key: SeriesKey;
  label: string;
  color: string;
}

interface HoverInfo {
  index: number;
  x: number;
  point: TelemetryPoint;
}

interface TableRow {
  label: string;
  a: number;
  b: number;
}

@Component({
  selector: 'app-demo-telemetry',
  templateUrl: './demo-telemetry.component.html',
  styleUrls: ['./demo-telemetry.component.scss'],
  animations: Animations.animate,
})
export class DemoTelemetryComponent implements OnInit, OnDestroy {
  state = 'inactive';

  readonly viewBoxWidth = 720;
  readonly viewBoxHeight = 260;
  private readonly padTop = 16;
  private readonly padBottom = 28;

  readonly windowOptions: number[] = [30, 60, 120];
  windowSize = 60;

  readonly seriesList: SeriesDef[] = [
    { key: 'a', label: 'Sensor A', color: 'var(--accent)' },
    { key: 'b', label: 'Sensor B', color: 'var(--chart-series-2)' },
  ];

  seriesVisible: Record<SeriesKey, boolean> = { a: true, b: true };

  playing = true;
  viewMode: 'chart' | 'table' = 'chart';
  data: TelemetryPoint[] = [];
  hover: HoverInfo | null = null;

  @ViewChild('svgRef') private svgRef?: ElementRef<SVGSVGElement>;

  private tick = 0;
  private timerId: number | undefined;
  private valueA = 3200;
  private valueB = 2950;

  ngOnInit(): void {
    window.setTimeout(() => {
      this.state = 'active';
    }, 100);
    this.seed();
    this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  get currentA(): number {
    return this.data.length ? this.data[this.data.length - 1].a : this.valueA;
  }

  get currentB(): number {
    return this.data.length ? this.data[this.data.length - 1].b : this.valueB;
  }

  get gridValues(): number[] {
    const min = this.yMin;
    const max = this.yMax;
    return [max, (min + max) / 2, min];
  }

  get tooltipLeftPercent(): number {
    if (!this.hover) return 50;
    const pct = (this.hover.x / this.viewBoxWidth) * 100;
    return Math.min(94, Math.max(6, pct));
  }

  get tableRows(): TableRow[] {
    const rows = this.data.map((p, i) => ({
      label: `t-${this.data.length - 1 - i}s`,
      a: p.a,
      b: p.b,
    }));
    return rows.slice(-12).reverse();
  }

  private get yMin(): number {
    return Math.min(...this.visibleValues) - 8;
  }

  private get yMax(): number {
    return Math.max(...this.visibleValues) + 8;
  }

  private get visibleValues(): number[] {
    const values: number[] = [];
    for (const p of this.data) {
      if (this.seriesVisible.a) values.push(p.a);
      if (this.seriesVisible.b) values.push(p.b);
    }
    return values.length ? values : [0, 1];
  }

  xForIndex(index: number): number {
    const n = this.data.length - 1 || 1;
    return (index / n) * this.viewBoxWidth;
  }

  yForValue(value: number): number {
    const min = this.yMin;
    const max = this.yMax;
    const range = max - min || 1;
    const plotHeight = this.viewBoxHeight - this.padTop - this.padBottom;
    return this.padTop + (1 - (value - min) / range) * plotHeight;
  }

  pathFor(key: SeriesKey): string {
    if (!this.data.length) return '';
    return this.data
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${this.xForIndex(i).toFixed(1)} ${this.yForValue(p[key]).toFixed(1)}`)
      .join(' ');
  }

  toggle(): void {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  }

  toggleSeries(key: SeriesKey): void {
    const other: SeriesKey = key === 'a' ? 'b' : 'a';
    if (this.seriesVisible[key] && !this.seriesVisible[other]) return;
    this.seriesVisible[key] = !this.seriesVisible[key];
  }

  setWindow(size: number): void {
    this.windowSize = size;
    const last = this.data[this.data.length - 1];
    this.data = [];
    if (last) {
      this.valueA = last.a;
      this.valueB = last.b;
      this.tick = last.t;
    }
    for (let i = 0; i < size; i++) this.pushPoint();
  }

  onPointerMove(event: MouseEvent): void {
    this.updateHoverFromClientX(event.clientX);
  }

  onTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    if (touch) this.updateHoverFromClientX(touch.clientX);
  }

  onPointerLeave(): void {
    this.hover = null;
  }

  private updateHoverFromClientX(clientX: number): void {
    const svg = this.svgRef?.nativeElement;
    if (!svg || !this.data.length) return;
    const rect = svg.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const n = this.data.length - 1 || 1;
    const index = Math.min(this.data.length - 1, Math.max(0, Math.round(ratio * n)));
    this.hover = { index, x: this.xForIndex(index), point: this.data[index] };
  }

  private seed(): void {
    this.data = [];
    for (let i = 0; i < this.windowSize; i++) this.pushPoint();
  }

  private step(prev: number, baseline: number, volatility: number): number {
    const pull = (baseline - prev) * 0.05;
    const noise = (Math.random() - 0.5) * volatility;
    return prev + pull + noise;
  }

  private pushPoint(): void {
    this.valueA = this.step(this.valueA, 3200, 18);
    this.valueB = this.step(this.valueB, 2950, 14);
    this.tick += 1;
    this.data.push({ t: this.tick, a: this.valueA, b: this.valueB });
    if (this.data.length > this.windowSize) this.data.shift();
  }

  private start(): void {
    this.playing = true;
    this.scheduleTick();
  }

  private stop(): void {
    this.playing = false;
    if (this.timerId != null) window.clearTimeout(this.timerId);
  }

  private scheduleTick(): void {
    this.timerId = window.setTimeout(() => {
      this.pushPoint();
      if (this.playing) this.scheduleTick();
    }, 900);
  }
}
