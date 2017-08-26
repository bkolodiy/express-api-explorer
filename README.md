# express-api-explorer

_Still working, just use for review api now. **WIP** :construction:_

## Installation
- `npm install --save express-api-explorer`

## Example

```javascript
const express = require('express');
const apiExplorer = require('express-api-explorer');

const app = express();
const apiRouter = express.Router();
const user = { name: 'Tony' };

apiRouter.use('/user', (req, res) => res.json(user));

app.use('/api', apiRouter);

// use api explorer, tell explorer which is api rest.
apiExplorer(app, {rootPath: '/api'});

app.listen(8000);
```