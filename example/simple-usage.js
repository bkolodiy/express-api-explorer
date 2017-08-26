const express = require('express');
const apiExplorer = require('../dist');

const app = express();
const apiRouter = express.Router();
const user = { name: 'Tony' };

apiRouter.get('/user', (req, res) => res.json(user));

app.use('/api', apiRouter);

// use api explorer, tell explorer which is api rest.
apiExplorer(app, {
  rootPath: '/api'
});

app.listen(8000);
