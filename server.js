const express = require('express');
const api = require('./api');
const app = express();
const PORT = 8080;

app.use('/packages',express.static(`${__dirname}/packages`));
app.use('/',express.static(`${__dirname}/build`));

app.get('/listPackages', (req,res)=>{
	res.send(api.listPackages());

});

api.updateAll();
app.listen(PORT,'127.0.0.1',()=>{
	console.error(`Listening on port ${PORT}.`);
});
