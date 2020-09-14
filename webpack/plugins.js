const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function (production) {
    var plugins = [
        new MiniCssExtractPlugin({
            filename: 'timeline.css', 
            allChunks: true
        }),
    ];

    if (!production) {
        plugins.push(new HtmlWebpackPlugin({
            template: path.join(__dirname, '../demo/index.html'),
            hash: true
        }));
    }

    return plugins;
};