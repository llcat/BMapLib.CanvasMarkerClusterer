/* eslint-env node */
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'none',
    
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9999
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bmaplib.markerclusterer.js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'index.html'
        })
    ]
}