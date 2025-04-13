# FollowPath

A JavaScript package to animate HTML elements along an SVG path with custom durations, iterations, and a callback function after the animation.

## Features

- Animates an element along a given SVG path.
- Specify custom durations for the animation.
- Rational number of iterations for the animation.
- Custom Delay between each iteration.
- Scale path to adjust animation.
- Callback function support after the animation completes.
- Timeline support during animation.
- Keeps track of animation fps(frames per second), and iterations completed during animation.
- Play/Pause and Stop the animation when required.

## Installation

You can install this package in two ways:

- Install using npm(or your preferred package manager):

```bash
npm i follow-path
```

- Clone the repository to your local machine:

```bash
git clone https://github.com/AshishAntil07/FollowPath.git
```

## Usage

Here's a basic example to animate an element along a polyline path:

```xml
  <svg xmlns="http://www.w3.org/2000/svg" height="700" width="1000">
    <polyline 
      points="198,264 200,259 202,256 ... 893,250"
      style="fill: transparent; stroke: black; stroke-width: 5px;" />
  </svg>
  <div class="element"></div>
```

```js
const fp = new FollowPath({                         // creates an instance.
  element: document.querySelector('.element'),      // element to animate.
  duration: 3000,                                   // duration per iteration (in ms).
  path: document.querySelector('polyline'),         // path to follow (can be a polyline or path element).
  iterations: 2.5,                                  // number of times the element will animate over the path.
  rotate: true,                                     // whether to rotate the element along the path. (optional, false by default)

  easing(t) {                                       // easing function to control animation pacing. (optional)
    // easeInOutCubic example
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  callback() {                                      // callback function, called after all iterations are completed. (optional)
    console.log('done');
  },

  timeline: {                                       // timeline callback object. (optional)
    '0%'() { console.log('started') },
    '25%'() { console.log('25% completed') },
    '50%'() { console.log('half completed') },
    '75%'() { console.log('75% completed') }
  } // timeline keys must be in percentages!
});

fp.animate();                                       // starts the animation

setTimeout(() => {
  fp.pause();                                       // pauses the animation after 1s
  setTimeout(() => fp.play(), 1000);                // resumes animation after another second
}, 1000);

setTimeout(() => {
  console.log(`fps: ${fp.fps}\niterations: ${fp.iterations}`);
  fp.stop();                                        // stops the animation after 6 seconds.
  // Note: Stopping the animation by interruption doesn't call the callback.
}, 6000);
```

### Full docs will be out soon
