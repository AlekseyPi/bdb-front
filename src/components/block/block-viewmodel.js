var ko = require('knockout');
var inheritBaseComponent = require('./../base-component');

module.exports = function (data, parentViewModel) {
    data.width = data.width || 200;  // default while create new
    data.height = data.height || 150;
    inheritBaseComponent(this, data);

    var self = this;

    self.title = ko.observable(data.title || data.id).extend({dataType: "string"});
    self.singleton = ko.observable(data.singleton).extend({dataType: "boolean"});
    self.params = ko.observable(data.params || '').extend({dataType: "javascript"});
    self.code = ko.observable(data.code || '// block code');
    self.out = ko.observable(data.out || '').extend({dataType: "string"});
    self.outLinks = ko.observableArray(data.outLinks || []);

    self.paramsViewModel = ko.computed(() => {
        try {
            var params = self.params();
            var keyValueArray = params
                .split(';')
                .filter(item => item.indexOf('=') != -1)
                .map(item => {
                return {key: item.split('=')[0].trim(), value: item.split('=')[1].trim()} ;
            });
            return keyValueArray;
        } catch (e) {
            return;
        }
    });

    self.outLinksViewModel = ko.computed(() => {
        return self.out().split(',').map(item => item.trim()).filter(item => item != '');
    });

    self.commandStartLink = (outIndex) => {
        var linking = parentViewModel.linking;
        if (!linking()) {
            linking({vm: self, outIndex: outIndex});
        }
    };

    self.commandEndLink = () => {
        var linking = parentViewModel.linking;
        if (linking()) {
            //linking.vm.outLinks[linking.outIndex].push(self.id()); //!
            parentViewModel.linking(null)
        }
    };

    self.linking = ko.computed(() => parentViewModel.linking());

    self.addViewChangers(self.title, self.singleton, self.params, parentViewModel.linking, self.out);
    self.designerParams.splice(0, 0, self.title);
    self.designerParams.push(self.singleton, self.params, self.out);
};