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
declare class FollowPath {
    #private;
    path: SVGPathElement | SVGPolylineElement;
    iterations: number;
    callback: (() => void) | undefined;
    delay: number | undefined;
    easing: (t: number) => number;
    scale: {
        x: number;
        y: number;
    };
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
    constructor(config: FollowPathConfig);
    /**
     * Animates the elements on the svg path in the given durations and calls the callback function after completion.
     *
     * You can specify an optional `iterNumber` (iteration number), to skip some iterations, or pass it as a floating point number to start from between the path.
     * @param { { iterNumber?: number, singleFrame?: boolean } } options
     *  - `iterNumber` - Iteration number, 0 by default.
     *  - `singleFrame` - Whether to render a single frame, or the whole animation.
     */
    animate(options: {
        iterNumber?: number;
        singleFrame?: boolean;
    }): void;
    /**
     * Renders a specific frame, if not specified, renders a next frame.
     * @param {number} frameNumber The frame to render. (60 fps)
     */
    renderFrame(frameNumber?: number): void;
    /**
     * Continues the animation.
     */
    play(): void;
    /**
     * Pauses the animation.
     */
    pause(): void;
    /**
     * Stops the animation
     */
    stop(): void;
    /**
     * Returns the current progress of the animation.
     * @returns The progress of animation in percentage.
     */
    getProgress(): number;
    /**
     * Sets the progress of the animation.
     * @param {number} percentage Current Progress in percentage.
     */
    setProgress(percentage: number): void;
    /**
     * Returns the progress of current iteration. (whole iteration = 100%)
     * For example, progress of current iteration at 1.5 iterations would be 50%.
     * @returns The progress of current iteration in percentage.
     */
    getCurrentIterationProgress(): number;
    /**
     * Sets the progress of current iteration.
     * @param {number} percentage Current Progress in percentage.
     */
    setCurrentIterationProgress(percentage: number): void;
}
export default FollowPath;
