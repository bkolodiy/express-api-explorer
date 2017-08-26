import path from 'path';
import express from 'express';

let swaggerConfigs;

/**
 * Main Entry Code
 * Parse express routers and mount swagger api explorer
 * on express app.
 *
 * @param app {Object} Express instance
 * @param options {Object} Root api path
 */
module.exports = (app, options) => {
  const {
    rootPath = '/api',
    explorerPath = '/explorer'
  } = options;

  const rootApiRouter = getRootApiRouter(app, rootPath);

  const apiRouters = rootApiRouter.handle.stack.map(router => getApiRouters(router));

  swaggerConfigs = getSwaggerConfigs(rootApiRouter, apiRouters);

  app.get(explorerPath, renderExplorer);
  app.get(`${explorerPath}/config`, configsHandler);

  app.use('/explorer', express.static(path.join(__dirname, '../page')));
}

/**
 * Find root api router
 *
 * @param app {Object} Express instance
 * @param apiPath {String} Root api path
 * @returns rootRouter {Object} Express router layer
 */
function getRootApiRouter(app, apiPath) {
  return app._router.stack.find(
    stack => stack.regexp.test(apiPath) && stack.name === 'router'
  );
}

/**
 * Recursion function for search all end point router handler
 *
 * @param apiRouter
 * @returns {Array}
 */
function getApiRouters(apiRouter) {
  let result = [];
  const parentRouter = apiRouter;

  if (!_isEndPointHandler(parentRouter)) {
    // prevent middleware function to search route
    const stacks = parentRouter.handle.stack || [];

    for (const stack of stacks) {
      let childRouters = getApiRouters(stack);

      childRouters = childRouters.map(childRouter => ({
        ...childRouter,
        path: _getPath(parentRouter.regexp) + childRouter.path
      }));

      result = [...result, ...childRouters];
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
  const [handler = {}] = router.route.stack;
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
  return regexp.toString()
  // remove /path regexp prefix
    .replace(/^\/\^\\/, '')
    // remove /path regexp postfix
    .replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, '');
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
  res.sendFile(path.join(__dirname, '../page/index.html'));
}

function configsHandler(req, res, next) {
  res.json(swaggerConfigs);
}

function getSwaggerConfigs(mainApiRouter, apiRouters) {
  const basePath = _getPath(mainApiRouter.regexp);
  const tags = generateTags(apiRouters);
  const paths = generatePaths(apiRouters);

  return {
    basePath,
    tags,
    paths
  }
}

function generatePaths(apiRouters) {
  const routes = {};

  for (const apiRouter of apiRouters) {
    for (const route of apiRouter) {
      const tagName = apiRouter[0].path.split('/')[1];

      const parameters = getRouteParameters(route);

      routes[route.path] = {
        ...routes[route.path],
        [route.method]: {
          tags: [tagName],
          summary: route.name,
          parameters
        }
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
  }]
}

function generateTags(apiRouters) {
  return apiRouters.map(([firstRouter]) => {
    return {
      name: firstRouter.path.split('/')[1],
      description: ''
    }
  });
}