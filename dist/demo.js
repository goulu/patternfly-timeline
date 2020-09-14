(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["timeline"] = factory();
	else
		root["timeline"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./demo/script.js":
/*!************************!*\
  !*** ./demo/script.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("$(document).ready(function () {\n  $('[data-toggle=\"popover\"]').popover({\n    'container': '#pf-timeline',\n    'placement': 'top'\n  });\n});\n$(document).on('click', '.drop', function () {\n  $(this).popover('show');\n});\n$(document).on('click', '.grid', function () {\n  $('[data-toggle=\"popover\"]').popover('hide');\n});\nvar ONE_HOUR = 60 * 60 * 1000,\n    ONE_DAY = 24 * ONE_HOUR,\n    ONE_WEEK = 7 * ONE_DAY,\n    ONE_MONTH = 30 * ONE_DAY,\n    SIX_MONTHS = 6 * ONE_MONTH;\nvar data = [],\n    start = new Date('2016-04-02T20:14:22.691Z'),\n    today = new Date('2016-05-02T17:59:06.134Z');\n\nfor (var x in json) {\n  //json lives in external file for testing\n  data[x] = {};\n  data[x].name = json[x].name;\n  data[x].data = [];\n\n  for (var y in json[x].data) {\n    data[x].data.push({});\n    data[x].data[y].date = new Date(json[x].data[y].date);\n    data[x].data[y].details = json[x].data[y].details;\n  }\n\n  $('#timeline-selectpicker').append(\"<option>\" + data[x].name + \"</option>\");\n  data[x].display = true;\n}\n\n$('#timeline-selectpicker').selectpicker('selectAll');\nvar timeline = d3.chart.timeline().end(today).start(today - ONE_WEEK).minScale(ONE_WEEK / ONE_MONTH).maxScale(ONE_WEEK / ONE_HOUR).eventClick(function (el) {\n  var table = '<table class=\"table table-striped table-bordered\">';\n\n  if (el.hasOwnProperty(\"events\")) {\n    table = table + '<thead>This is a group of ' + el.events.length + ' events starting on ' + el.date + '</thead><tbody>';\n    table = table + '<tr><th>Date</th><th>Event</th><th>Object</th></tr>';\n\n    for (var i = 0; i < el.events.length; i++) {\n      table = table + '<tr><td>' + el.events[i].date + ' </td> ';\n\n      for (var j in el.events[i].details) {\n        table = table + '<td> ' + el.events[i].details[j] + ' </td> ';\n      }\n\n      table = table + '</tr>';\n    }\n\n    table = table + '</tbody>';\n  } else {\n    table = table + 'Date: ' + el.date + '<br>';\n\n    for (i in el.details) {\n      table = table + i.charAt(0).toUpperCase() + i.slice(1) + ': ' + el.details[i] + '<br>';\n    }\n  }\n\n  $('#legend').html(table);\n});\n\nif (countNames(data) <= 0) {\n  timeline.labelWidth(60);\n}\n\nvar element = d3.select('#pf-timeline').append('div').datum(data.filter(function (eventGroup) {\n  return eventGroup.display === true;\n}));\ntimeline(element);\n$('#timeline-selectpicker').on('changed.bs.select', function (event, clickedIndex, newValue, oldValue) {\n  data[clickedIndex].display = !data[clickedIndex].display;\n  element.datum(data.filter(function (eventGroup) {\n    return eventGroup.display === true;\n  }));\n  timeline(element);\n  $('[data-toggle=\"popover\"]').popover({\n    'container': '#pf-timeline',\n    'placement': 'top'\n  });\n});\n$(window).on('resize', function () {\n  timeline(element);\n  $('[data-toggle=\"popover\"]').popover({\n    'container': '#pf-timeline',\n    'placement': 'top'\n  });\n});\n$('#datepicker').datepicker({\n  autoclose: true,\n  todayBtn: \"linked\",\n  todayHighlight: true\n});\n$('#datepicker').datepicker('setDate', today);\n$('#datepicker').on('changeDate', zoomFilter);\n$(document.body).on('click', '.dropdown-menu li', function (event) {\n  var $target = $(event.currentTarget);\n  $target.closest('.dropdown').find('[data-bind=\"label\"]').text($target.text()).end().children('.dropdown-toggle').dropdown('toggle');\n  zoomFilter();\n  return false;\n});\n\nfunction countNames(data) {\n  var count = 0;\n\n  for (var i = 0; i < data.length; i++) {\n    if (data[i].name !== undefined && data[i].name !== '') {\n      count++;\n    }\n  }\n\n  return count;\n}\n\nfunction zoomFilter() {\n  var range = $('#range-dropdown').find('[data-bind=\"label\"]').text(),\n      position = $('#position-dropdown').find('[data-bind=\"label\"]').text(),\n      date = $('#datepicker').datepicker('getDate'),\n      startDate,\n      endDate;\n\n  switch (range) {\n    case '1 hour':\n      range = ONE_HOUR;\n      break;\n\n    case '1 day':\n      range = ONE_DAY;\n      break;\n\n    case '1 week':\n      range = ONE_WEEK;\n      break;\n\n    case '1 month':\n      range = ONE_MONTH;\n      break;\n  }\n\n  switch (position) {\n    case 'centered on':\n      startDate = new Date(date.getTime() - range / 2);\n      endDate = new Date(date.getTime() + range / 2);\n      break;\n\n    case 'starting':\n      startDate = date;\n      endDate = new Date(date.getTime() + range);\n      break;\n\n    case 'ending':\n      startDate = new Date(date.getTime() - range);\n      endDate = date;\n      break;\n  }\n\n  timeline.Zoom.zoomFilter(startDate, endDate);\n}\n\n$('#reset-button').click(function () {\n  timeline(element);\n  $('[data-toggle=\"popover\"]').popover({\n    'container': '#pf-timeline',\n    'placement': 'top'\n  });\n});\n\n//# sourceURL=webpack://timeline/./demo/script.js?");

/***/ }),

/***/ 1:
/*!******************************!*\
  !*** multi ./demo/script.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! C:\\Dev\\JavaScript\\timeline\\demo\\script.js */\"./demo/script.js\");\n\n\n//# sourceURL=webpack://timeline/multi_./demo/script.js?");

/***/ })

/******/ });
});