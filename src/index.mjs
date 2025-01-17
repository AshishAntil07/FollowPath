class FollowPath {

  #element;
  #duration;
  #stopAll;
  #rotate;
  #iterations;

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
   * **Note: Animating multiple elements will be deprecated in future versions. Use multiple instances for multiple elements.**
   * 
   * @param { {
   *  element: HTMLElement[] | HTMLElement,
   *  duration: number[] | number,
   *  path: SVGPathElement | SVGPolylineElement,
   *  rotate: boolean,
   *  iterations: number,
   *  callback: function,
   *  timeline: {
   *    [key: string]: () => void
   *  }
   * } } config Configuration object
   * - `element`: Element | Array of elements to animate.
   * - `duration`: Duration of animation(in ms) for each element in order
   * - `path`: Path to follow
   * - `rotate`: Whether to rotate the elements along the path or not
   * - `iterations`: Number of times animation should be repeated, can be set to `Infinity` for infinite loops, but that would cause the callback to never be called. You can also set it to a floating point number to do partial iterations.
   * - `callback`: Callback function to be called after animation
   * - `timeline`: Object containing functions to be called at specific points in the animation. The keys should be in the format of `percentage%` where percentage is the percentage of the path covered.
   */

  constructor(config) {
    const { element, duration, path, iterations, callback, rotate, timeline } = config;

    this.#element = element;
    this.#duration = duration;
    this.path = path;
    this.#iterations = iterations;
    this.callback = callback;
    this.#rotate = rotate || false;
    this.#timeline = timeline;
    this.#timelineSorted = timeline?Object.keys(timeline).map(e => Number(e.slice(0, e.length-1))).sort((a, b) => b - a):null;
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
    if ((this.#iterations <= 0 || iterNumber > this.#iterations) && this.callback) {
      this.fps = null;
      this.callback();
      return;
    }

    const startPos = iterNumber - Math.floor(iterNumber);

    let pixelsPerMs = (totalLength / this.#duration) * (1 / (this.fps || 60));
    let currentPoint = totalLength * startPos;

    const animator = () => {
      // stop the animation if interrupted, or target iterations reached.
      if (this.#stopAll || iterNumber >= this.#iterations) {
        this.fps = null;
        if (this.#stopAll) console.log('Animation Stopped by Interruption');
        else if (this.callback) this.callback();
        return;
      };

      // iteration completed
      if (currentPoint >= totalLength) {
        if (iterNumber <= this.#iterations) requestAnimationFrame(() => this.animate(iterNumber))
          return;
      }
      
      // calculate speed and fps.
      if (prevTime) {
        const timePerFrame = Date.now() - prevTime;
        this.fps = 1000 / timePerFrame;
        pixelsPerMs = (totalLength / this.#duration) * (timePerFrame);
      }

      // call timeline callback if present
      if(this.#timeline && this.#timelineSorted){
        while((iterNumber/this.#iterations)*100 >= this.#timelineSorted[this.#timelineSorted.length-1]) {
          this.#timeline[this.#timelineSorted.pop()+'%']();
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
      
      this.#element.style.transform = `translate(${point.x}px, ${point.y}px)${this.#rotate ? ` rotate(${angle}deg)` : ''}`;
      currentPoint += pixelsPerMs;
      iterNumber += pixelsPerMs / totalLength;
      
      prevTime = Date.now();
      requestAnimationFrame(animator);
    }

    prevTime = Date.now();
    requestAnimationFrame(animator);
  }

  /**
   * Stops the animation
   */
  stop() {
    this.#stopAll = true;
  }
}

export default FollowPath;