class FollowPath{

  /**
 * @param { HTMLElement[] } elements - Array of elements to animate
 * @param {SVGPathElement} path - Path to follow
 * @param {Number} durations - Durations of animation(in ms) for each element in order
 * @param {Number} iterations - Number of times animation should be repeated
 * @param {Function} callback - Callback function to be called after animation
 */

  constructor(elements, path, durations, iterations=1, timeline, callback){
    this.elements = elements;
    this.path = path;
    this.durations = durations;
    this.iterations = iterations;
    this.callback = callback;
  }
  
  // function to animate the elements on the svg path in the given durations and calling a callback function after animation.
  animate(iterNumber=1){
    const totalLength = this.path.getTotalLength();
    if(this.iterations <= 0 || iterNumber > this.iterations){
      this.callback();
      return;
    }
    const intervals = new Set();
    this.elements.forEach((element, index) => {
      let pixelsPerMs = totalLength/this.durations[index]*10;
      let currentPoint = 0;
      const interval = setInterval(() => {
        if(currentPoint >= totalLength){
          clearInterval(interval);
          if(Math.max(...this.durations) === this.durations[index] && iterNumber <= this.iterations){
            this.animate(iterNumber)
          }
        }

        let point = this.path.getPointAtLength(currentPoint);
        let nextPoint = this.path.getPointAtLength(currentPoint+1);
        let angle = 0;

        // getting the angle of rotation
        if(!(nextPoint.x === this.path.getPointAtLength(totalLength).x && nextPoint.y === this.path.getPointAtLength(totalLength).y)){
          angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x)*180/Math.PI;
        }else{
          let prevPoint = this.path.getPointAtLength(currentPoint-1);
          angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x)*180/Math.PI;
        }

        element.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${angle}deg)`;
        currentPoint+=pixelsPerMs;
      }, 10);
      intervals.add(interval);;
    });
  
    iterNumber++;
  }
}