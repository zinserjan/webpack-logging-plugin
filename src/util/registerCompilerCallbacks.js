"use strict";

exports.registerStart = (compiler, callback) => {
  // Note: This is so complicated cause MultiCompiler doesn't trigger start events

  const compilers = Array.isArray(compiler.compilers) ? compiler.compilers : [compiler];
  let compilerStarted = 0;

  compilers.forEach(compiler => {
    let running = false;

    const start = (_, cb) => {
      if (running) {
        compilerStarted--;
      }
      const started = compilerStarted === 0;
      running = true;
      compilerStarted++;
      if (started) {
        callback();
      }
      cb();
    };

    // Note: done/failed will not be triggered, when there was a change while webpack is compiling, it will just
    // trigger watch-run again, that's why we have to track if webpack is already running
    compiler.plugin("watch-run", start);
    compiler.plugin("run", start);

    compiler.plugin("failed", () => {
      running = false;
      compilerStarted--;
    });

    compiler.plugin("done", () => {
      running = false;
      compilerStarted--;
    });
  });
};

exports.registerInvalid = (compiler, callback) => {
  compiler.plugin("invalid", callback);
};

exports.registerFailed = (compiler, callback) => {
  compiler.plugin("failed", callback);
};

exports.registerDone = (compiler, callback) => {
  compiler.plugin("done", callback);
};
