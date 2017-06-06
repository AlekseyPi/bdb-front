var ko = require('knockout');
var inheritBaseComponent = require('./../base-component');

module.exports = function (data) {
    inheritBaseComponent(this, data);

    var self = this;
    self.text = ko.observable(data.text || data.id).extend({dataType: "string"});

    self.addViewChangers(self.text);
    self.blockParams.splice(0, 0, self.text);
};