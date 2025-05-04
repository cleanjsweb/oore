const glob = require('glob');

module.exports = {
	entry: glob.sync('./src/*.js').reduce((obj, val) => {
		const filenameRegex = /([\w\d_-]*)\.?[^\\\/]*$/i;
		obj[val.match(filenameRegex)[1]] = val;
		return obj;
	}, {}),
	output: {
		filename: '[name].[chunkhash].bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
}
