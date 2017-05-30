require('./main.css');
require('./split.css');
require('./params.css');

var split = require('split.js');
var compositionRoot = require('./../components/composition-root');

$(document).ready(function() {
    split(['#diagram', '#params'], {
        sizes: [70, 30],
        minSize: 200
    });

    compositionRoot.run($('#diagram')[0]);
});

