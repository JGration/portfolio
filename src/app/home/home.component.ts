import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Animations } from '../animations';
import anime from 'animejs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: Animations.animate,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  state = 'inactive';
  private fadeInTimeoutId: number | undefined;
  private removeCursorTimeoutId: number | undefined;
  private blinkAnimation: anime.AnimeInstance | undefined;
  private timelineAnimation: anime.AnimeInstance | undefined;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.triggerFadeInAnimation();
  }

  private triggerFadeInAnimation(): void {
    this.fadeInTimeoutId = window.setTimeout(() => {
      this.state = 'active';
    }, 4000);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.focusNextElement();
    }
  }

  private focusNextElement(): void {
    const focusableElements = this.host.nativeElement.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    if (!focusableElements.length) return;
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (document.activeElement === lastElement) {
      firstElement.focus();
    } else {
      for (let i = 0; i < focusableElements.length - 1; i++) {
        if (focusableElements[i] === document.activeElement) {
          (focusableElements[i + 1] as HTMLElement).focus();
          break;
        }
      }
    }
  }

  ngAfterViewInit() {
    const element = document.querySelector<HTMLElement>('.text-animation');
    if (!element) return;

    const text = element.textContent || '';
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const lettersHtml = Array.from(text)
      .map((ch) =>
        ch === ' '
          ? '<span class="letter">&nbsp;</span>'
          : `<span class="letter">${escapeHtml(ch)}</span>`
      )
      .join('');
    element.innerHTML = `<div class="letters">${lettersHtml}</div><span class="cursor"></span>`;
    element.style.display = 'block';

    const letters = Array.from(element.querySelectorAll('.letter'));
    const TYPE_AFTER_MS = 1000;
    const JUMP_AFTER_MS = 100;

    this.blinkAnimation = anime({
      targets: '.text-animation .cursor',
      loop: true,
      duration: 750,
      opacity: [{ value: [1, 1] }, { value: [0, 0] }],
    });

    this.timelineAnimation = anime
      .timeline({ loop: false })
        .add(
          {
            targets: '.text-animation .cursor',
            position: 'absolute',

            translateX: letters.map((letter: any, i) => ({
              value: letter.offsetLeft + letter.offsetWidth,
              duration: 1,
              delay: i === 0 ? 0 : JUMP_AFTER_MS,
            })),
          },
          TYPE_AFTER_MS
        )
        .add(
          {
            targets: '.text-animation .letter',
            opacity: [0, 1],
            duration: 1,
            delay: anime.stagger(JUMP_AFTER_MS),
            changeBegin: () => {
              this.blinkAnimation?.pause();
            },
            changeComplete: () => {
              this.blinkAnimation?.restart();
            },
          },
          TYPE_AFTER_MS
        );

    this.timelineAnimation.finished.then(() => {
      this.removeCursorTimeoutId = window.setTimeout(() => {
        const cursor = document.querySelector<HTMLElement>('.cursor');
        cursor?.parentNode?.removeChild(cursor);
      }, 4000);
    });
  }

  ngOnDestroy(): void {
    if (this.fadeInTimeoutId != null) window.clearTimeout(this.fadeInTimeoutId);
    if (this.removeCursorTimeoutId != null) window.clearTimeout(this.removeCursorTimeoutId);
    this.timelineAnimation?.pause();
    this.blinkAnimation?.pause();
  }
}
