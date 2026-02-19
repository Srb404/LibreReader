import { LibreLinkClient } from 'libre-link-unofficial-api';
import dotenv from 'dotenv';
import chalk from 'chalk';
import readline from 'readline';

dotenv.config();

// --- Validate environment ---
const { LIBRE_LINK_EMAIL: email, LIBRE_LINK_PASSWORD: password } = process.env;
if (!email || !password) {
    console.error(chalk.red('Błąd: Brak LIBRE_LINK_EMAIL lub LIBRE_LINK_PASSWORD w pliku .env'));
    process.exit(1);
}

const client = new LibreLinkClient({ email, password, lluVersion: '4.16.0' });

// --- Constants ---
const TREND_ARROWS = {
    SingleUp:      '↑↑',
    FortyFiveUp:   '↗ ',
    Flat:          '→ ',
    FortyFiveDown: '↘ ',
    SingleDown:    '↓↓',
    NotComputable: '? ',
};

const GLUCOSE_RANGES = [
    { max: 54,       label: 'KRYTYCZNIE NISKI', color: chalk.bgRed.white.bold },
    { max: 69,       label: 'NISKI',            color: chalk.red.bold },
    { max: 180,      label: 'W NORMIE',         color: chalk.green.bold },
    { max: 250,      label: 'WYSOKI',           color: chalk.yellow.bold },
    { max: Infinity, label: 'KRYTYCZNIE WYSOKI',color: chalk.bgRed.white.bold },
];

// --- Helpers ---
function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function glucoseColor(mgDl) {
    if (mgDl < 55 || mgDl > 250) return chalk.red;
    if (mgDl < 70 || mgDl > 180) return chalk.yellow;
    return chalk.green;
}

function glucoseLabel(mgDl) {
    const range = GLUCOSE_RANGES.find(r => mgDl <= r.max);
    return range ? range.color(` ${range.label} `) : chalk.dim(' NIEZNANY ');
}

function formatMmol(mmol) {
    return typeof mmol === 'number' ? mmol.toFixed(1) : String(mmol);
}

function formatTime(date) {
    return new Date(date).toLocaleString('pl-PL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function timeSince(date) {
    const minutes = Math.round((Date.now() - new Date(date)) / 60_000);
    if (minutes < 1) return 'przed chwilą';
    if (minutes === 1) return '1 minutę temu';
    return `${minutes} min temu`;
}

function drawBox(lines) {
    const maxLen = Math.max(...lines.map(l => stripAnsi(l).length));
    const hr = '─'.repeat(maxLen + 2);
    const top = chalk.dim('╭' + hr + '╮');
    const bot = chalk.dim('╰' + hr + '╯');
    const padded = lines.map(l => {
        const pad = maxLen - stripAnsi(l).length;
        return chalk.dim('│') + ' ' + l + ' '.repeat(pad) + ' ' + chalk.dim('│');
    });
    return [top, ...padded, bot].join('\n');
}

// --- UI sections ---
function printTitle() {
    console.log(
        '\n  ' + chalk.bold.cyan('LibreLink Monitor') +
        chalk.dim('  •  CGM w terminalu')
    );
}

function showHelp(streaming) {
    const entries = [
        ['r', 'Odśwież'],
        ['h', 'Historia'],
        ['s', streaming ? chalk.cyan('Wył. streaming') : 'Streaming'],
        ['q', 'Wyjdź'],
    ];
    const bar = entries
        .map(([k, label]) => chalk.dim('[') + chalk.bold(k) + chalk.dim('] ') + label)
        .join(chalk.dim('  '));
    console.log('\n  ' + bar + '\n');
}

function showStreamingBadge() {
    console.log('  ' + chalk.cyan('●') + chalk.dim(' Streaming aktywny — odświeżanie co 1.5 min'));
}

function showError(msg) {
    console.log('\n  ' + chalk.red('✗') + chalk.bold.red(' Błąd: ') + msg);
}

// --- Render current reading ---
function renderReading(reading) {
    const color = glucoseColor(reading.mgDl);
    const arrow = TREND_ARROWS[reading.trendType] ?? '? ';
    const mmol = formatMmol(reading.mmol);

    const lines = [
        chalk.bold.dim('  Aktualny odczyt  '),
        '',
        color.bold(`  ${reading.mgDl} mg/dL  ${arrow}`),
        chalk.dim(`  ${mmol} mmol/L`),
        '',
        '  ' + glucoseLabel(reading.mgDl),
        '',
        chalk.dim(`  ${formatTime(reading.timestamp)}`),
        chalk.dim(`  ${timeSince(reading.timestamp)}`),
    ];

    printTitle();
    console.log('\n' + drawBox(lines));
}

// --- Render history table ---
function renderHistory(readings) {
    printTitle();

    if (!readings || readings.length === 0) {
        console.log(chalk.yellow('\n  Brak historii odczytów.'));
        return;
    }

    const last10 = readings.slice(-10).reverse();
    console.log('\n  ' + chalk.bold('Historia odczytów') + chalk.dim(` — ostatnie ${last10.length} wyniki\n`));

    const SEP = '  ' + chalk.dim('──────────────────────┼───────┼────────┼──────────────────');
    const HEADER = '  ' + chalk.bold('Czas                  │ mg/dL │ mmol/L │ Trend            ');

    console.log(SEP);
    console.log(HEADER);
    console.log(SEP);

    for (const r of last10) {
        const color = glucoseColor(r.mgDl);
        const arrow = TREND_ARROWS[r.trendType] ?? '?';
        const time  = formatTime(r.timestamp).padEnd(20);
        const mgDl  = String(r.mgDl).padStart(5);
        const mmol  = formatMmol(r.mmol).padStart(6);
        const label = stripAnsi(glucoseLabel(r.mgDl)).trim();
        console.log(
            `  ${chalk.dim(time)}│ ${color.bold(mgDl)} │${chalk.dim(mmol)} │ ${arrow} ${chalk.dim(label)}`
        );
    }

    console.log(SEP);
}

// --- App state ---
let streaming = false;
let streamingInterval = null;

// --- Actions ---
async function refresh() {
    console.clear();
    try {
        const reading = await client.read();
        renderReading(reading);
        if (streaming) showStreamingBadge();
    } catch (err) {
        printTitle();
        showError(err.message ?? String(err));
    }
    showHelp(streaming);
}

async function showHistory() {
    console.clear();
    try {
        const readings = await client.history();
        renderHistory(readings);
    } catch (err) {
        printTitle();
        showError(err.message ?? String(err));
    }
    showHelp(streaming);
}

function toggleStreaming() {
    streaming = !streaming;
    if (streaming) {
        streamingInterval = setInterval(() => { refresh(); }, 90_000);
    } else {
        clearInterval(streamingInterval);
        streamingInterval = null;
    }
    refresh();
}

function quit() {
    clearInterval(streamingInterval);
    process.stdin.setRawMode(false);
    console.clear();
    process.exit(0);
}

// --- Bootstrap ---
try {
    await client.login();
} catch (err) {
    console.error(chalk.red(`\nNie udało się zalogować: ${err.message ?? err}`));
    process.exit(1);
}

await refresh();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('keypress', (_str, key) => {
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) quit();
    else if (key.name === 'r') refresh();
    else if (key.name === 'h') showHistory();
    else if (key.name === 's') toggleStreaming();
});
