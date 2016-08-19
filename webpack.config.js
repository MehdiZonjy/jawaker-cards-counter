const path = require('path');


module.exports = {
    entry: {
        'popup': './src/popup.js',
        'cards-counter': './src/cards-counter.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    }


};