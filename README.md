# LibreLink Monitor

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

A terminal-based continuous glucose monitor (CGM) for **FreeStyle Libre / LibreLinkUp** users.
Instead of reaching for your phone or opening a browser, LibreLink Monitor brings your glucose readings directly into the terminal — with color-coded status, trend arrows, and an auto-refresh streaming mode.

---

## How it works

LibreLink Monitor connects to the **LibreLinkUp API** using your account credentials and fetches real-time sensor data from your FreeStyle Libre CGM device. All data is displayed in a clean terminal UI with unicode box-drawing characters and ANSI colors rendered by [chalk](https://www.npmjs.com/package/chalk).

Each reading includes:
- Current glucose value in **mg/dL** and **mmol/L**
- A **trend arrow** showing the direction and rate of change
- A **status label** color-coded by glucose range
- The **timestamp** of the reading and how long ago it was taken

---

## Features

- **Live reading** — fetch the latest CGM value on demand with a single keypress
- **History table** — view the last 10 readings with timestamps, values and trends at a glance
- **Streaming mode** — automatically refresh every 1.5 minutes without any interaction
- **Glucose range coloring** — instantly see whether a reading is critical, low, normal or high
- **Keyboard-driven** — no mouse required, everything controlled from the terminal

---

## Requirements

- **Node.js 18** or newer
- A **LibreLinkUp** account linked to an active FreeStyle Libre sensor

---

## Installation

```bash
git clone https://github.com/your-username/libre-monitor.git
cd libre-monitor
npm install
```

---

## Configuration

Create a `.env` file in the project root:

```env
LIBRE_LINK_EMAIL=your@email.com
LIBRE_LINK_PASSWORD=yourpassword
```

The app will validate both variables at startup and exit with a clear error message if either is missing.

---

## Usage

```bash
node main.js
```

On startup the app logs in to LibreLinkUp, fetches the current reading and displays it in a bordered panel. From there, all interaction is handled via keyboard shortcuts.

---

## Keyboard shortcuts

| Key          | Action                                      |
|--------------|---------------------------------------------|
| `r`          | Refresh the current reading                 |
| `h`          | Show the last 10 readings in a table        |
| `s`          | Toggle streaming mode (auto-refresh 1.5 min)|
| `q` / `Ctrl+C` | Quit the application                      |

---

## Glucose ranges

The app uses the following thresholds to color-code readings:

| Status              | Range (mg/dL) | Color         |
|---------------------|---------------|---------------|
| Critically low      | < 55          | 🔴 Red (bold) |
| Low                 | 55 – 69       | 🟠 Red        |
| Normal              | 70 – 180      | 🟢 Green      |
| High                | 181 – 250     | 🟡 Yellow     |
| Critically high     | > 250         | 🔴 Red (bold) |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| [`libre-link-unofficial-api`](https://www.npmjs.com/package/libre-link-unofficial-api) | Unofficial LibreLinkUp API client |
| [`chalk`](https://www.npmjs.com/package/chalk) | Terminal color and styling |
| [`dotenv`](https://www.npmjs.com/package/dotenv) | Loading credentials from `.env` |
