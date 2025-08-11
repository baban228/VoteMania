// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    // Точка входа в приложение
    entry: './src/main.jsx',

    // Куда и как собирать бандлы
    output: {
      path: path.resolve(__dirname, 'dist'), // Выходной путь
      filename: isProduction ? '[name].[contenthash].js' : '[name].js', // Имя файла
      clean: true, // Очищает выходную директорию перед каждой сборкой
    },

    // Расширения файлов, которые Webpack будет пытаться резолвить без указания расширения
    resolve: {
      extensions: ['.js', '.jsx'],
    },

    // Модули и загрузчики
    module: {
      rules: [
        {
          // Обработка файлов .js и .jsx
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            // Опции берутся из babel.config.js
          },
        },
        {
          // Обработка файлов .css
          test: /\.css$/i,
          use: [
            'style-loader', // Внедряет CSS в DOM
            'css-loader',   // Интерпретирует @import и url()
          ],
        },
        {
          // Обработка изображений
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          // Обработка шрифтов
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },

    // Плагины
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html', // Шаблон HTML
      }),
    ],

    // Настройки dev-сервера
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000, // Порт для dev-сервера
      hot: true, // Включить Hot Module Replacement
      open: true, // Автоматически открывать браузер
      historyApiFallback: true, // Полезно для SPA
    },

    // Режим
    mode: isProduction ? 'production' : 'development',

    // Источники карт для отладки
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};