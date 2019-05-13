const express = require('express');
const api = require('./api');
const app = express();
const PORT = 8080;

app.use('/static',express.static(`${__dirname}/packages`));


api.updateAll();
app.listen(PORT,e=>{
	console.error(e);
});
