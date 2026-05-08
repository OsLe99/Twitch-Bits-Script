# Twitch Bits Script

A lightweight browser overlay for OBS that turns Twitch Bits into animated falling bit pieces.

This project is built with plain HTML, CSS, and JavaScript. There is no build step, no framework, and no external dependency chain. Open it locally, host it on a static site, or use it directly as an OBS Browser Source.

## Features

- Animated falling Bits with randomized physics
- Multiple bit denominations based on available image assets
- Sparkle, glow, and pile-up effects
- Milestone bursts for large bit amounts
- Screen shake for impactful drops
- Optional sound support
- Debug panel for local testing
- External trigger support through JavaScript and `postMessage`
- Static project that can be hosted anywhere

## Demo Use Case

This overlay is designed for stream setups where another tool such as Streamer.bot, a custom browser event, or manual testing triggers a Bits animation on screen.

## Project Structure

```text
.
├── index.html
├── styles.css
├── assets/
│   ├── Bits/
│   └── sounds/
└── js/
    ├── assets.js
    ├── config.js
    ├── debug.js
    ├── effects.js
    ├── main.js
    ├── milestones.js
    ├── physics.js
    ├── queue.js
    ├── sounds.js
    ├── spawn.js
    └── triggers.js
```

## How It Works

The overlay loads in the browser and exposes trigger hooks. When a bit amount is received, the script:

1. Breaks the amount into supported bit denominations
2. Queues the visual pieces
3. Spawns animated bit elements into the overlay layer
4. Applies physics, bounce, sparkle, and milestone effects
5. Removes the elements after they settle

## Bit Assets

The overlay uses GIFs in the `assets/Bits/` folder to decide which denominations are available.

Current supported files:

- `assets/Bits/1.gif`
- `assets/Bits/10.gif`
- `assets/Bits/1k.gif`
- `assets/Bits/5k.gif`
- `assets/Bits/10000.gif`
- `assets/Bits/100000.gif`

If an asset is missing, the overlay falls back to a styled visual block so the animation still works.

## Optional Sound Assets

If these files exist, the overlay will try to load them:

- `assets/sounds/spawn.ogg`
- `assets/sounds/land.ogg`

If they do not exist, the overlay still runs normally.

## Local Testing

Open `index.html` in a browser.

The built-in debug panel lets you:

- Spawn preset bit drops
- Enter a custom bit amount
- Switch physics presets

You can also trigger it from the browser console:

```js
window.spawnBitsDrop(24);
```


### JavaScript trigger

```js
window.spawnBitsDrop(250);
```

## OBS Setup

1. Add a new Browser Source in OBS
2. Point it to your hosted overlay URL or local `index.html`
3. Set the width and height to match your scene, such as `1920x1080`
4. Enable transparency
5. For stream use, hide the debug UI with the `debug=0` query parameter

Example:

```text
file:///C:/path/to/project/index.html?debug=0
```

Or if hosted:

```text
https://your-domain.example/overlay/?debug=0
```

## URL Parameters

The overlay supports a few query parameters for setup and tuning.

### Hide debug panel

```text
?debug=0
```

### Physics preset

Available values:

- `default`
- `light`
- `heavy`
- `chaotic`

Example:

```text
?physics=chaotic
```

### Queue cap

Controls how many pieces spawn at once before queueing the rest.

Example:

```text
?cap=15
```

You can combine parameters:

```text
?debug=0&physics=default&cap=15
```

## Hosting

Because this project is fully static, you can host it with:

- GitHub Pages
- Netlify
- Vercel static hosting
- Any simple web server
- A local file path in OBS

## Sharing With Friends

To share this project with someone else, send the entire folder, not just `index.html`.

They need:

- `index.html`
- `styles.css`
- the full `js/` folder
- the full `assets/` folder

A zip of the whole project is the simplest option.

## Customization

You can customize:

- Bit image files in `assets/Bits/`
- Physics presets in `js/config.js`
- Visual effects in `styles.css`
- Trigger integration in `js/triggers.js`
- Milestones in `js/milestones.js`

## Troubleshooting

### The overlay loads but no bits appear

Check that JavaScript is enabled and that the full folder structure is intact.

### The animation works but images do not show

Make sure the `assets/Bits/` folder exists and filenames match the expected names.

### Sounds do not play

This is expected if the optional sound files are missing or the browser blocks autoplay audio.

### The debug panel is visible in OBS

Add `?debug=0` to the overlay URL.


## Credits

Built as a custom Twitch Bits browser overlay for OBS and stream automation workflows.
