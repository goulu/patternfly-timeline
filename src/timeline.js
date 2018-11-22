// import d3 from 'd3';

// import configurable from MODULE 'configurable.js';

function configurable(targetFunction, config) {

    function configure(item) {
        return function (value) {
            if (!arguments.length) return config[item];
            config[item] = value;

            return targetFunction;
        };
    }

    for (let item in config) {
        targetFunction[item] = configure(item);
    }
}

/*

if ('object' == typeof exports && 'undefined' != typeof module) {
    module.exports = configurable;
} else if ('function' == typeof define && define.amd) {
    define([], configurable);
} else {
    window.configurable = configurable;
}

*/

// import defaultConfig from './config';

const config = {
    start: new Date(0),
    end: new Date(),
    contextStart: null,
    contextEnd: null,
    minScale: 0,
    maxScale: Infinity,
    width: null,
    padding: {
        top: 30, //must be at least 24 for marker to display properly
        left: 40,
        bottom: 40,
        right: 40
    },
    lineHeight: 40,
    labelWidth: 140,
    sliderWidth: 30,
    contextHeight: 50,
    locale: null,
    axisFormat: null,
    tickFormat: [
        ['.%L', (d) => d.getMilliseconds()],
        [':%S', (d) => d.getSeconds()],
        ['%I:%M', (d) => d.getMinutes()],
        ['%I %p', (d) => d.getHours()],
        ['%b %d', (d) => d.getMonth() && d.getDate()],
        ['%b', (d) => d.getMonth()],
        ['%Y', () => true]
    ],
    eventHover: null,
    eventZoom: null,
    eventClick: null,
    eventLineColor: (d, i) => {
        switch (i % 5) {
            case 0:
                return '#00659c';
            case 1:
                return '#0088ce';
            case 2:
                return '#3f9c35';
            case 3:
                return '#ec7a08';
            case 4:
                return '#cc0000';
        }
    },
    eventColor: null,
    eventShape: (d) => {
        if (d.hasOwnProperty('events')) {
            return '\uf140';
        } else {
            return '\uf111';
        }
    },
    eventPopover: (d) => {
        let popover = '';
        if (d.hasOwnProperty('events')) {
            popover = `Group of ${d.events.length} events`;
        } else {
            for (let i in d.details) {
                popover = popover + i.charAt(0).toUpperCase() + i.slice(1) + ': ' + d.details[i] + '<br>';
            }
            popover = popover + 'Date: ' + d.date;
        }
        return popover;
    },
    marker: true,
    context: true,
    slider: true,
    eventGrouping: 60000, //one minute
};

config.dateFormat = config.locale ? config.locale.timeFormat('%a %x %I:%M %p') : d3.time.format('%a %x %I:%M %p');

const defaultConfig = config;

//    import axesFactory from './axes';

function xAxis(xScale, configuration, width) {
    const tickFormatData = configuration.tickFormat.map(t => t.slice(0));
    const tickFormat = configuration.locale ? configuration.locale.timeFormat.multi(tickFormatData) : d3.time.format.multi(tickFormatData);
    let numTicks = Math.round(width / 70);
    const axis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(numTicks)
        .tickFormat(tickFormat);

    if (typeof configuration.axisFormat === 'function') {
        configuration.axisFormat(axis);
    }

    return axis;
}

function axesFactory(axesContainer, scales, configuration, dimensions) {
    return function (data) {
        const axis = (scope, scale) => {
            const selection = axesContainer.selectAll(`.timeline-pf-x-axis.${scope}`).data([{}]);

            selection.enter()
                .append('g')
                .classed('timeline-pf-x-axis', true)
                .classed(scope, true)
                .call(xAxis(scale, configuration))
                .attr('transform', `translate(0,${scope === 'focus' ? dimensions.height : dimensions.height + dimensions.ctxHeight + 40})`);

            selection.call(xAxis(scale, configuration, dimensions.width));

            selection.exit().remove();
        };

        axis('focus', scales.x);

        if (configuration.context) {
            axis('context', scales.ctx);
        }
    };
}

//    import dropsFactory from './drops';

function dropsFactory(svg, scales, configuration) {

    return function dropsSelector(data) {
        const dropLines = svg.selectAll('.timeline-pf-drop-line').data(data);

        dropLines.enter()
            .append('g')
            .classed('timeline-pf-drop-line', true)
            .attr('transform', (d, idx) => `translate(0, ${scales.y(idx) + (configuration.lineHeight / 2)})`)
            .attr('fill', configuration.eventLineColor);

        dropLines.each(function dropLineDraw(drop) {

            const drops = d3.select(this).selectAll('.timeline-pf-drop').data(drop.data);

            drops.attr('transform', (d) => `translate(${scales.x(d.date)})`);

            const shape = drops.enter()
                .append('text')
                .classed('timeline-pf-drop', true)
                .classed('timeline-pf-event-group', (d) => {
                    return d.hasOwnProperty("events") ? true : false
                })
                .attr('transform', (d) => `translate(${scales.x(d.date)})`)
                .attr('fill', configuration.eventColor)
                .attr('text-anchor', 'middle')
                .attr('data-toggle', 'popover')
                .attr('data-html', 'true')
                .attr('data-content', configuration.eventPopover)
                .attr('dominant-baseline', 'central')
                .text(configuration.eventShape);

            if (configuration.eventClick) {
                shape.on('click', configuration.eventClick);
            }

            if (configuration.eventHover) {
                shape.on('mouseover', configuration.eventHover);
            }

            // unregister previous event handlers to prevent from memory leaks
            drops.exit()
                .on('click', null)
                .on('mouseover', null);

            drops.exit().remove();
        });

        dropLines.exit().remove();
    };
}

//    import labelsFactory from './labels';

function labelsFactory(container, scales, config) {
    return function (data) {
        const labels = container.selectAll('.timeline-pf-label').data(data);

        const countEvents = data => {
            let count = 0;
            for (let i = 0; i < data.length; i++) {
                if (data[i].hasOwnProperty("events")) {
                    count += data[i].events.length;
                } else {
                    count++;
                }
            }
            return count
        }
        const text = d => {
            const count = countEvents(d.data);
            if (d.name === undefined || d.name === '') {
                return `${count} Events`;
            }
            return d.name + (count >= 0 ? ` (${count})` : '');
        };

        labels.text(text);

        labels.enter()
            .append('text')
            .classed('timeline-pf-label', true)
            .attr('transform', (d, idx) => `translate(${config.labelWidth - 20} ${scales.y(idx) + (config.lineHeight / 2)})`)
            .attr('dominant-baseline', 'central')
            .attr('text-anchor', 'end')
            .text(text);

        labels.exit().remove();
    };
}

//    import markerFactory from './marker';

function markerFactory(gridContainer, stampContainer, scales, dimensions, dateFormat) {
    gridContainer.append('rect')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
        .on("mouseover", function () {
            marker.style("display", null);
            timeStamp.style("display", null);
            timeBox.style("display", null);
        })
        .on("mouseout", function () {
            marker.style("display", "none");
            timeStamp.style("display", "none");
            timeBox.style("display", "none");
        })
        .on('mousemove', moveMarker);


    let marker = gridContainer.append('line')
        .classed('timeline-pf-marker', true)
        .attr('y1', 0)
        .attr('y2', dimensions.height);

    const domain = scales.x.domain();

    let timeBox = stampContainer.append('rect')
        .attr('height', '24')
        .attr('width', '150')
        .style('display', 'none');

    let timeStamp = stampContainer.append('text')
        .text(dateFormat(domain[1]))
        .attr('transform', `translate(${scales.x.range()[1]})`)
        .attr('text-anchor', 'middle');

    function moveMarker() {
        let pos = d3.mouse(gridContainer[0][0])[0]
        marker.attr('transform', `translate(${pos})`);
        timeBox.attr('transform', `translate(${pos - 75}, -25)`);
        timeStamp.attr('transform', `translate(${pos}, -9)`)
            .text(dateFormat(scales.x.invert(pos)));

    }

};


// import drawer from './drawer';

function drawer(svg, dimensions, scales, configuration) {
    const defs = svg.append('defs');
    defs.append('clipPath')
        .attr('id', 'timeline-pf-drops-container-clipper')
        .append('rect')
        .attr('id', 'timeline-pf-drops-container-rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

    if (configuration.context) {
        defs.append('clipPath')
            .attr('id', 'timeline-pf-context-brush-clipper')
            .append('polygon')
            .attr('points', `0,0 ${dimensions.width},0 ${dimensions.width + configuration.sliderWidth},${dimensions.ctxHeight / 2} ${dimensions.width},${dimensions.ctxHeight} 0,${dimensions.ctxHeight} ${-configuration.sliderWidth},${dimensions.ctxHeight / 2}`);
    }

    const pattern = defs.append('pattern')
        .attr('class', 'timeline-pf-grid-stripes')
        .attr('id', 'timeline-pf-grid-stripes')
        .attr('width', dimensions.width)
        .attr('height', (configuration.lineHeight) * 2)
        .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('rect')
        .attr('width', dimensions.width)
        .attr('height', configuration.lineHeight);
    pattern.append('line')
        .attr('x1', 0)
        .attr('x2', dimensions.width)
        .attr('y1', configuration.lineHeight)
        .attr('y2', configuration.lineHeight);
    pattern.append('line')
        .attr('x1', 0)
        .attr('x2', dimensions.width)
        .attr('y1', '1px')
        .attr('y2', '1px');

    const gridContainer = svg.append('g')
        .classed('timeline-pf-grid', true)
        .attr('fill', 'url(#timeline-pf-grid-stripes)')
        .attr('transform', `translate(${configuration.padding.left + configuration.labelWidth}, ${configuration.padding.top})`);

    const labelsContainer = svg.append('g')
        .classed('timeline-pf-labels', true)
        .attr('transform', `translate(${configuration.padding.left}, ${configuration.padding.top})`);

    const axesContainer = svg.append('g')
        .classed('timeline-pf-axes', true)
        .attr('transform', `translate(${configuration.padding.left + configuration.labelWidth},  ${configuration.padding.top})`);

    const dropsContainer = svg.append('g')
        .classed('timeline-pf-drops-container', true)
        .attr('clip-path', 'url(#timeline-pf-drops-container-clipper)')
        .attr('transform', `translate(${configuration.padding.left + configuration.labelWidth},  ${configuration.padding.top})`);

    if (configuration.marker) {
        const stampContainer = svg.append('g')
            .classed('timeline-pf-timestamp', true)
            .attr('height', 30)
            .attr('transform', `translate(${configuration.padding.left + configuration.labelWidth}, ${configuration.padding.top})`);

        markerFactory(gridContainer, stampContainer, scales, dimensions, configuration.dateFormat);
    }

    const axes = axesFactory(axesContainer, scales, configuration, dimensions);
    const labels = labelsFactory(labelsContainer, scales, configuration);
    const drops = dropsFactory(dropsContainer, scales, configuration);


    return data => {
        drops(data);
        labels(data);
        axes(data);
    };
}

// import context from './drawer/context';

function context(svg, scales, dimensions, configuration, data) {

    const contextContainer = svg.append("g")
        .classed('timeline-pf-context', true)
        .attr('width', dimensions.width)
        .attr('height', dimensions.ctxHeight)
        .attr('clip-path', 'url(#timeline-pf-context-brush-clipper)')
        .attr("transform", `translate(${configuration.padding.left + configuration.labelWidth},${configuration.padding.top + dimensions.height + 40})`);

    let counts = [];
    let roundTo = 3600000;//one hour
    let barWidth = Math.ceil((roundTo / (scales.ctx.domain()[1] - scales.ctx.domain()[0])) * dimensions.width);

    countEvents(data, roundTo, counts);
    counts.sort((a, b) => {
        if (a.date < b.date) {
            return -1;
        }
        if (a.date > b.date) {
            return 1;
        }
        return 0;
    });
    scales.cty.domain([0, d3.max(counts, (d) => {
        return d.count;
    })]);

    contextContainer.selectAll(".timeline-pf-bar")
        .data(counts)
        .enter().append("rect")
        .attr("class", "timeline-pf-bar")
        .attr("x", d => {
            return scales.ctx(d.date);
        })
        .attr("y", d => {
            return scales.cty(d.count);
        })
        .attr("width", barWidth)
        .attr("height", d => {
            return dimensions.ctxHeight - scales.cty(d.count);
        });

    contextContainer.append("g")
        .attr("class", "timeline-pf-brush");

};

function countEvents(data, toRoundTo, counts) {
    let temp = {};
    for (let i in data) {
        for (let j in data[i].data) {
            let rounded = Math.floor(data[i].data[j].date / toRoundTo) * toRoundTo;
            temp[rounded] = temp[rounded] + 1 || 1;
        }
    }
    for (let k in temp) {
        let tempDate = new Date();
        tempDate.setTime(+k);
        counts.push({'date': tempDate, 'count': temp[k]});
    }
};

// import Zoom from './zoom';

class Zoom {

    constructor() {
    }

    updateZoom(container, dimensions, scales, configuration, data, callback) {
        this.ONE_MINUTE = 60 * 1000;
        this.ONE_HOUR = this.ONE_MINUTE * 60;
        this.ONE_DAY = this.ONE_HOUR * 24;
        this.ONE_WEEK = this.ONE_DAY * 7;
        this.ONE_MONTH = this.ONE_DAY * 30;

        this.grid = d3.select('.timeline-pf-grid');
        this.dimensions = dimensions;
        this.scales = scales;
        this.configuration = configuration;
        this.data = data;
        this.callback = callback;
        this.sliderScale = d3.scale.log()
            .domain([configuration.minScale, configuration.maxScale])
            .range([configuration.minScale, configuration.maxScale])
            .base(2);
        this.zoom = d3.behavior.zoom()
            .size([dimensions.width, dimensions.height])
            .scaleExtent([configuration.minScale, configuration.maxScale])
            .x(scales.x);
        this.brush = null;

        if (configuration.slider) {
            const zoomIn = container.append('button')
                .attr('type', 'button')
                .attr('class', 'btn btn-default timeline-pf-zoom timeline-pf-zoom-in')
                .attr('id', 'timeline-pf-zoom-in')
                .style('top', `${configuration.padding.top}px`)
                .on('click', () => {
                    this.zoomClick()
                });
            zoomIn
                .style('left', `${configuration.padding.left + configuration.labelWidth + dimensions.width + (configuration.sliderWidth - zoomIn.node().offsetWidth)}px`)
                .append('i')
                .attr('class', 'fa fa-plus')
                .attr('id', 'timeline-pf-zoom-in-icon');

            const zoomOut = container.append('button')
                .attr('type', 'button')
                .attr('class', 'btn btn-default timeline-pf-zoom')
                .attr('id', 'timeline-pf-zoom-out')
                .style('top', `${configuration.padding.top + dimensions.height - 26}px`)
                .on('click', () => {
                    this.zoomClick()
                });
            zoomOut
                .style('left', `${configuration.padding.left + configuration.labelWidth + dimensions.width + (configuration.sliderWidth - zoomOut.node().offsetWidth)}px`)
                .append('i')
                .attr('class', 'fa fa-minus')
                .attr('id', 'timeline-pf-zoom-out-icon');

            const zoomSlider = container.append('input')
                .attr('type', 'range')
                .attr('class', 'timeline-pf-zoom timeline-pf-slider')
                .attr('id', 'timeline-pf-slider')
                .style('width', `${dimensions.height - (zoomIn.node().offsetHeight * 2)}px`)
                .attr('value', this.sliderScale(this.zoom.scale()))
                .attr('min', configuration.minScale)
                .attr('max', configuration.maxScale)
                .attr('step', 0.1)
                .on('input', () => {
                    this.zoomClick()
                })
                .on('change', () => {
                    this.zoomClick()
                });
            zoomSlider
                .style('top', `${configuration.padding.top + ((dimensions.height - (zoomIn.node().offsetHeight) * 2) / 2) + zoomIn.node().offsetHeight - (zoomSlider.node().offsetHeight / 2)}px`)
                .style('left', `${configuration.padding.left + configuration.labelWidth + dimensions.width +
                configuration.sliderWidth - ((zoomIn.node().offsetWidth - zoomSlider.node().offsetHeight) / 2) - (zoomSlider.node().offsetWidth / 2)}px`);
        }

        if (configuration.context) {
            this.brush = d3.svg.brush()
                .x(scales.ctx)
                .extent(scales.x.domain())
                .on("brush", () => {
                    this.brushed()
                });

            container.select('.timeline-pf-brush')
                .call(this.brush)
                .selectAll("rect")
                .attr("height", dimensions.ctxHeight);
        }


        if (configuration.eventZoom) {
            this.zoom.on('zoomend', configuration.eventZoom);
        }

        this.zoom.on('zoom', () => {
            requestAnimationFrame(() => callback(data));
            if (configuration.slider) {
                container.select('#timeline-pf-slider').property('value', this.sliderScale(this.zoom.scale()));
            }
            if (configuration.context) {
                this.brush.extent(this.scales.x.domain());
                container.select('.timeline-pf-brush').call(this.brush);
            }
        });
        return this.grid.call(this.zoom)
            .on("dblclick.zoom", null);
    }

    brushed() {
        if (this.brush.empty() !== true) {
            let extent = this.brush.extent();
            this.zoomFilter(extent[0], extent[1], 0);
        }
    }

    zoomClick() {
        let factor = 0.5,
            target_zoom = 1,
            duration = 0,
            center = this.dimensions.width / 2,
            extent = this.zoom.scaleExtent(),
            translate0,
            l,
            view = {
                x: this.zoom.translate()[0],
                k: this.zoom.scale()
            };
        switch (d3.event.target.id) {
            case 'timeline-pf-zoom-in-icon':
            case 'timeline-pf-zoom-in':
                target_zoom = this.zoom.scale() * (1 + factor);
                duration = 100;
                break;
            case 'timeline-pf-zoom-out-icon':
            case 'timeline-pf-zoom-out':
                target_zoom = this.zoom.scale() * (1 + factor * -1);
                duration = 100;
                break;
            case 'timeline-pf-slider':
                target_zoom = this.sliderScale.invert(d3.event.target.value);
                break;
            default:
                target_zoom = this.zoom.scale();
        }

        if (target_zoom < extent[0]) {
            target_zoom = extent[0];
        } else if (target_zoom > extent[1]) {
            target_zoom = extent[1];
        }

        translate0 = (center - view.x) / view.k;
        view.k = target_zoom;
        l = translate0 * view.k + view.x;

        view.x += center - l;
        this.interpolateZoom([view.x, 0], view.k, duration);
    }

    interpolateZoom(translate, scale, duration) {
        return d3.transition().duration(duration).tween("zoom", () => {
            if (this.zoom) {
                let iTranslate = d3.interpolate(this.zoom.translate(), translate),
                    iScale = d3.interpolate(this.zoom.scale(), scale);
                return (t) => {
                    this.zoom
                        .scale(iScale(t))
                        .translate(iTranslate(t));
                    this.zoom.event(this.grid);
                };
            }
        });
    }

    getRange(Extent) {
        return Extent[1].getTime() - Extent[0].getTime();
    }

    getScale(oldRange, newRange) {
        return oldRange / newRange;
    }

    zoomFilter(fromTime, toTime, duration = 100) {
        let range = toTime - fromTime,
            width = this.dimensions.width,
            extent = this.zoom.scaleExtent(),
            translate = this.zoom.translate()[0],
            curZoom = this.zoom.scale(),
            target_zoom = this.zoom.scale(),
            cur_width = this.getRange(this.scales.x.domain()),
            startDiff;

        target_zoom = target_zoom * this.getScale(this.getRange(this.scales.x.domain()), range); // new scale is ratio between old and new date ranges

        if (target_zoom < extent[0]) {
            target_zoom = extent[0];
        } else if (target_zoom > extent[1]) {
            target_zoom = extent[1];
        }

        startDiff = (this.scales.x.domain()[0] - fromTime) * (width / cur_width); // difference between leftmost dates in px

        translate += startDiff;

        translate = translate * (target_zoom / curZoom); // scale translate value (in px) to new zoom scale

        this.interpolateZoom([translate, 0], target_zoom, duration)
    }
}


// timeline
function timeline(config = {}) {
    const finalConfiguration = {...defaultConfig, ...config};
    let zoomInstance = new Zoom();

    const yScale = (data) => {
        return d3.scale.ordinal()
            .domain(data.map((d) => d.name))
            .range(data.map((d, i) => i * finalConfiguration.lineHeight));
    };

    const xScale = (width, timeBounds) => {
        return d3.time.scale()
            .range([0, width])
            .domain(timeBounds);
    };

    function timelineGraph(selection) {
        selection.each(function selector(data) {

            let ungroupedData = data;
            data = groupEvents(data, finalConfiguration.eventGrouping);

            finalConfiguration.lineHeight = (data.length <= 3) ? 80 : 40;
            finalConfiguration.contextStart = finalConfiguration.contextStart || d3.min(getDates(data));
            finalConfiguration.contextEnd = finalConfiguration.contextEnd || finalConfiguration.end;

            d3.select(this).select('.timeline-pf-chart').remove();
            d3.select(this).selectAll('.timeline-pf-zoom').remove();

            const SCALEHEIGHT = 40;
            let outer_width = finalConfiguration.width || selection.node().clientWidth;
            const height = data.length * finalConfiguration.lineHeight;

            const dimensions = {
                width: outer_width - finalConfiguration.padding.right - finalConfiguration.padding.left - finalConfiguration.labelWidth - ((finalConfiguration.slider) ? finalConfiguration.sliderWidth : 0),
                height,
                ctxHeight: finalConfiguration.contextHeight,
                outer_height: height + finalConfiguration.padding.top + finalConfiguration.padding.bottom + ((finalConfiguration.context) ? finalConfiguration.contextHeight + SCALEHEIGHT : 0)
            };
            const scales = {
                x: xScale(dimensions.width, [finalConfiguration.start, finalConfiguration.end]),
                y: yScale(data),
                ctx: xScale(dimensions.width, [finalConfiguration.contextStart, finalConfiguration.contextEnd]),
                cty: d3.scale.linear().range([dimensions.ctxHeight, 0])
            };

            const svg = d3.select(this).append('svg')
                .classed('timeline-pf-chart', true)
                .attr({
                    width: outer_width,
                    height: dimensions.outer_height,
                });
            const draw = drawer(svg, dimensions, scales, finalConfiguration).bind(selection);

            draw(data);

            if (finalConfiguration.context) {
                context(svg, scales, dimensions, finalConfiguration, ungroupedData);
            }

            zoomInstance.updateZoom(d3.select(this), dimensions, scales, finalConfiguration, data, draw);

        });
    }

    configurable(timelineGraph, finalConfiguration);
    timelineGraph.Zoom = zoomInstance;
    return timelineGraph;
}

d3.chart = d3.chart || {};
d3.chart.timeline = timeline;

// module.exports = timeline;

function getDates(data) {
    let toReturn = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].data.length; j++) {
            toReturn.push(data[i].data[j].date);
        }
    }
    return toReturn;
}

function groupEvents(data, toRoundTo) {
    let rounded,
        temp = {},
        toReturn = [];

    for (let i = 0; i < data.length; i++) {
        toReturn[i] = {};
        toReturn[i].name = data[i].name;
        toReturn[i].data = [];
        for (let j = 0; j < data[i].data.length; j++) {
            rounded = Math.round(data[i].data[j].date / toRoundTo) * toRoundTo;
            if (temp[rounded] === undefined) {
                temp[rounded] = [];
            }
            temp[rounded].push(data[i].data[j]);
        }
        for (let k in temp) {
            if (temp[k].length === 1) {
                toReturn[i].data.push(temp[k][0]);
            } else {
                let tempDate = new Date();
                tempDate.setTime(+k);
                toReturn[i].data.push({'date': tempDate, 'events': temp[k]});
            }
        }
        temp = {};
    }
    return toReturn;
}
