import path from 'path';
import express from 'express';

let swaggerConfigs;
let ApiName = 'API NAME HERE'

/**
 * Main Entry Code
 * Parse express routers and mount swagger api explorer
 * on express app.
 *
 * @param app {Object} Express instance
 * @param options {Object} Root api path
 */
module.exports = (app, options = {}) => {
  console.log('--------------------------------------')
  const {
    rootPath = null,
    explorerPath = '/explorer',
    ApiName
  } = options;

  const routes = getRootApiRouter(app, rootPath);

  const apiRouters = [];
  
  routes.forEach(item => {
    apiRouters.push(...item.handle.stack
    .filter(router => !_isMiddleware(router))
    .map(router => getApiRouters(router)));
  })

  console.log("apiRouters", apiRouters)
  swaggerConfigs = getSwaggerConfigs(routes, apiRouters);

  app.get(explorerPath, renderExplorer);
  app.get(`/config`, configsHandler);

  app.use(`${explorerPath}`, express.static(path.join(__dirname, '../page')));
  console.log('--------------------------------------')
}

/**
 * Find root api router
 *
 * @param app {Object} Express instance
 * @param apiPath {String} Root api path
 * @returns rootRouter {Object} Express router layer
 */
function getRootApiRouter(app, apiPath) {
  if(apiPath) {
    return app._router.stack.filter(
      stack => stack.regexp.test(apiPath) && stack.name === 'router'
    );
  } else {

    return app._router.stack.filter(
      stack => stack.name === 'router'
    );

    let tmpRouter =  new express.Router();
    
    const routers = app._router.stack.forEach(r => {
      if (r => r.name === 'router'){
        tmpRouter.use('/api', r.handle);
      }
    });
    console.log(tmpRouter);
    return tmpRouter.stack.find(
      stack => stack.regexp.test('/api') && stack.name === 'router'
    )
  }  
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

  // prevent middleware function to search child route
  if (!_isEndPointHandler(parentRouter)) {
    const stacks = parentRouter.handle.stack;

    for (const stack of stacks) {
      let childRouters = getApiRouters(stack);
      
      childRouters = childRouters.map(childRouter => ({
          ...childRouter,
          path: _getPath(parentRouter.regexp) + childRouter.path
        })
      );

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
  console.log(`Handler: ${JSON.stringify(router, null, 2,)}`)
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
  let result = regexp.toString()
    // remove /path regexp prefix
    .replace(/^\/\^\\/, '')
    // remove /path regexp postfix
    .replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, '')
    .replace(/\/\?\(\?=\\\/\|\$\)\/i/, '');
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
  res.sendFile(path.join(__dirname, '../page/index.html'));
}

function configsHandler(req, res, next) {
  res.json(swaggerConfigs);
}

function getSwaggerConfigs(mainApiRouter, apiRouters) {
  const basePath = '/';
  const tags = []
  const paths = {}
  mainApiRouter.forEach(router => {
    let apiRoutes = router.handle.stack
      .filter(router => !_isMiddleware(router))
      .map(router => getApiRouters(router));
    let path = _getPath(router.regexp);
    

    tags.push(...generateTags(apiRoutes));
    if(path) tags.push({name: path.split('/').pop(), description: ""});
    Object.assign(paths, generatePaths(apiRoutes, path));    
  })
  
  return {
    info: {
      version: "v1",
      title: ApiName
    },
    basePath,
    tags,
    paths
  }
}

function generatePaths(apiRouters, basePath) {
  const routes = {};

  for (const apiRouter of apiRouters) {
    for (const route of apiRouter) {
      const tagName = apiRouter[0].path.split('/')[1];
      const tags = [tagName];

      if(basePath) {
        tags.push(basePath.split('/')[1]);
      }

      const parameters = getRouteParameters(route);

      routes[basePath + route.path] = {
        ...routes[basePath + route.path],
        [route.method]: {
          tags,
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