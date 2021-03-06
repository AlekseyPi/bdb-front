var Components = function() {
    var self = this;
    var components = {};
    self.get = function(component) {
        var c = components[component];
        if (!c) throw new Error('Component not registered: ' + component);
        return c;
    };
    self.ViewModelFactory = function(component) {
        var vmFactory = self.get(component).ViewModelFactory;
        return new vmFactory();
    };
    self.ViewFactory = function(vm, parentNode) {
        var vFactory = self.get(vm.component()).ViewFactory;
        return new vFactory(vm, parentNode);
    };
    self.register = function(component, ViewModelFactory, ViewFactory) {
        components[component] = {ViewModelFactory: ViewModelFactory, ViewFactory: ViewFactory};
    }
};

var components = new Components();

module.exports = components;
