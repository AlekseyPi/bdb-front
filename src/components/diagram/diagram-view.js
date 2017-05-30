var d3 = require('d3');
require('./diagram-view.css');
var vFactory = require('./../components').ViewFactory;

module.exports = function(vm, parentNode) {

    var svg = d3.select(parentNode)
        .append('svg')
        .attr('class', 'diagram-svg')
        .attr('tabindex', 1)
    ;

    var svgGroup = svg.append('g');

    svg.node().focus();

    svg.on('mousedown', function () {
        vm.commandDeselectAll();
        svg.node().focus();

        if (d3.event.altKey) {  //!! implement according to UI state
            var mouse = d3.mouse(svg.select('g').node());
            var x = mouse[0];
            var y = mouse[1];
            vm.commandAdd(x, y, 'simpleblock');
        }
    });

    svg.on('keydown', function () {
        if (d3.event.keyCode === 8) {
            vm.commandDeleteSelected();
        }
        var multiplier = 10;
        if (d3.event.shiftKey) {
            multiplier = 1;
        }
        if (d3.event.altKey) {
            if (d3.event.keyCode === 38) { //up
                vm.commandResizeSelected(0, -1 * multiplier);
            }
            if (d3.event.keyCode === 40) { // down
                vm.commandResizeSelected(0, 1 * multiplier);
            }
            if (d3.event.keyCode === 37) { // left
                vm.commandResizeSelected(-1 * multiplier, 0);
            }
            if (d3.event.keyCode === 39) { // right
                vm.commandResizeSelected(1 * multiplier, 0);
            }
        } else {
            if (d3.event.keyCode === 38) { //up
                vm.commandMoveSelected(0, -1 * multiplier);
            }
            if (d3.event.keyCode === 40) { // down
                vm.commandMoveSelected(0, 1 * multiplier);
            }
            if (d3.event.keyCode === 37) { // left
                vm.commandMoveSelected(-1 * multiplier, 0);
            }
            if (d3.event.keyCode === 39) { // right
                vm.commandMoveSelected(1 * multiplier, 0);
            }
        }
    });


    var svgBounds = svg.node().getBoundingClientRect();
    var width = ~~svgBounds.width; // ~~ = round
    var height = ~~svgBounds.height; // ~~ = round

    svgGroup.append("g")
        .attr("class", "x axis")
        .selectAll("line")
        .data(d3.range(0, width, 10))
        .enter().append("line")
        .attr("x1", function(d) { return d; })
        .attr("y1", 0)
        .attr("x2", function(d) { return d; })
        .attr("y2", height);

    svgGroup.append("g")
        .attr("class", "y axis")
        .selectAll("line")
        .data(d3.range(0, height, 10))
        .enter().append("line")
        .attr("x1", 0)
        .attr("y1", function(d) { return d; })
        .attr("x2", width)
        .attr("y2", function(d) { return d; });


    svg.call(d3.zoom()
        .scaleExtent([0.3, 8])
        .on("zoom", function() {
            svgGroup.attr("transform", d3.event.transform);
        }));

    function update(data) {
        var elements = svgGroup.selectAll('g:not(.axis)').data(data, function (d) {
            return d.id();
        });
        elements.exit().remove();

        elements.enter().append("g").each(function(vm) {
            vFactory(vm, this); // create new self-painting view
        });

        d3.select(parentNode)
            .selectAll('.element')
            .on('mousedown', function(d) {
                if (!vm.dragging()) {
                    if (d3.event.shiftKey){
                        d.commandSelect();
                    } else {
                        if (!d.selected()) {
                            vm.commandDeselectAll();
                            d.commandSelect();
                        }
                    }
                }

                if (d3.event) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            })
            .call(d3.drag().on('start', dragStart).on("drag", dragged).on('end', dragEnd))
        ;

        function dragStart() {
            vm.dragging(true);
        }

        function dragged() {
            vm.commandMoveSelected(d3.event.dx, d3.event.dy);
        };

        function dragEnd() {
            vm.dragging(false);
            // save
        };
    };


    vm.elements.subscribe(function (newValue) {
        update(newValue);
    });
}