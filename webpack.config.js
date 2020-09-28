const path = require('path');
const glob = require('globby');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const chalk = require('chalk');
const figlet = require('figlet');
const CSS_PATH = {
	pattern: ['app/pages/**/*.scss', 'app/components/**/*.scss', 'app/app.scss','app/utils/**/*.scss'],
	app: path.join(__dirname, 'app')
};

const init = () => {
	console.log(
		chalk.bold.rgb(
			253,
			202,
			31
		)(
			figlet.textSync('PGY SELENE', {
				horizontalLayout: 'default',
				verticalLayout: 'default'
			})
		)
	);
};

const getCSSEntries = (config) => {
	const fileList = glob.sync(config.pattern);
	return fileList.reduce((previous, current) => {
		const filePath = path.parse(path.relative(config.app, current));
		const withoutSuffix = path.join(filePath.dir, filePath.name);
		previous[withoutSuffix] = path.resolve(__dirname, current);
		return previous;
	}, {});
};

let config = {
	entry: getCSSEntries(CSS_PATH),
	output: {
		path: __dirname
	},
	mode: 'production',
	watch: true,
	module: {
		rules: [
			{
				test: /\.(scss)$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
			}
		]
	},
	plugins: [
		new FixStyleOnlyEntriesPlugin(),
		new MiniCssExtractPlugin({
			filename: '/app/[name].wxss'
		})
	],
	resolve: {
		extensions: ['.scss']
	}
};

init()
module.exports = config;
