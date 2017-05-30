var components = require('./components');

components.register(
    'diagram',
    require('./diagram/diagram-viewmodel'),
    require('./diagram/diagram-view')
);

components.register(
    'simpleblock',
    require('./simpleblock/simpleblock-viewmodel'),
    require('./simpleblock/simpleblock-view')
);


module.exports.run = function (parentNode) {
    //var diagramData = {component: 'diagram', id: 'diagram1'};

    //debug:
    var diagramData = {component: 'diagram', id: 'diagram1', elements: [{component: 'simpleblock', id: 'simpleblock1', x: 100, y: 100, width: 200, height: 100}]};

    var vm = components.ViewModelFactory(diagramData);
    var v = components.ViewFactory(vm, parentNode);

    //debug initialize repaint:
    vm.elements.valueHasMutated();
};