var path = require('path');

module.exports = function (production) {
    var entries = {
        timeline: [
            path.join(__dirname, '../src/timeline'),
            path.join(__dirname, '../style.css'),
        ]
    };

    if (!production) {
        /* D3 is defined as an external, but we need it for the demo. So, let's
        include it using the full path to trick Webpack. */
        entries['demo-d3'] = path.join(__dirname, '../node_modules/d3/build/d3.min.js');
        entries.demo = [
            path.join(__dirname, '../demo/script.js')
        ];

        entries.timeline.push('webpack-dev-server/client?http://localhost:8080');
    }

    return entries;
};
