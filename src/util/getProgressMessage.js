"use strict";
const chalk = require("chalk");
const multiCompilerRegex = /^\[\d+\]\s+/;

module.exports = function getProgressMessage(percent, msg, ...details) {
  msg = (msg || "").replace(multiCompilerRegex, "");

  switch (true) {
    case msg === "compile":
      return chalk.cyan("Scanning");

    case msg.indexOf("building modules") >= 0:
      const [complete, toGo] = details[0].split("/");
      return chalk.cyan(`Building Modules [${complete} of ${toGo}]`);

    case msg === "chunk asset optimization" || msg === "asset optimization":
      return chalk.yellow("Packing up assets");

    case msg.indexOf("optimizing") >= 0 ||
      msg.indexOf("optimization") >= 0 ||
      msg.indexOf("reviving") >= 0:
      return chalk.yellow("Optimizing");

    case msg === "hashing":
      return chalk.yellow("Hashing modules");

    case msg.indexOf("processing") >= 0:
      return chalk.yellow("Processing assets");

    case msg === "recording":
      return chalk.yellow("Store compilation details");

    case msg === "emitting":
      return chalk.yellow("Writing to disc");

    case msg === "":
      return "";

    default:
      return chalk.yellow(`${msg[0].toUpperCase()}${msg.slice(1)}`);
  }
};
