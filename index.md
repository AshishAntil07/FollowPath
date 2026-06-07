# FollowPath

A **VanillaJS** library to animate HTML elements along an SVG path with custom durations, iterations, easing, and lifecycle callbacks.

## Features

- Animate elements along any SVG `<path>` or `<polyline>`
- Custom duration and rational iteration count (including `Infinity`)
- Configurable delay between iterations
- Path scale compensation (`toScale`)
- Rotation along the path tangent (`rotate`)
- Easing functions for custom pacing
- Timeline callbacks at arbitrary percentage points
- Animation modes: `clamp`, `loop`, `pingpong`, or custom
- Play / Pause / Stop controls
- Real-time FPS and iteration tracking
- Frame-accurate rendering with `renderFrame`
- Progress getters and setters

Check out the [live demo](/demo).

## Installation

```bash
npm i follow-path
```

Or clone from [GitHub](https://github.com/AshishAntil07/FollowPath.git).

---

- [Getting Started](/getting-started)
- [Usage](/usage)
- [Constructor Config](/constructor-config)
- [Methods](/methods)
- [Properties](/properties)
- [Modes](/modes)
- [Basic Animation](/basic-animation)
- [Timeline and Easing](/timeline-and-easing)
