var ko = require('knockout');

module.exports = function (data) {
    var self = this;

    self.id = ko.observable(data.id);
    self.component = ko.computed(() => data.component); // readonly
    self.selected = ko.observable(false);

    self.source = ko.observable(data.source);
    self.sourceOutIndex = ko.observable(data.sourceOutIndex);
    self.destination = ko.observable(data.destination);
    self.path = ko.observableArray(data.path || []);

    // computed:
    self.diagramGetViewModelById = (id) => {}; // will be overridden by diagram

    var _sourceVM = () => self.diagramGetViewModelById(self.source());
    var _destinationVM = () => self.diagramGetViewModelById(self.destination());

    self.fullPath = ko.pureComputed(() => {
        var result = [];

        if (_sourceVM()) {
            var x1 = _sourceVM().outLinksPoints()[self.sourceOutIndex()].x;
            var y1 = _sourceVM().outLinksPoints()[self.sourceOutIndex()].y;
            result.push([x1, y1]);
        };

        result = result.concat(self.path());

        if (_destinationVM()) {
            var xLast = _destinationVM().inLinkPointViewModel().x;
            var yLast = _destinationVM().inLinkPointViewModel().y;
            result.push([xLast, yLast]);
        }

        return result;
    });



    // commands:

    self.commandSelect = function() {
        self.selected(!self.selected());
    };

    self.commandCancelLink = () => {}; // will be overridden by diagram

    self.commandSetLastPoint = function(point) {
        self.path()[self.path().length - 1] = point;
        self.path.valueHasMutated();
    };

    self.commandAddPoint = function(point) {
        self.path.push(point);
    };

    //

    self.destination.subscribeChanged(function(newValue, oldValue) {
        if (!oldValue && newValue) {
            self.path.pop();
        }
    });

    //

    self.hash = ko.computed(() => {
        return [
            self.selected()
        ].concat(self.fullPath());
    });

    self.designerParams = [];
    self.serializeParams = () => [self.id, self.component, self.source, self.sourceOutIndex, self.destination, self.path];

    self.dispose = () => {
        self.fullPath.dispose();
        self.hash.dispose();
    };
}