export interface SnapRollDetail {
  index: number;
  isScrolled: boolean;
  progress: number;
}

declare global {
  interface WindowEventMap {
    "snaproll-scroll": CustomEvent<SnapRollDetail>;
  }
}
