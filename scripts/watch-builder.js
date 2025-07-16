// watch-builder.js
const chokidar = require('chokidar')
const PQueue   = require('p-queue').default
const debounce = require('lodash.debounce')

/**
 * Creates a file‐watcher + single‐concurrency build queue.
 *
 * @param {Object}   opts
 * @param {string}   opts.watch       – Glob or path to watch
 * @param {number}   opts.debounceMs  – Delay (ms) after last change
 * @param {Function} opts.buildFn     – () => Promise for running your build
 * @param {Function} [opts.onIdle]    – Called every time the queue empties
 *
 * @returns {{ queue: PQueue, scheduleBuild: Function }}
 */
function createBuilder({ watch, debounceMs, buildFn, onIdle }) {
    // single‐concurrency queue (no parallel builds)
    const queue = new PQueue({ concurrency: 1 })

    // trailing‐only debounce: clear pending, then enqueue a build
    const scheduleBuild = debounce(() => {
        queue.clear()
        queue.add(() =>
            buildFn().catch(err => console.error('Rebuild failed:', err))
        )
    }, debounceMs)

    // watch your source directory (no initial “add” events)
    chokidar
        .watch(watch, { ignoreInitial: true })
        .on('all', (evt, file) => {
            console.log(`[${new Date().toISOString()}] ${evt} → ${file}`)
            scheduleBuild()
        })

    // persistent idle listener fires on *every* build completion
    if (typeof onIdle === 'function') {
        queue.on('idle', onIdle)
    }

    // enqueue the initial build
    queue.add(() =>
        buildFn().catch(err => console.error('Initial build failed:', err))
    )

    return { queue, scheduleBuild }
}

module.exports = { createBuilder }
