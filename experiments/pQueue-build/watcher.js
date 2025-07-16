// watcher.js
const chokidar = require('chokidar');
const PQueue   = require('p-queue').default;
const debounce = require('lodash.debounce');
const { spawn } = require('child_process');

const SRC_DIR           = 'src';
const BUILD_SCRIPT_PATH = 'build.js';
const DEBOUNCE_MS       = 500;

// 1. Queue that runs one build at a time
const queue = new PQueue({ concurrency: 1 });

// 2. Build wrapper
function runBuild() {
    return new Promise(resolve => {
        console.log(`[${new Date().toISOString()}] ▶️  Build started`);
        const proc = spawn('node', [BUILD_SCRIPT_PATH], { stdio: 'inherit' });
        proc.on('close', code => {
            console.log(`[${new Date().toISOString()}] ✅ Build finished (code ${code})`);
            resolve();
        });
    });
}

// 3. Debounced scheduler (trailing only)
const scheduleBuild = debounce(() => {
    queue.clear();           // drop any pending builds
    queue.add(() => runBuild());
}, DEBOUNCE_MS);

// 4. Watch for all events under src/
chokidar
    .watch(SRC_DIR, { ignoreInitial: true })
    .on('all', (event, file) => {
        console.log(`[${new Date().toISOString()}] ✏️  ${event} → ${file}`);
        scheduleBuild();
    });
