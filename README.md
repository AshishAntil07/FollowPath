# FollowPath

A JavaScript package to animate HTML elements along an SVG path with custom durations, iterations, and a callback function after the animation.

## Features

- Animate multiple elements along a given SVG path.
- Specify custom durations for each element.
- Set the number of iterations for the animation.
- Callback function support after the animation completes.

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
const fp = new FollowPath(                        // creates an instance.
  {
    element: document.querySelector('.element'),  // element to animate.
    duration: 10000,                              // duration of the animation.
    path: document.querySelector('polyline'),     // path to follow.
    iterations: 2.5,                              // iterations, number of times the element will animate over the path.
    rotate: true,                                 // whether to rotate the element along the path. (optional, false by default)
    callback(){                                   // callback function, called after all iterations are completed. (optional)
      console.log('done')
    },
    timeline: {                                   // timeline callback object. (optional)
      '0%'() { console.log('started') },
      '25%'() { console.log('25% completed') },
      '50%'() { console.log('half completed') },
      '75%'() { console.log('75% completed') }
    }
  }
);

fp.animate();  // starts the animation
setTimeout(() => {
  fp.stop();   // stops the animation after 6 seconds.
}, 6000)
```
