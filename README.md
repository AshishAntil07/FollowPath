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
new FollowPath(
  [document.querySelector('.element')],      // elements to animate through the path
  [10000],                                   // duration(in ms) of one iteration, corresponding to the elements
  document.querySelector('polyline'),        // reference to the svg path/polyline element
  2,                                         // number of iterations
  () => { console.log('done') }               // callback
).animate();                                 // start the animation
```
