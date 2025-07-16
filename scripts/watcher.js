const chokidar = require('chokidar')
const PQueue = require('p-queue').default
const debounce = require('lodash.debounce')

module.exports = function watch({ paths, exec, afterExec, delay = 500 }) {
  const changeQueue = new PQueue({ concurrency: 1 })

  async function runExecSafely() {
    try {
      await exec()
    } catch (err) {
      logError('exec error', err)
    }
    try {
      await afterExec()
    } catch (err) {
      logError('afterExec error', err)
    }
  }

  const scheduleExec = debounce(() => {
    changeQueue.clear()
    void changeQueue.add(runExecSafely)
  }, delay)

  const fsWatcher = chokidar
    .watch(paths, { ignoreInitial: true })
    .on('all', (event, file) => {
      logInfo(`${event} → ${file}`)
      scheduleExec()
    })
    .on('error', err => {
      logError('watcher error', err)
    })

  scheduleExec()

  return () => {
    fsWatcher.close()
    changeQueue.clear()
  }
}

function timestamp() {
  return new Date().toISOString()
}

function logInfo(msg) {
  console.log(`[${timestamp()}] ${msg}`)
}

function logError(label, err) {
  console.error(`[${timestamp()}] ${label}:`, err)
}
