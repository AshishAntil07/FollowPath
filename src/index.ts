
type TimelineKey = `${number}%`;

interface FollowPathConfig {
  element: HTMLElement;
  duration: number;
  path: SVGPathElement | SVGPolylineElement;
  iterations: number;
  delay?: number;
  toScale?: boolean;
  rotate?: boolean;
  callback?: () => void;
  timeline?: {
    [key: TimelineKey]: () => void;
  };
  easing?: (t: number) => number;
  mode?: 'pingpong' | 'loop' | 'clamp' | ((t: number) => number);
}

class FollowPath {

  #element;
  #duration;
  #stopAll;
  #rotate;
  #privateIterations;

  #exceedEasing;

  #exceedEasingModes = {
    'clamp': (_: number) => 1,
    'loop': (t: number) => t > 1 ? t % 1 : 1 - (t % 1),
    'pingpong': (t: number) => t > 1 ? 1 - (t % 1) : -(t % 1)
  };

  /**
   * Stores the key-value map of timeline
   */
  #timeline;

  /**
   * Stores the sorted keys of the timeline. **Sorted in Descending Order**
   */
  #timelineSorted;

  // public properties
  path;
  iterations;
  callback;
  delay;
  easing;
  scale;
  fps?: number;

  /**
   * Creates an instance.
   * 
   * @param config Configuration object
   * - `element`: Element to animate.
   * - `duration`: Duration of animation(in ms)
   * - `path`: Path to follow
   * - `delay`: Delay between each iteration(in ms)
   * - `toScale`: Whether to match the animation to the current scale of the path. False by default.
   * - `rotate`: Whether to rotate the elements along the path or not
   * - `iterations`: Number of times animation should be repeated, can be set to `Infinity` for infinite loops, but that would cause the callback to never be called. You can also set it to a floating point number to do partial iterations.
   * - `callback`: Callback function to be called after animation
   * - `timeline`: Object containing functions to be called at specific points in the animation. The keys should be in the format of `percentage%` where percentage is the percentage of the path covered.
   * - `easing`: Easing function to be used for the animation. The function should take a single argument `t` which is the progress index of the animation ranging from 0 to 1 and return a value between 0 and 1. The default easing function is linear.
   * - `mode`: Defines how the animation behaves when it exceeds the total path length.  
   *   -- `'loop'`: Restarts from the beginning once the end is reached (wrap-around).  
   *   -- `'clamp'`: Stops at the end of the path and holds the final position.  
   *   -- `'pingpong'`: Reverses direction on each iteration, creating a back-and-forth effect.  
   *   -- `(t: number) => number`: A custom function to map progress manually.  
   *     Default is `'clamp'
   */

  constructor(config: FollowPathConfig) {

    if (!this.#validateConfig(config)) throw Error("Invalid Config.");

    const { element, duration, path, iterations, callback, rotate, timeline, toScale, delay, mode, easing } = config;

    const bbox = path.getBBox();
    const rect = path.getBoundingClientRect();

    this.#element = element;
    this.#duration = duration;
    this.path = path;
    this.#privateIterations = iterations;
    this.iterations = iterations;
    this.callback = callback;

    this.delay = delay;
    this.easing = easing || ((t) => t);
    this.#exceedEasing = typeof mode === 'function' ? mode : mode && Object.keys(this.#exceedEasingModes).includes(mode) ? this.#exceedEasingModes[mode] : this.#exceedEasingModes['clamp'];

    this.scale = toScale ? {
      x: rect.width / bbox.width,
      y: rect.height / bbox.height
    } : { x: 1, y: 1 };

    this.#rotate = rotate || false;
    this.#timeline = timeline;
    this.#timelineSorted = timeline ? Object.keys(timeline).map(e => Number(e.slice(0, e.length - 1))).sort((a, b) => b - a) : null;
    this.#stopAll = false;
  }

  /**
   * Animates the elements on the svg path in the given durations and calls the callback function after completion.
   * 
   * You can specify an optional `iterNumber` (iteration number), to skip some iterations, or pass it as a floating point number to start from between the path.
   * @param { { iterNumber?: number, singleFrame?: boolean } } param0 
   *  - `iterNumber` - Iteration number, 0 by default.
   *  - `singleFrame` - Whether to render a single frame, or the whole animation.
   */
  animate({ iterNumber, singleFrame }: { iterNumber?: number; singleFrame?: boolean; }) {
    if (!this.path || !this.#element || !this.#duration) {
      throw Error(`Runtime Error (FollowPath): ${!this.path ? 'Path' : !this.#element ? 'Element' : !this.#duration ? 'Duration' : ''} not specified.`);
    }

    if (!iterNumber) iterNumber = 0;

    this.fps = undefined;
    let prevTime: number | null = null;

    const totalLength = this.path.getTotalLength();
    if ((this.#privateIterations <= 0 || iterNumber > this.#privateIterations) && this.callback) {
      this.fps = undefined;
      this.callback();
      return;
    }

    const ease = (length: number) => {
      const easedLength = totalLength * this.easing(length / totalLength);

      return easedLength > totalLength || easedLength < 0 ? this.#exceedEasing(easedLength) : easedLength
    }

    const startPos = iterNumber - Math.floor(iterNumber);

    let pixelsPerMs = (totalLength / this.#duration) * (1 / (this.fps || 60));
    let currentLength = totalLength * startPos;

    this.iterations = iterNumber;

    const animator = () => {
      iterNumber = this.iterations;   // to listen for change in progress.

      // stop the animation if interrupted, or target iterations reached.
      if (this.#stopAll || iterNumber >= this.#privateIterations) {
        this.fps = undefined;
        if (!this.#stopAll && this.callback) this.callback();
        return;
      };

      // iteration completed
      if (currentLength >= totalLength) {
        if (iterNumber <= this.#privateIterations) this.delay ? setTimeout(() =>
          requestAnimationFrame(() => this.animate({ iterNumber })),
          this.delay
        ) : requestAnimationFrame(() => this.animate({ iterNumber }));
        return;
      }

      // calculate speed and fps.
      if (prevTime) {
        const timePerFrame = Date.now() - prevTime;
        this.fps = 1000 / timePerFrame;
        pixelsPerMs = (totalLength / this.#duration) * (timePerFrame);
      }

      // call timeline callback if present
      if (this.#timeline && this.#timelineSorted) {
        while ((iterNumber / this.#privateIterations) * 100 >= this.#timelineSorted[this.#timelineSorted.length - 1]) {
          const timelineNumber = this.#timelineSorted.pop();
          if (timelineNumber) this.#timeline[`${timelineNumber}%`]();
        }
      }

      // calculating next step

      let point = this.path.getPointAtLength(ease(currentLength));
      let nextPoint = this.path.getPointAtLength(ease(currentLength + 1));
      let angle = 0;

      if (!(nextPoint.x === this.path.getPointAtLength(totalLength).x && nextPoint.y === this.path.getPointAtLength(totalLength).y)) {
        angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;
      } else {
        let prevPoint = this.path.getPointAtLength(currentLength - 1);
        angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;
      }

      this.#element.style.transform = `translate(${point.x * this.scale.x}px, ${point.y * this.scale.y}px)${this.#rotate ? ` rotate(${angle}deg)` : ''}`;
      currentLength += pixelsPerMs;
      iterNumber += pixelsPerMs / totalLength;
      this.iterations = iterNumber;

      prevTime = Date.now();
      requestAnimationFrame(animator);
    }

    prevTime = Date.now();
    requestAnimationFrame(animator);
  }

  /**
   * Renders a specific frame, if not specified, renders a next frame.
   * @param {number} frameNumber The frame to render. (60 fps)
   */
  renderFrame(frameNumber?: number) {
    this.animate({ singleFrame: true, iterNumber: frameNumber ? frameNumber / ((this.#duration / 50) * 3) : this.iterations });
  }

  /**
   * Continues the animation.
   */
  play() {
    this.#stopAll = false;
    this.animate({ iterNumber: this.iterations });
  }

  /**
   * Pauses the animation.
   */
  pause() {
    this.#stopAll = true;
  }

  /**
   * Stops the animation
   */
  stop() {
    this.#stopAll = true;
    this.iterations = 0;
  }

  /**
   * Returns the current progress of the animation.
   * @returns The progress of animation in percentage.
   */
  getProgress() {
    return (this.iterations / this.#privateIterations) * 100;
  }

  /**
   * Sets the progress of the animation.
   * @param {number} percentage Current Progress in percentage.
   */
  setProgress(percentage: number) {
    this.iterations = (percentage * this.#privateIterations) / 100
  }

  /**
   * Returns the progress of current iteration. (whole iteration = 100%)
   * For example, progress of current iteration at 1.5 iterations would be 50%.
   * @returns The progress of current iteration in percentage.
   */
  getCurrentIterationProgress() {
    return (this.#privateIterations - Math.floor(this.#privateIterations)) * 100;
  }

  /**
   * Sets the progress of current iteration.
   * @param {number} percentage Current Progress in percentage.
   */
  setCurrentIterationProgress(percentage: number) {
    this.iterations = (Math.floor(this.iterations) + percentage / 100)
  }

  #validateConfig(config: FollowPathConfig) {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return false;

    const {
      duration, path, element, iterations,
      easing, mode, delay, toScale,
      rotate, callback, timeline
    } = config;

    if (
      typeof duration !== "number" || Number.isNaN(duration) ||
      !path ||
      !element ||
      typeof iterations !== "number" || Number.isNaN(iterations) ||
      (typeof easing !== 'function') ||
      mode && (typeof mode !== 'function' && !Object.keys(this.#exceedEasingModes).includes(mode))
    ) return false;

    if (delay !== undefined && (typeof delay !== "number" || Number.isNaN(delay))) return false;
    if (toScale !== undefined && typeof toScale !== "boolean") return false;
    if (rotate !== undefined && typeof rotate !== "boolean") return false;
    if (callback !== undefined && typeof callback !== "function") return false;

    if (timeline !== undefined) {
      if (typeof timeline !== "object" || Array.isArray(timeline)) return false;
      for (const key in timeline) {
        if (!/^(\d{1,3})%$/.test(key)) return false;
        if (typeof timeline[key as TimelineKey] !== "function") return false;
      }
    }

    return true;
  }
}

export default FollowPath;