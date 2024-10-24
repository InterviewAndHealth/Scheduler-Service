class Logger {
  static levels = {
    INFO: 0,
    DEBUG: 1,
    WARNING: 2,
    ERROR: 3,
  };

  static initialize(level) {
    this.level = level;
  }

  static log(level, ...messages) {
    if (this.level <= Logger.levels[level]) {
      const timestamp = new Date().toLocaleString();

      const colors = {
        INFO: "\x1b[32m", // Green
        DEBUG: "\x1b[34m", // Blue
        WARNING: "\x1b[33m", // Yellow
        ERROR: "\x1b[31m", // Red
      };

      const resetColor = "\x1b[0m"; // Reset to default color
      const logColor = colors[level] || "\x1b[37m"; // Default to white if level is unknown

      console.log(
        `${logColor}[${timestamp}] [${level}]${resetColor}`,
        ...messages
      );
    }
  }

  static info(...messages) {
    this.log("INFO", ...messages);
  }

  static debug(...messages) {
    this.log("DEBUG", ...messages);
  }

  static warning(...messages) {
    this.log("WARNING", ...messages);
  }

  static error(...messages) {
    this.log("ERROR", ...messages);
  }
}

module.exports = {
  Logger,
};
