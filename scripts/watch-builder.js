const chokidar = require('chokidar')
const PQueue   = require('p-queue').default
const debounce = require('lodash.debounce')

module.exports = function watch({ paths, exec, afterExec, delay = 500 }) {
    const changeQueue = new PQueue({ concurrency: 1 })

    async function runExecSafely() {
        try {
            await Promise.resolve().then(exec)
        } catch (err) {
            console.error(`[${new Date().toISOString()}] Exec error:`, err)
        }
        try {
            afterExec()
        } catch (hookErr) {
            console.error(`[${new Date().toISOString()}] afterExec error:`, hookErr)
        }
    }

    const scheduleExec = debounce(() => {
        changeQueue.clear()
        changeQueue.add(runExecSafely)
    }, delay)

    const fsWatcher = chokidar
        .watch(paths, { ignoreInitial: true })
        .on('all', (event, file) => {
            console.log(`[${new Date().toISOString()}] ${event} → ${file}`)
            scheduleExec()
        })
        .on('error', err => {
            console.error(`[${new Date().toISOString()}] Watcher error:`, err)
        })

    scheduleExec()

    return () => {
        fsWatcher.close()
        changeQueue.clear()
    }
}
