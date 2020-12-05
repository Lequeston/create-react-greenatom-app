'use strict';

//дополнительные модули
const webpack = require('webpack');
const path = require('path');
const dotenv = require('dotenv');

//плагины
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

dotenv.config();

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

module.exports = (workPath, buildPath, publicPath) => {

	const optimization = () => {
		const config = {
			splitChunks: {
				chunks: 'all'
			}
		}
	
		if (isProd) {
			config.minimizer = [
				new OptimizeCssAssetsWebpackPlugin(),
				new TerserWebpackPlugin()
			]
		}
	
		return config;
	}
	
	const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

	return {
		context: path.resolve(workPath, 'src'),
		entry: {
			app: ['whatwg-fetch', '@babel/polyfill', './index.tsx']
		},
		output: {
			filename: filename('js'), //билд js-ников
			path: path.resolve(workPath, buildPath) //папка в которую будет собираться
		},
		//настройки удобства в разработке 
		resolve: {
			//расширения, которые можно не писать
			extensions: [
				'.js', '.json', '.ts', '.tsx', '.jsx'
			],
			//сокращаем пути
			alias: {
				'@': path.resolve(workPath, 'src'),
				'@types': path.resolve(workPath, 'src', 'types'),
				'@redux': path.resolve(workPath, 'src', 'redux'),
				'@hooks': path.resolve(workPath, 'src', 'hooks'),
				'@components': path.resolve(workPath, 'src', 'components'),
				'@assets': path.resolve(workPath, 'src', 'assets')
			}
		},
		optimization: optimization(),

		plugins: [
			new HtmlWebpackPlugin({
				template: './index.html',
				publicPath: publicPath,
				minify: {
					collapseWhitespace: isProd
				}
			}),
			new CleanWebpackPlugin(),
			new MiniCSSExtractPlugin({
				filename: filename('css')
			})
		],

		devtool: isDev ? 'source-map' : undefined,

		module: {
			rules: [
				{
					test: /\.s[ac]ss$/,
					exclude: /node_modules/,
					use: [
						{
							loader: MiniCSSExtractPlugin.loader,
							options: {
								hmr: isDev,
								reloadAll: true
							}
						},
						'css-loader',
						'sass-loader'
					]
				},
				{
					test: /\.css$/,
					exclude: /node_modules/,
					use: [
						{
							loader: MiniCSSExtractPlugin.loader,
							options: {
								hmr: isDev,
								reloadAll: true
							}
						},
						'css-loader',
					]
				},
				{
					test: /\.tsx$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
								'@babel/preset-react',
								'@babel/preset-typescript'
							]            
						}
					}
				},
				{
					test: /\.ts$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
								'@babel/preset-typescript'
							]            
						}
					}
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env'
							]            
						}
					}
				},
				{
					test: /\.(png|jpg|woff|woff2|eot|ttf|otf|webp)$/,
					exclude: /node_modules/,
					use: [{
						loader: 'file-loader',
						options: {
							outputPath: 'assets',
							name: filename('ext')
						}
					}]
				}
			]
		}
	}
}