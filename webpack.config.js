/* eslint-env node */
const path = require('path');

module.exports = {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist')
    },

    // module: {
    //     rules: [
    //         {
    //             test: /\.js$/,
    //             loader: "babel-loader"
    //         }
    //     ]
    // }
}