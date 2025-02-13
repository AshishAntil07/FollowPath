class FollowPath {

  #element;
  #duration;
  #stopAll;
  #rotate;
  #privateIterations;

  /**
   * Stores the key-value map of timeline
   */
  #timeline;

  /**
   * Stores the sorted keys of the timeline. **Sorted in Descending Order**
   */
  #timelineSorted;

  /**
   * Creates an instance.
   * 
   * @param { {
   *  element: HTMLElement,
   *  duration: number,
   *  path: SVGPathElement | SVGPolylineElement,
   *  iterations: number,
   *  delay?: number,
   *  toScale?: boolean,
   *  rotate?: boolean,
   *  callback?: function,
   *  timeline?: {
   *    [key: `${number}%`]: () => void;
   *  }
   * } } config Configuration object
   * - `element`: Element to animate.
   * - `duration`: Duration of animation(in ms)
   * - `path`: Path to follow
   * - `delay`: Delay between each iteration(in ms)
   * - `toScale`: Whether to match the animation to the current scale of the path. False by default.
   * - `rotate`: Whether to rotate the elements along the path or not
   * - `iterations`: Number of times animation should be repeated, can be set to `Infinity` for infinite loops, but that would cause the callback to never be called. You can also set it to a floating point number to do partial iterations.
   * - `callback`: Callback function to be called after animation
   * - `timeline`: Object containing functions to be called at specific points in the animation. The keys should be in the format of `percentage%` where percentage is the percentage of the path covered.
   */

  constructor(config) {

    if (!this.#validateConfig(config)) throw Error("Invalid Config.");

    const { element, duration, path, iterations, callback, rotate, timeline, toScale, delay } = config;

    const bbox = path.getBBox();
    const rect = path.getBoundingClientRect();

    this.#element = element;
    this.#duration = duration;
    this.path = path;
    this.#privateIterations = iterations;
    this.iterations = iterations;
    this.callback = callback;

    this.delay = delay;

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
   * @param { number } iterNumber Current Iteration Number
   */
  animate(iterNumber = 0) {
    if (!this.path || !this.#element || !this.#duration) {
      throw Error(`Runtime Error (FollowPath): ${!this.path ? 'Path' : !this.#element ? 'Element' : !this.#duration ? 'Duration' : ''} not specified.`);
    }

    this.fps = null;
    let prevTime = null;

    const totalLength = this.path.getTotalLength();
    if ((this.#privateIterations <= 0 || iterNumber > this.#privateIterations) && this.callback) {
      this.fps = null;
      this.callback();
      return;
    }

    const startPos = iterNumber - Math.floor(iterNumber);

    let pixelsPerMs = (totalLength / this.#duration) * (1 / (this.fps || 60));
    let currentPoint = totalLength * startPos;

    const animator = () => {
      // stop the animation if interrupted, or target iterations reached.
      if (this.#stopAll || iterNumber >= this.#privateIterations) {
        this.fps = null;
        if (!this.#stopAll && this.callback) this.callback();
        return;
      };

      // iteration completed
      if (currentPoint >= totalLength) {
        if (iterNumber <= this.#privateIterations) setTimeout(e =>
          requestAnimationFrame(() => this.animate(iterNumber)),
          this.delay
        );
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
          this.#timeline[this.#timelineSorted.pop() + '%']();
        }
      }

      // calculating next step
      let point = this.path.getPointAtLength(currentPoint);
      let nextPoint = this.path.getPointAtLength(currentPoint + 1);
      let angle = 0;

      if (!(nextPoint.x === this.path.getPointAtLength(totalLength).x && nextPoint.y === this.path.getPointAtLength(totalLength).y)) {
        angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;
      } else {
        let prevPoint = this.path.getPointAtLength(currentPoint - 1);
        angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;
      }

      this.#element.style.transform = `translate(${point.x * this.scale.x}px, ${point.y * this.scale.y}px)${this.#rotate ? ` rotate(${angle}deg)` : ''}`;
      currentPoint += pixelsPerMs;
      iterNumber += pixelsPerMs / totalLength;
      this.iterations = iterNumber;

      prevTime = Date.now();
      requestAnimationFrame(animator);
    }

    prevTime = Date.now();
    requestAnimationFrame(animator);
  }

  /**
   * Continues the animation.
   */
  play(){
    this.animate(this.#privateIterations);
  }

  /**
   * Pauses the animation.
   */
  pause(){
    this.#stopAll = true;
  }

  /**
   * Stops the animation
   */
  stop() {
    this.#stopAll = true;
    this.#privateIterations = 0;
  }

  #validateConfig(config) {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return false;

    const { duration, path, element, iterations } = config;

    if (
      typeof duration !== "number"
      || Number.isNaN(duration)
      || !path
      || !element
      || typeof iterations !== "number"
      || Number.isNaN(iterations)
    ) return false;

    return true;
  }
}

window.FollowPath = FollowPath;

export default FollowPath;