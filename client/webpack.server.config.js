const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = (env, argv) => {
    const SERVER_PATH = (argv.mode === 'production') ?
        './src/Server/server-prod.js' :
        './src/Server/server-dev.js';

    return({
            entry: {
                server: SERVER_PATH,
            },
            output: {
                path: path.join(__dirname, 'dist'),
                publicPath: '/dist/',
                filename: 'server.js'
            },
            target: 'node',
            node: {
                // Need this when working with express, otherwise the build fails
                __dirname: false,   // if you don't put this is, __dirname
                __filename: false,  // and __filename return blank or /
            },
            externals: [nodeExternals()], // Need this to avoid error when working with Express
            module: {
                rules: [
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /(node_modules|bower_components)/,
                        loader: "babel-loader",
                        options: {presets: ["@babel/env"]}
                    },
                ]
            }
    })
}