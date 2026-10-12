# CivicSathi AI

This folder keeps the **original `index.html` unchanged** and includes companion CSS, JavaScript, and JSON files for project presentation.

## Files
- `index.html` — original HTML file, preserved byte-for-byte.
- `style.css` — reference copy of the CSS already embedded in `index.html`.
- `script.js` — reference copy of the JavaScript already embedded in `index.html`.
- `package.json` — project metadata and an optional local static-server command.
- `project-info.json` — machine-readable description of the files and their relationship.
- `docs/` — project report, architecture, test cases, and presentation guide.

## Important
The original `index.html` still contains its own inline CSS and JavaScript. To honor the requirement not to change the existing HTML, it does **not** link to `style.css` or `script.js`. Those files are companion/reference copies included for display and submission purposes; editing them alone will not change the original page.

## Run the original project
Open `index.html` in a browser.

Optional: if Node.js is installed, run `npm start` from this folder to serve the folder locally. This is not required for the original HTML to open.

## Scope note
The current HTML uses browser-side rule-based logic and local browser storage. It does not, by itself, connect to a trained AI model or automatically submit complaints to a government system.
