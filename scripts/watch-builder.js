// watch-builder.js
const chokidar = require('chokidar');
const PQueue   = require('p-queue').default;
const debounce = require('lodash.debounce');

/**
 * @param {Object}   opts
 * @param {string}   opts.watch       – Path or glob to watch
 * @param {number}   opts.debounceMs  – Delay (ms) after last change
 * @param {Function} opts.buildFn     – () => Promise for your build
 * @param {Function} [opts.onIdle]    – Called on every queue empty
 */
function createBuilder({ watch, debounceMs, buildFn, onIdle }) {
    // 1) Create a single‐concurrency queue
    const queue = new PQueue({ concurrency: 1 });

    // 2) Debounced scheduler for subsequent builds
    const scheduleBuild = debounce(() => {
        queue.clear();           // drop any pending rebuilds
        queue.add(() => buildFn().catch(err => {
            console.error('Build failed:', err);
        }));
    }, debounceMs);

    // 3) Watch for changes → schedule builds
    chokidar
        .watch(watch, { ignoreInitial: true })
        .on('all', (_, file) => {
            console.log(`File changed → ${file}`);
            scheduleBuild();
        });

    // 4) Persistent idle listener fires after *every* build cycle
    if (typeof onIdle === 'function') {
        queue.on('idle', onIdle);
    }

    // 5) Enqueue the initial build *after* watcher + idle are wired
    queue.add(() => buildFn().catch(err => {
        console.error('Initial build failed:', err);
    }));

    return { queue, scheduleBuild };
}

module.exports = { createBuilder };
