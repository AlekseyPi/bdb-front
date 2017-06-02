var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;

module.exports = function (data) {
    var self = this;

    self.id = ko.observable(data.id);
    self.component = ko.computed(() => data.component); // readonly
    self.x = ko.observable(data.x).extend({dataType: "integer"});;
    self.y = ko.observable(data.y).extend({dataType: "integer"});;
    self.width = ko.observable(data.width || 100).extend({dataType: "integer", range: {min: 100, max: 500}});
    self.height = ko.observable(data.height || 50).extend({dataType: "integer", range: {min: 50, max: 500}});
    self.selected = ko.observable(false);

    self.hash = ko.computed(function(){
        return [self.x(), self.y(), self.width(), self.height(), self.selected()];
    });

    self.params = [self.x, self.y, self.width, self.height];

    self.commandSelect = function() {
        self.selected(!self.selected());
    };
};