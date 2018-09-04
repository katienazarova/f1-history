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
                loader: 'url-loader?limit=65000&mimetype=image/svg+xml&name=web/assets/fonts/[name].[ext]'
            },
            {
                test: /\.woff$/,
                loader: 'url-loader?limit=65000&mimetype=application/font-woff&name=web/assets/fonts/[name].[ext]'
            },
            {
                test: /\.woff2$/,
                loader: 'url-loader?limit=65000&mimetype=application/font-woff2&name=web/assets/fonts/[name].[ext]'
            },
            {
                test: /\.[ot]tf$/,
                loader: 'url-loader?limit=65000&mimetype=application/octet-stream&name=web/assets/fonts/[name].[ext]'
            },
            {
                test: /\.eot$/,
                loader: 'url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=web/assets/fonts/[name].[ext]'
            }
        ]
    },
    plugins: []
};
