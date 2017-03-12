# Webpack Logging Plugin

## Introduction

Webpack's default output during compilation is usually not very pretty. This plugin gives you are better progress 
logging and the opportunity to format your webpack errors/warnings by yourself.


## Install

```bash
$ npm install --save-dev webpack-logging-plugin
```

## Usage

Add this to your webpack config:

```js
const WebpackLoggingPlugin = require('webpack-logging-plugin');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const config = {
  entry: '...',
  output: {},
  modules: {},
  plugins: [
    new WebpackLoggingPlugin({
      formatError: (err) => err, 
      formatStats: (stats) => formatWebpackMessages(stats.toJson({}, true)),
      successCallback: () => console.log("App is running at: http://localhost:3000/")
    })
  ]
};
```

or if you are using a multi compiler environment like for universal applications:
 
```js
const express = require('express');
const webpack = require('webpack');
const WebpackLoggingPlugin = require('webpack-logging-plugin');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackHotServerMiddleware = require('webpack-hot-server-middleware');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const configs = require('./webpack//webpack.config.dev.js');

const multiCompiler = webpack(configs);

// apply pretty webpack status logging
multiCompiler.apply(new WebpackLoggingPlugin({
  formatError: (err) => err, 
  formatStats: (stats) => formatWebpackMessages(stats.toJson({}, true)),
  successCallback: () => console.log("App is running at: http://localhost:3000/")
}));

// init & start dev server
const app = express();
app.use(webpackDevMiddleware(multiCompiler, {
  stats: false,
  quiet: true,
  noInfo: true,
  serverSideRender: true,
}));
app.use(webpackHotMiddleware( multiCompiler.compilers.find(compiler => compiler.name === 'client'), {
  log: false,
}));
app.use(webpackHotServerMiddleware(multiCompiler));
app.listen(3000);
```


## License

MIT
