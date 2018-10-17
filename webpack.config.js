const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/Application.jsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            { test: /\.scss?$/, loader: 'style-loader!css-loader!sass-loader' },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            {
                test: /\.svg$/,
                loader: 'url-loader?limit=65000&mimetype=image/svg+xml'
            },
            {
                test: /\.woff$/,
                loader: 'url-loader?mimetype=application/font-woff'
            },
            {
                test: /\.woff2$/,
                loader: 'url-loader?mimetype=application/font-woff2'
            },
            {
                test: /\.[ot]tf$/,
                loader: 'url-loader?mimetype=application/octet-stream'
            },
            {
                test: /\.eot$/,
                loader: 'url-loader?mimetype=application/vnd.ms-fontobject'
            }
        ]
    },
    plugins: []
};
