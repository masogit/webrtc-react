/** @format */

const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const global = {
	devPort: process.env.DEVPORT || 3000,
	nodeEnv: process.env.NODE_ENV || "production",
	basename: "/",
}

const rules = [
	{
		test: /\.jpe?g$|\.gif$|\.png$|^(?!.*\.inline\.svg$).*\.svg$/i,
		use: {
			loader: "url-loader",
			options: {
				// name: 'assets/[name].[ext]',
				limit: 10 * 1024,
			},
		},
	},
	{ test: /\.jsx?$/, exclude: /node_modules/, use: { loader: "babel-loader" } },
	{
		test: /\.less$/,
		exclude: [/\.(css)$/, /node_modules/],
		use: [
			{ loader: "style-loader" },
			{ loader: "css-loader" },
			{ loader: "postcss-loader" },
			{
				loader: "less-loader",
				options: {
					lessOptions: {
						javascriptEnabled: true,
					},
				},
			},
		],
	},
	{
		test: /\.(css|scss)$/,
		use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "sass-loader" }, { loader: "postcss-loader" }],
	},
	{ test: /\.(eot|ttf|woff|woff2)$/, use: { loader: "file-loader" } },
	{ test: /\.(ogg|mp3|aac)$/, use: { loader: "file-loader" } },
]

const config = {
	mode: global.nodeEnv,
	devtool: global.nodeEnv === "production" ? false : "cheap-module-eval-source-map",
	entry: {
		app: ["babel-polyfill", "./src/index"],
		vendor: ["react", "react-dom", "react-router", "lodash", "moment"],
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "[name].[hash].js",
		chunkFilename: "[name].[chunkhash].js",
		publicPath: "/",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@containers": path.resolve(__dirname, "src/containers"),
			"@images": path.resolve(__dirname, "src/images"),
			"@components": path.resolve(__dirname, "src/components"),
		},
		modules: ["node_modules"],
		extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".scss", ".css", "sass"],
	},
	module: {
		rules,
	},
	watchOptions: {
		ignored: [path.resolve(__dirname, "./node_modules")],
	},
	plugins: [
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "./public/index.html",
		}),
	],
	optimization: {
		splitChunks: {
			chunks: "all",
			minSize: 30000,
			maxSize: 0,
			minChunks: 1,
			maxAsyncRequests: 12,
			maxInitialRequests: 9,
			automaticNameDelimiter: "~",
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name(module, chunks, chcheGroupKey) {
						let name = module.context.match(/[\\/]node_modules[\\/](.*?)[\\/]/)
						return name ? name[1] : "vender"
					},
					priority: -10,
				},
				default: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true,
				},
			},
		},
	},
	performance: {
		hints: "warning",
		maxAssetSize: 30000000,
		maxEntrypointSize: 50000000,
		assetFilter: function (fileName) {
			return fileName.endsWith(".css") || fileName.endsWith(".js") || fileName.endsWith(".ts") || fileName.endsWith(".css") || fileName.endsWith(".less") || fileName.endsWith(".scss")
		},
	},
	devServer: {
		host: "0.0.0.0",
		useLocalIp: false,
		hot: true,
		port: global.devPort,
		disableHostCheck: true,
		compress: true,
		publicPath: global.basename,
		historyApiFallback: true,
		open: true,
		openPage: "",
		proxy: {
			"/socket.io": {
				target: "http://localhost:3009",
				headers: { referer: "http://localhost:3009" },
				changeOrigin: true,
			},
		},
	},
}

module.exports = config
