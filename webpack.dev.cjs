const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.cjs');

module.exports = merge(common, {
	devtool: 'inline-source-map',
	mode: 'development',
	devServer: {
	  index: 'index.html',
		contentBase: path.join(__dirname, 'client'),
		port: 3000,
	},
});
