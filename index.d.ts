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


  /**
   * Creates an instance.
   * 
   * **Note: Animating multiple elements will be deprecated in future versions. Use multiple instances for multiple elements.**
   * 
   * @param { {
   *  element: HTMLElement[] | HTMLElement,
   *  duration: number[] | number,
   *  path: SVGPathElement | SVGPolylineElement,
   *  iterations: number,
   *  rotate?: boolean,
   *  callback?: function,
   *  timeline?: FollowPathTimeline
   * } } config Configuration object
   * - `element`: Element | Array of elements to animate.
   * - `duration`: Duration of animation(in ms) for each element in order
   * - `path`: Path to follow
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
      rotate?: boolean;
      callback?: () => void;
      timeline?: FollowPathTimeline;
    }
  );

  /**
   * Animates the elements on the svg path in the given durations and calls the callback function after completion.
   * 
   * You can specify an optional `iterNumber` (iteration number), to skip some iterations, or pass it as a floating point number to start from between the path.
   * @param { number } iterNumber Current Iteration Number
   */
  animate(iterNumber?: number): void;

  /**
   * Stops the animation.
   */
  stop(): void;
}

export default FollowPath;
