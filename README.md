![Node.js](https://img.shields.io/badge/node.js-%23339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)

## Terminal glucose monitor for FreeStyle Libre

LibreReader reads current values from a FreeStyle Libre sensor through the unofficial LibreLinkUp API and shows them directly in the terminal. Checking a reading takes a single keypress instead of opening a phone app. Written in JavaScript for Node.js on Linux.

The interface provides a live reading with a trend arrow and color coded status, a history of the last 10 readings, and a streaming mode that refreshes every 1.5 minutes. A short mode prints a single line and exits, which is convenient for status bar scripts.

### Setup

Credentials are read from a `.env` file:

```
LIBRE_LINK_EMAIL=you@email.com
LIBRE_LINK_PASSWORD=password
```

Install dependencies and run the program:

```bash
npm install
node main.js
```

### Keys

| Key | Action                                     |
|-----|--------------------------------------------|
| r   | refresh reading                            |
| h   | history of the last 10 readings            |
| s   | toggle streaming, auto refresh every 1.5 min |
| q   | quit                                       |

### Short mode

```bash
node main.js --short
```

Prints a single line of plain text and exits, intended for status bar scripts such as a waybar module.
