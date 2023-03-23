const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { DefinePlugin, ProvidePlugin } = require('webpack');
const timestamp = (new Date()).getTime();
const isDevServer = process.env.WEBPACK_SERVE;
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const { fronts, enableOnly = null } = require('./env.js');

const configs = Object.keys(fronts)
    .filter((key) => !enableOnly || enableOnly.includes(key))
    .map(((key) => ({ out: key, ...fronts[key] })));

module.exports = (env, argv) => {
    const { mode = 'development' } = argv;
    const distPath = 'dist';
    const scriptPath = `app-${timestamp}.js`;

    const entry = configs.reduce((entry, item) => {
        return { ...entry, [item.out]: ['@babel/polyfill', `./index-${item.type}.js`] };
    }, {});

    const outPlugins = configs.map((item) => {
        return new HtmlWebpackPlugin({
            template: `../../react/public/index.ejs`,
            templateParameters: {
                title: `Forus ${item.client_type} app`,
                script: isDevServer ? `/${item.out}/${scriptPath}` : `/${scriptPath}`,
                base: isDevServer ? `/${item.out}/` : `/`,
                env_data: JSON.stringify({ webRoot: isDevServer ? item.out : '', ...item }),
            },
            filename: item.out + '/index.html',
            inject: false,
        });
    })

    const copyPlugins = configs.map((item) => {
        return new CopyPlugin({
            patterns: [
                {
                    context: `../assets/${item.client_type}/resources/_common`,
                    from: `**/**.*`,
                    to: path.resolve(__dirname, `${distPath}/${item.out}/assets`),
                    noErrorOnMissing: true,
                    force: true,
                },
                {
                    context: `../assets/${item.client_type}/resources/${item.client_key}`,
                    from: `**/**.*`,
                    to: path.resolve(__dirname, `${distPath}/${item.out}/assets`),
                    noErrorOnMissing: true,
                    force: true,
                },
            ],
            options: {
                concurrency: 100,
            },
        });
    })

    return {
        mode: mode,
        context: path.resolve(__dirname, 'react/src'),

        devServer: {
            static: {
                directory: path.resolve(__dirname, `${distPath}`),
            },
            // publicPath: '/',
            // historyApiFallback: true,
            compress: true,
            port: 5000,
        },

        entry: entry,

        output: {
            path: path.resolve(__dirname, distPath),
            publicPath: '/',
            filename: `[name]/${scriptPath}`,
        },

        resolve: {
            extensions: ['.ts', '.js', '.jsx', '.tsx'],
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/i,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
                /* {
                    test: /\.html$/i,
                    loader: 'html-loader',
                }, */
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    type: 'asset/resource'
                },
                {
                    test: /\.(svg)$/i,
                    loader: 'url-loader',
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        {
                            // Creates `style` nodes from JS strings
                            loader: 'style-loader',
                            options: {
                                esModule: false,
                            }
                        },
                        {
                            // Translates CSS into CommonJS
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'resolve-url-loader',
                            options: {
                                webpackImporter: false,
                            },
                        },
                        {
                            // Compiles Sass to CSS
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                additionalData: "$buildReact: true;",
                            },
                        },
                    ],
                },
                {
                    test: /\.m?(js|jsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                            plugins: [
                                '@babel/plugin-syntax-jsx',
                                '@babel/plugin-transform-react-jsx',
                                '@babel/plugin-transform-flow-strip-types',
                                'syntax-trailing-function-commas',
                                ['@babel/plugin-transform-template-literals', { loose: true }],
                                '@babel/plugin-transform-literals',
                                '@babel/plugin-transform-arrow-functions',
                                '@babel/plugin-transform-block-scoped-functions',
                                '@babel/plugin-transform-object-super',
                                '@babel/plugin-transform-shorthand-properties',
                                '@babel/plugin-transform-computed-properties',
                                '@babel/plugin-transform-for-of',
                                ['@babel/plugin-transform-spread', { loose: true, useBuiltIns: true }],
                                '@babel/plugin-transform-parameters',
                                ['@babel/plugin-transform-destructuring', { loose: true, useBuiltIns: true }],
                            ],
                        },
                    },
                },
            ],
        },

        plugins: [
            ...outPlugins,
            new CleanWebpackPlugin(),
            ...copyPlugins,
            new DefinePlugin({ __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })' }),
            new ProvidePlugin({ React: 'react' }),
        ],

        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({ extractComments: false }),
            ],
        },

        devtool: mode === 'development' ? 'cheap-module-source-map' : false,
    };
};