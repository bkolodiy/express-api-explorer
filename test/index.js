import express from 'express';
import apiExplorer from '../src';

var mainRouter = express.Router();
var userRouter = express.Router();
var blogRouter = express.Router();
var addressRouter = express.Router();

addressRouter.get('/:addressId', getAddressHandler);

userRouter.post('/login', loginHandler);
userRouter.get('/logout', logoutHandler);

blogRouter.get('/:blogId', getBlogHandler);

userRouter.use('/address', addressRouter);
mainRouter.use('/user', userRouter);
mainRouter.use('/blog', blogRouter);
mainRouter.get('/status', statusHandler);

var app = express();
app.use('/api', mainRouter);

function statusHandler(req, res, next) {
  res.json('logoutHandler')
}

function logoutHandler(req, res, next) {
  res.json('logoutHandler')
}

function loginHandler(req, res, next) {
  res.json('loginHandler')
}

function getBlogHandler(req, res, next) {
  res.json('getBlogHandler')
}

function getAddressHandler(req, res, next) {
  res.json('getAddressHandler')
}

apiExplorer(app, {
  rootPath: '/api'
});

app.listen(8080, '127.0.0.1');