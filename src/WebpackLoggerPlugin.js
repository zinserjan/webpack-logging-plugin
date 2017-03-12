"use strict";

const chalk = require("chalk");
const _ = require("lodash");
const readline = require("readline");
const frame = require("elegant-spinner")();
const ProgressPlugin = require("webpack").ProgressPlugin;
const clearConsole = require("./util/clearConsole");
const registerCompilerCallback = require("./util/registerCompilerCallbacks");
const getProgressMessage = require("./util/getProgressMessage");
const displayErrors = require("./util/displayErrors");

class WebpackLoggerPlugin {
  constructor(opts = {}) {
    this._formatError = opts.formatError || (err => err);
    this._formatStats = opts.formatStats || (stats => stats.toJson({}, true));
    (this._successCallback = opts.successCallback || (() => void 0)), (this._startTime = null);
    this._interactive = process.stdout.isTTY;
    this._progressLogger = _.throttle(
      (percent, msg, ...details) =>
        this._compilationProgress(getProgressMessage(percent, msg, ...details)),
      150
    );
  }

  apply(compiler) {
    // Note: throttle is necessary as showing progress slows down
    this.compilers = Array.isArray(compiler.compilers) ? compiler.compilers : [compiler];
    this._hashes = this.compilers.map(() => null);

    if (this._interactive) {
      compiler.apply(new ProgressPlugin(this._progressLogger));
    }

    registerCompilerCallback.registerStart(compiler, () => {
      this._compilationStarted();
    });

    registerCompilerCallback.registerFailed(compiler, error => {
      this._compilationErrored(error);
    });

    registerCompilerCallback.registerDone(compiler, stats => {
      this._compilationFinished(stats);
    });
  }

  _compilationStarted() {
    if (this._interactive) {
      clearConsole();
    }
    this._startTime = Date.now();
    console.log(chalk.cyan("Compiling..."));
    console.log();
  }

  _compilationProgress(msg = "") {
    const stream = process.stdout;
    readline.clearLine(stream, 0);
    readline.cursorTo(stream, 0, null);
    if (msg !== "") {
      stream.write(`${chalk.magenta(frame())} ${msg}`);
    }
  }

  _compilationErrored(error) {
    const formattedError = this._formatError(error);
    displayErrors("error", [formattedError]);
  }

  _compilationFinished(webpackStats) {
    if (this._interactive) {
      // abort throttled progress as we are already ready
      this._progressLogger.cancel();
      // and clear last line of progress
      this._compilationProgress();
      clearConsole();
    }
    const multiStats = Array.isArray(webpackStats.stats) ? webpackStats.stats : [webpackStats];
    const hashes = multiStats.map(s => s.hash);
    const compileTime = multiStats.reduce(
      (compileTime, stats, index) => {
        if (stats.hash !== this._hashes[index] && stats.startTime && stats.endTime) {
          const time = stats.endTime - stats.startTime;
          if (time > compileTime) {
            return time;
          }
        }
        return compileTime;
      },
      Date.now() - this._startTime
    );
    this._hashes = hashes;

    const messages = this._formatStats(webpackStats);

    // if errors exist, only show errors.
    if (messages.errors.length > 0) {
      displayErrors("error", messages.errors);
      return;
    }

    // show warnings if no errors were found.
    if (messages.warnings.length > 0) {
      displayErrors("warning", messages.errors);
      return;
    }

    console.log(chalk.green(`Build completed in ${chalk.white.dim(`${compileTime}ms`)}`));
    console.log();
    console.log(chalk.dim("Waiting for changes..."));

    this._successCallback();
  }
}

module.exports = WebpackLoggerPlugin;
