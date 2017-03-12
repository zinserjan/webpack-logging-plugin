"use strict";

const chalk = require("chalk");

module.exports = function displayErrors(severity, errors) {
  const errorCount = errors.length;

  const message = severity === "error"
    ? `Failed to compile with ${chalk.red(`${errorCount} ${severity}(s)`)}`
    : `Compiled with ${chalk.yellow(`${errorCount} ${severity}(s)`)}`;

  console.log(message);
  console.log();
  errors.forEach(err => console.log(err));
};
