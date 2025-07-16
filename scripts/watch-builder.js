// watch-builder.js
const chokidar = require('chokidar')
const PQueue = require('p-queue').default
const debounce = require('lodash.debounce')

/**
 * Safely wraps buildFn to catch both sync exceptions and promise rejections.
 */
function makeSafeTask(buildFn) {
    return () =>
        Promise.resolve()
            .then(buildFn)
            .catch(err => {
                console.error(
                    `[${new Date().toISOString()}] Build error:`,
                    err
                )
            })
}

/**
 * Creates a file-watcher + single-concurrency build queue.
 *
 * @param {Object}   opts
 * @param {string}   opts.watch       – Glob or path to watch
 * @param {number}   opts.debounceMs  – Delay (ms) after last change
 * @param {Function} opts.buildFn     – () => Promise for running your build
 * @param {Function} [opts.onIdle]    – Called after every successful build cycle
 *
 * @returns {{ queue: PQueue, scheduleBuild: Function }}
 */
function createBuilder({watch, debounceMs, buildFn, onIdle}) {
    const queue = new PQueue({concurrency: 1})

    // 1) Central catch for any uncaught queue errors
    queue.on('error', err => {
        console.error(
            `[${new Date().toISOString()}] Build pipeline error:`,
            err
        )
    })

    // 2) Debounced scheduler for subsequent builds
    const scheduleBuild = debounce(() => {
        queue.clear()
        void queue.add(makeSafeTask(buildFn))
    }, debounceMs)

    // 3) Watch source files
    chokidar
        .watch(watch, {ignoreInitial: true})
        .on('all', (ev, file) => {
            console.log(`[${new Date().toISOString()}] ${ev} → ${file}`)
            scheduleBuild()
        })
        .on('error', err => {
            console.error(
                `[${new Date().toISOString()}] Watcher error:`,
                err
            )
        })

    // 4) Persistent idle listener with its own try/catch
    if (typeof onIdle === 'function') {
        queue.on('idle', () => {
            try {
                onIdle()
            } catch (err) {
                console.error(
                    `[${new Date().toISOString()}] onIdle error:`,
                    err
                )
            }
        })
    }

    // 5) Enqueue initial build (safe, non-fatal)
    void queue.add(makeSafeTask(buildFn))

    return {queue, scheduleBuild}
}

module.exports = {createBuilder}
