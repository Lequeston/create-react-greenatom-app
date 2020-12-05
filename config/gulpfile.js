const gulp = require('gulp');
const spsave = require('gulp-spsave');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const path = require('path');

const webpackConfig = require('./webpack.config.js');

const auth = require('../settings/secretSettings.js').auth;
const settings = require('../settings/settings.js');

const { globalPath, sites } = settings;
const rootPath = path.resolve(__dirname, '..');

const build = (buildPath, folder) => {
	return () => {
		return gulp.src('../src/index.tsx')
			.pipe(webpackStream(
				webpackConfig(rootPath, buildPath, folder),
				webpack,
				(err, stats) => {
					console.error(err);
					console.error(stats);
				}
			))
			.pipe(gulp.dest(buildPath));
	}
}

const send = (buildPath, siteUrl, folder) => {
	const srcPath = `../${globalPath}/${buildPath}/**/*.*`;
	return () => {
		return gulp.src(srcPath)
				.pipe(spsave({
					siteUrl,
					folder,
					flatten: false
				}, auth))
	}
}

const buildAll = () => {
	return sites.map(({ buildPath, siteUrl, folder }, index) => {
		const pathBuild = path.resolve(rootPath, globalPath, buildPath + index);
		console.log(`../${globalPath}/${buildPath + index}/**/*.*`);
		return gulp.series(build(pathBuild, folder), send(buildPath + index, siteUrl, folder));
	});
}
exports.default = gulp.parallel(...buildAll());