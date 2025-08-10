# TypeStorm — Interactive Typing Trainer with Real Analytics

TypeStorm is a free and open-source typing trainer that helps you improve typing speed and accuracy with immediate feedback and long-term statistics. Built with React, Vite, Tailwind CSS and Recharts, the app runs entirely in your browser. Every time you click **Reset**, a new random set of words is generated so you never practice the same sequence twice.

## Features

- **Randomized word sets**: Each session loads a fresh set of common English words to keep practice challenging and varied.
- **Multiple modes**: Choose between timed tests (e.g. 15, 30, 60 seconds), fixed word counts (10, 25 or 50 words) or an infinite mode for open‑ended practice.
- **Live metrics**: Words per minute (WPM), Characters per minute (CPM), accuracy percentage and elapsed time update in real time.
- **Session chart**: A line chart displays your WPM second‑by‑second during the session.
- **Aggregated statistics**: The app stores your hourly, daily and overall average WPM and accuracy in localStorage so you can track improvement over time.
- **Sound effects**: Optional sound themes (beeps or typewriter) provide audio feedback for each keystroke; you can toggle sounds off.
- **Responsive design**: Tailwind CSS ensures the layout looks great on both desktop and mobile screens.
- **Data export/import**: You can export your accumulated statistics as a JSON file and import them later or on another device.

## Live Demo

You can try the current version on GitHub Pages:

<https://kp2kpx.github.io/typing-trainer/>

## Getting Started

To run TypeStorm locally:

```bash
# clone the repository
git clone https://github.com/kp2kpx/typing-trainer.git
cd typing-trainer

# install dependencies
npm install

# start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default. Any changes you make to the source code will hot‑reload in the browser.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The compiled site will be output to the `dist` folder. You can serve this folder with any static hosting provider. This repository is configured to deploy automatically to GitHub Pages via the included GitHub Actions workflow.

## Technologies Used

- **React**: component‑based UI library.
- **Vite**: dev server and build tool.
- **Tailwind CSS**: utility‑first CSS framework.
- **Recharts**: charts and graphs for statistics.
- **LocalStorage**: stores aggregated statistics.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request to add features, fix bugs or improve documentation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
