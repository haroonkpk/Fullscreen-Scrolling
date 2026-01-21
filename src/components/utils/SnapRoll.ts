import { SnapRollDetail } from "@/src/types/events";

// --- Internal Interfaces ---
interface EventListenerConfig {
  target: Window | HTMLElement;
  event: string;
  handler: (e: Event) => void;
  options?: AddEventListenerOptions;
}

export interface SnapRollOptions {
  container?: string | HTMLElement;
  sectionSelector?: string;
  activeClass?: string;
  prevClass?: string;
  keyboard?: boolean;
  scrollTimeout?: number;
  touchThreshold?: number; 
  wheelDeltaThreshold?: number;
  wheelGestureEndDelay?: number;
  onScroll?: (data: { index: number; progress: number }) => void;
}

// Default values
const DEFAULTS: Required<Omit<SnapRollOptions, "container" | "onScroll">> &
  Pick<SnapRollOptions, "container" | "onScroll"> = {
  container: ".sr-cont",
  sectionSelector: ".sr-sec",
  activeClass: "sr-active",
  prevClass: "sr-prev",
  keyboard: true,
  scrollTimeout: 1000,
  touchThreshold: 50, 
  wheelDeltaThreshold: 20,
  wheelGestureEndDelay: 100,
  onScroll: undefined,
};

export default class SnapRoll {
  opts: SnapRollOptions;
  container: HTMLElement | null = null;
  sections: HTMLElement[] = [];
  currentIndex: number = 0;
  _isAnimating: boolean = false;
  _touchStartY: number | null = null;
  _wheelGestureTimeout: ReturnType<typeof setTimeout> | null = null;
  listeners: EventListenerConfig[] = [];

  constructor(options: SnapRollOptions = {}) {
    this.opts = { ...DEFAULTS, ...options };
    if (typeof window === "undefined") return;

    try {
      this._findAndValidateContainer();
      this.listeners = this._defineListeners();
      this.init();
    } catch (e) {
      console.error(e);
    }
  }


  private _findAndValidateContainer(): void {
    const container =
      typeof this.opts.container === "string"
        ? document.querySelector<HTMLElement>(this.opts.container)
        : this.opts.container;
    if (!container) throw new Error(`SnapRoll: Container not found`);
    this.container = container as HTMLElement;
    
    this.container.style.height = '100vh';
    this.container.style.height = '100dvh'; 
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'relative';
  }

  private _defineListeners(): EventListenerConfig[] {
    if (!this.container) return [];

    return [
      {
        target: window,
        event: "keydown",
        handler: (e: Event) => this._onKeyDown(e as KeyboardEvent),
      },
      {
        target: this.container,
        event: "wheel",
        handler: (e: Event) => this._onWheel(e as WheelEvent),
        options: { passive: false },
      },
      {
        target: this.container,
        event: "touchstart",
        handler: (e: Event) => this._onTouchStart(e as TouchEvent),
        options: { passive: true },
      },
      {
        target: this.container,
        event: "touchend",
        handler: (e: Event) => this._onTouchEnd(e as TouchEvent),
        options: { passive: true },
      },
    ];
  }

  public init(): void {
    this.refresh();
    if (this.sections.length > 0) this._toggleEventListeners(true);
  }

  public refresh(): void {
    if (!this.container) return;
    this.sections = Array.from(
      this.container.querySelectorAll<HTMLElement>(this.opts.sectionSelector!)
    );
    this._updateActiveElements();
  }

  public destroy(): void {
    this._toggleEventListeners(false);
    this.sections.forEach((el) => {
      el.style.transform = "";
      el.style.opacity = "";
      el.classList.remove(this.opts.activeClass!, this.opts.prevClass!);
    });
    this.listeners = [];
  }

  private _toggleEventListeners(add: boolean): void {
    const action = add ? "addEventListener" : "removeEventListener";
    this.listeners.forEach(({ target, event, handler, options }) => {
      target[action](event, handler, options);
    });
  }

  public next(): void {
    this.goToSection(this.currentIndex + 1);
  }
  public prev(): void {
    this.goToSection(this.currentIndex - 1);
  }

  public goToSection(index: number): void {
    if (this._isAnimating || index < 0 || index >= this.sections.length) return;

    this.currentIndex = index;
    this._updateActiveElements();

    if (typeof window !== "undefined") {
      const detail: SnapRollDetail = {
        index: this.currentIndex,
        isScrolled: this.currentIndex > 0,
        progress: this.currentIndex / Math.max(1, this.sections.length - 1),
      };
      const event = new CustomEvent("snaproll-scroll", { detail });
      window.dispatchEvent(event);
    }

    if (this.opts.onScroll) {
      this.opts.onScroll({
        index: this.currentIndex,
        progress: this.currentIndex / Math.max(1, this.sections.length - 1),
      });
    }
  }

  private _updateActiveElements(): void {
    this._isAnimating = true;
    this.sections.forEach((sec, i) => {
      sec.classList.remove(this.opts.activeClass!, this.opts.prevClass!);
      if (i !== this.currentIndex) {
        sec.scrollTop = 0;
      }
      if (i === this.currentIndex) sec.classList.add(this.opts.activeClass!);
      if (i < this.currentIndex) sec.classList.add(this.opts.prevClass!);
    });

    setTimeout(() => {
      this._isAnimating = false;
    }, this.opts.scrollTimeout);
  }

  // --- Helper to check scroll boundaries ---
  private _shouldAllowInternalScroll(
    direction: "up" | "down",
    element: HTMLElement
  ): boolean {
    const scrollTop = Math.ceil(element.scrollTop);
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    const isScrollable = scrollHeight > clientHeight;

    if (!isScrollable) return false;

    if (direction === "down") {
      return scrollTop + clientHeight < scrollHeight - 2;
    } else {
      return scrollTop > 0;
    }
  }

  private _onWheel(e: WheelEvent): void {
    if (this._isAnimating) {
      e.preventDefault();
      return;
    }

    const currentSection = this.sections[this.currentIndex];
    const direction = e.deltaY > 0 ? "down" : "up";

    if (this._shouldAllowInternalScroll(direction, currentSection)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (Math.abs(e.deltaY) < (this.opts.wheelDeltaThreshold || 20)) return;

    if (this._wheelGestureTimeout) {
      clearTimeout(this._wheelGestureTimeout);
    } else {
      e.deltaY > 0 ? this.next() : this.prev();
    }

    this._wheelGestureTimeout = setTimeout(() => {
      this._wheelGestureTimeout = null;
    }, this.opts.wheelGestureEndDelay);
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (this._isAnimating) return;
    if (e.key === "ArrowDown") this.next();
    if (e.key === "ArrowUp") this.prev();
  }

  private _onTouchStart(e: TouchEvent): void {
    this._touchStartY = e.touches[0].clientY;
  }

  private _onTouchEnd(e: TouchEvent): void {
    if (this._touchStartY === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = this._touchStartY - touchEndY;
    const direction = deltaY > 0 ? "down" : "up";

    const currentSection = this.sections[this.currentIndex];

    if (this._shouldAllowInternalScroll(direction, currentSection)) {
      this._touchStartY = null;
      return;
    }

    if (Math.abs(deltaY) > (this.opts.touchThreshold || 50)) {
      deltaY > 0 ? this.next() : this.prev();
    }
    this._touchStartY = null;
  }
}