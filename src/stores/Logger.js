class Logger {
  constructor() {
  }
  level() {
    return window.LOG_LEVEL ? window.LOG_LEVEL : 2
  }
  info(...args) {
    if (window.LOG_LEVEL || window.LOG_LEVEL <= 2) console.log(...args)
  }

  debug(...args) {
    if (window.LOG_LEVEL && window.LOG_LEVEL <= 1) console.log(...args)
  }
  warn(...args) {
    if (!window.LOG_LEVEL || window.LOG_LEVEL <= 3) console.log(...args)
  }
  error(...args) {
    if (!window.LOG_LEVEL || window.LOG_LEVEL <= 4) console.log(...args)
  }
}

export default Logger
