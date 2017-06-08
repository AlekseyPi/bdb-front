var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;

module.exports = function (data) {
    var self = this;

    // designer

    self.id = ko.observable(data.id);
    self.component = ko.computed(() => data.component); // readonly
    self.maxThreadCount = ko.observable(data.maxThreadCount || 100).extend({dataType: "integer", range: {min: 1, max: 500}});

    self.showAxis = ko.observable(false).extend({dataType: "boolean"});

    self.designerParams = [self.maxThreadCount, self.showAxis];

    // not visible observables:

    self.showParams = ko.observable(true);
    self.dragging = ko.observable(false);
    self.linking = ko.observable(null);


    // loading:

    var _viewModelArray = [];
    if (data.elements) {
        for (var i = 0; i < data.elements.length; i++) {
            var vm = vmFactory(data.elements[i], self);
            _viewModelArray.push(vm);
        }
    }

    self.elements = ko.observableArray(_viewModelArray);

    var _linksArray = [];
    if (data.links) {
        for (var i = 0; i < data.links.length; i++) {
            var vm = vmFactory(data.links[i], self);
            _linksArray.push(vm);
        }
    }

    self.links = ko.observableArray(_linksArray);

    //

    self.selectedElement = ko.computed(function(){
        var selectedCount = self.elements().filter(item => item.selected()).length;

        if (selectedCount == 0) {
            return self;
        }

        if (selectedCount == 1) {
            var selectedElement = self.elements().filter(item => item.selected())[0];
            return selectedElement;
        }
    });

    // commands:

    function genNewId(component) {
        var maxId = 0;
        self.elements().forEach(item => {
            if (item.component() == component) {
                var id = +item.id().substr(component.length);
                if (maxId < id) maxId = id;
            }
        });
        return component + (++maxId);
    };

    self.commandAdd = function (x, y, component) {
        var id = genNewId(component);
        var vm = vmFactory({id: id, component: component, x: x, y: y}, self);  // create ViewModel with default data
        self.commandDeselectAll();
        vm.commandSelect();
        self.elements.push(vm);
    };

    self.commandDeleteSelected = function() {
        var deletedElements = self.elements.remove(item => item.selected());
        deletedElements.forEach(deleted => {
            self.links.remove(item => item.source() == deleted.id());
            self.links.remove(item => item.destination() == deleted.id());
        });
        self.links.remove(item => item.selected());
    };

    self.commandMoveSelected = function(deltaX, deltaY) {
        self.elements().forEach(item => {
            if (item.selected()) {
                item.x(item.x() + deltaX);
                item.y(item.y() + deltaY);
            }
        });
        self.links().forEach(link => {
            if (link.selected()) {
                link.path().forEach(point => {
                    point[0] += deltaX;
                    point[1] += deltaY;
                });
                link.path.valueHasMutated();
            }
        });
    };

    self.commandResizeSelected = function(deltaX, deltaY) {
        self.elements().forEach(item => {
            if (item.selected()) {
                item.width(item.width() + deltaX);
                item.height(item.height() + deltaY);
            }
        });
    };

    self.commandDeselectAll = function() {
        self.elements().forEach(item => item.selected(false));
        self.links().forEach(item => item.selected(false));
    };

    self.commandStartLink = function(sourceViewModel, sourceOutIndex) {
        var linking = self.linking;
        if (!linking()) {
            var id = genNewId('link');
            var linkData = {id: id, component: 'link', source: sourceViewModel.id(), sourceOutIndex: sourceOutIndex};
            var vm = vmFactory(linkData, self);  // create ViewModel with default data
            linking(vm);
            self.links.push(vm);
        }
    };

    self.commandEndLink = function(destinationViewModel) {
        var linking = self.linking;
        if (linking()) {
            //! if link already exists?
            linking().destination(destinationViewModel.id());
            linking(null);
        }
    };

    self.commandCancelLink = function () {
        var linking = self.linking;
        if (linking()) {
            var index = self.links.indexOf(linking());
            if (index > -1) {
                self.links.splice(index, 1);
            }
            linking(null);
        }
    }

    // public functions:

    self.getViewModelById = (id) => {
        if (id == null || typeof id === 'undefined') {
            return null;
        }
        var found = self.elements().concat(self.links()).filter(item => item.id() == id);
        if (found.length == 1) {
            return found[0];
        }
        return null;
    };

    self.getElementLinksCount = (id) => {
        var maxIndex = -1;
        var indexes = self.links().filter(item => item.source == id).map(item => item.sourceOutIndex());
        indexes.forEach(item => item > maxIndex ? maxIndex = item : 0); //! will it work ?
        return maxIndex + 1;
    };

};