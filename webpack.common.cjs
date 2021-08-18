const HtmlPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	node: {
		fs: 'empty',
	},
	context: path.join(__dirname, 'client'),
	entry: [path.join(__dirname, 'client/index.js')],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'game.min.[hash:8].js',
	},
	target: 'web',

	plugins: [
		new CleanWebpackPlugin(),
		new HtmlPlugin({
			file: path.join(__dirname, 'dist', 'index.html'),
			template: './index.html',
		}),
	],
};
