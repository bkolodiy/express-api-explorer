module.exports =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = __webpack_require__(1);

var _path2 = _interopRequireDefault(_path);

var _express = __webpack_require__(2);

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var swaggerConfigs = void 0;
var ApiName = 'API NAME HERE';

/**
 * Main Entry Code
 * Parse express routers and mount swagger api explorer
 * on express app.
 *
 * @param app {Object} Express instance
 * @param options {Object} Root api path
 */
module.exports = function (app) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  console.log('--------------------------------------');
  var _options$rootPath = options.rootPath,
      rootPath = _options$rootPath === undefined ? null : _options$rootPath,
      _options$explorerPath = options.explorerPath,
      explorerPath = _options$explorerPath === undefined ? '/explorer' : _options$explorerPath,
      ApiName = options.ApiName;


  var routes = getRootApiRouter(app, rootPath);

  var apiRouters = [];

  routes.forEach(function (item) {
    apiRouters.push.apply(apiRouters, _toConsumableArray(item.handle.stack.filter(function (router) {
      return !_isMiddleware(router);
    }).map(function (router) {
      return getApiRouters(router);
    })));
  });

  console.log("apiRouters", apiRouters);
  swaggerConfigs = getSwaggerConfigs(routes, apiRouters);

  app.get(explorerPath, renderExplorer);
  app.get('/config', configsHandler);

  app.use('' + explorerPath, _express2.default.static(_path2.default.join(__dirname, '../page')));
  console.log('--------------------------------------');
};

/**
 * Find root api router
 *
 * @param app {Object} Express instance
 * @param apiPath {String} Root api path
 * @returns rootRouter {Object} Express router layer
 */
function getRootApiRouter(app, apiPath) {
  if (apiPath) {
    return app._router.stack.filter(function (stack) {
      return stack.regexp.test(apiPath) && stack.name === 'router';
    });
  } else {

    return app._router.stack.filter(function (stack) {
      return stack.name === 'router';
    });

    var tmpRouter = new _express2.default.Router();

    var routers = app._router.stack.forEach(function (r) {
      if (function (r) {
        return r.name === 'router';
      }) {
        tmpRouter.use('/api', r.handle);
      }
    });
    console.log(tmpRouter);
    return tmpRouter.stack.find(function (stack) {
      return stack.regexp.test('/api') && stack.name === 'router';
    });
  }
}

/**
 * Recursion function for search all end point router handler
 *
 * @param apiRouter
 * @returns {Array}
 */
function getApiRouters(apiRouter) {
  var result = [];
  var parentRouter = apiRouter;

  // prevent middleware function to search child route
  if (!_isEndPointHandler(parentRouter)) {
    var stacks = parentRouter.handle.stack;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = stacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var stack = _step.value;

        var childRouters = getApiRouters(stack);

        childRouters = childRouters.map(function (childRouter) {
          return _extends({}, childRouter, {
            path: _getPath(parentRouter.regexp) + childRouter.path
          });
        });

        result = [].concat(_toConsumableArray(result), _toConsumableArray(childRouters));
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } else {
    result.push(getHandlerInfo(parentRouter));
  }

  return result;
}

/**
 * Return end point router handler info
 *
 * @param router
 * @returns {{path, method, name, handle: Function}}
 */
function getHandlerInfo(router) {
  var _router$route$stack = _slicedToArray(router.route.stack, 1),
      _router$route$stack$ = _router$route$stack[0],
      handler = _router$route$stack$ === undefined ? {} : _router$route$stack$;

  console.log('Handler: ' + JSON.stringify(router, null, 2));
  return {
    path: router.route.path,
    method: handler.method,
    name: handler.name,
    handle: handler.handle
  };
}

/**
 * Remove regexp prefix and postfix
 * Input regex: /^\\/pathName\\/?(?=\\/|$)/i
 * Output string: /pathName
 *
 * @param regexp
 * @returns {string}
 * @private
 */
function _getPath(regexp) {
  var result = regexp.toString()
  // remove /path regexp prefix
  .replace(/^\/\^\\/, '')
  // remove /path regexp postfix
  .replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, '').replace(/\/\?\(\?=\\\/\|\$\)\/i/, '');
  return result;
}

/**
 * Don't have route prototype and the name is not 'router'
 * Also don't have stack => middleware
 *
 * @param router
 * @returns {boolean}
 * @private
 */
function _isMiddleware(router) {
  return !_isEndPointHandler(router) && !router.handle.stack;
}

/**
 * Check is end point router handler
 *
 * @param router
 * @returns {boolean|*}
 * @private
 */
function _isEndPointHandler(router) {
  return router.name !== 'router' && router.route;
}

/**
 * Mount api explorer page
 *
 * @param req
 * @param res
 * @param next
 */
function renderExplorer(req, res, next) {
  res.sendFile(_path2.default.join(__dirname, '../page/index.html'));
}

function configsHandler(req, res, next) {
  res.json(swaggerConfigs);
}

function getSwaggerConfigs(mainApiRouter, apiRouters) {
  var basePath = '/';
  var tags = [];
  var paths = {};
  mainApiRouter.forEach(function (router) {
    var apiRoutes = router.handle.stack.filter(function (router) {
      return !_isMiddleware(router);
    }).map(function (router) {
      return getApiRouters(router);
    });
    var path = _getPath(router.regexp);

    tags.push.apply(tags, _toConsumableArray(generateTags(apiRoutes)));
    if (path) tags.push({ name: path.split('/').pop(), description: "" });
    Object.assign(paths, generatePaths(apiRoutes, path));
  });

  return {
    info: {
      version: "v1",
      title: ApiName
    },
    basePath: basePath,
    tags: tags,
    paths: paths
  };
}

function generatePaths(apiRouters, basePath) {
  var routes = {};

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = apiRouters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var apiRouter = _step2.value;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = apiRouter[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var route = _step3.value;

          var tagName = apiRouter[0].path.split('/')[1];
          var tags = [tagName];

          if (basePath) {
            tags.push(basePath.split('/')[1]);
          }

          var parameters = getRouteParameters(route);

          routes[basePath + route.path] = _extends({}, routes[basePath + route.path], _defineProperty({}, route.method, {
            tags: tags,
            summary: route.name,
            parameters: parameters
          }));
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return routes;
}

function getRouteParameters(route) {
  return [{
    in: "body",
    name: "body",
    description: "Pet object that needs to be added to the store",
    required: true,
    schema: {}
  }];
}

function generateTags(apiRouters) {
  return apiRouters.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1),
        firstRouter = _ref2[0];

    return {
      name: firstRouter.path.split('/')[1],
      description: ''
    };
  });
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ })
/******/ ]);