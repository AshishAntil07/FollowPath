interface FollowPathTimeline {
  [key: `${number}%`]: () => void;
}

declare class FollowPath {

  /**
   * Frames per second of the animation. `null` if animation has ended or not started.
   */
  fps: number | null;
  path: SVGPathElement | SVGPolylineElement;
  callback: () => void;
  iterations: number;
  delay: number;
  scale: {
    x: number;
    y: number;
  };

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
   *  timeline?: FollowPathTimeline
   * } } config Configuration object
   * - `element`: Element to animate.
   * - `duration`: Duration of animation(in ms)
   * - `path`: Path to follow
   * - `delay`: Delay between each iteration(in ms)
   * - `toScale`: Whether to match the animation to the current scale of the path. False by default.
   * - `rotate`: Whether to rotate the elements along the path or not
   * - `iterations`: Number of times animation should be repeated, can be set to `Infinity` for infinite loops, but that would cause the callback to never be called. You can also set it to a floating point number to do partial iterations.
   * - `callback`: Callback function to be called after animation
   * - `timeline`: Object containing functions to be called at specific points of the animation. The keys should be in the format of `percentage%` where percentage is the percentage of the path covered.
   */
  constructor(
    config: {
      element: HTMLElement;
      duration: number;
      path: SVGPathElement | SVGPolylineElement;
      iterations: number;
      toScale?: boolean;
      rotate?: boolean;
      callback?: () => void;
      timeline?: FollowPathTimeline;
    }
  );

  /**
   * Animates the element on the svg path in the given duration and calls the callback function after completion.
   * 
   * You can specify an optional `iterNumber` (iteration number), to skip some iterations, or pass it as a floating point number to start from between the path.
   * @param { number } iterNumber Current Iteration Number
   */
  animate(iterNumber?: number): void;

  /**
   * Continues the animation.
   */
  play(): void;

  /**
   * Pauses the animation.
   */
  pause(): void;

  /**
   * Stops the animation.
   */
  stop(): void;
}

export default FollowPath;
