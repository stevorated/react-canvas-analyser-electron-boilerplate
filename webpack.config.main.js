const merge = require('webpack-merge');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

const base = require('./webpack.config.base');

const isDev = process.env.NODE_ENV !== 'production';
const startupHook = isDev ? 'sleep 3 && yarn run:electron' : 'echo DONE!';

const terser = new TerserPlugin({
    terserOptions: {
        ecma: undefined,
        warnings: false,
        parse: {},
        compress: {},
        mangle: true, // Note `mangle.properties` is `false` by default.
        module: false,
        output: null,
        toplevel: false,
        nameCache: null,
        ie8: false,
        keep_classnames: true,
        keep_fnames: false,
        safari10: false,
    },
});

const config = {
    entry: './src/main/main.ts',
    target: 'electron-main',

    module: {
        rules: [
            {
                test: /\.ts$/,
                include: /src/,
                use: [{ loader: 'awesome-typescript-loader' }],
            },
        ],
    },

    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'index.js',
    },

    externals: {
        sqlite3: 'commonjs sqlite3',
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
    },

    plugins: [
        new WebpackShellPlugin({
            onBuildStart: ['echo "Webpack Start"'],
            onBuildEnd: [startupHook],
        }),
    ],

    optimization: {
        minimize: true,
        minimizer: [terser],
    },

    node: {
        __dirname: false,
    },
};

module.exports = merge(base, config);
