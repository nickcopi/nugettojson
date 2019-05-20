const express = require('express');
const api = require('./api');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use('/packages',express.static(`${__dirname}/packages`));
app.use('/',express.static(`${__dirname}/build`));

app.get('/listPackages', (req,res)=>{
	res.send(api.listPackages());

});

app.get('/updateAll', async (req,res)=>{
	const report = await api.updateAll();
	res.send(report);
});
app.get('/buildAll', async (req,res)=>{
	const report = await api.buildAll();
	res.send(report);
});

app.post('/buildPackage', async (req,res)=>{
	
	if(req.body.name && req.body.version){
		res.send(await api.buildPackage(req.body.name, req.body.version));
	} else {
		res.send({success:false,result:'Invalid request'});
	}

});
app.post('/runUpdatePackage', async (req,res)=>{
	
	if(req.body.name && req.body.version){
		res.send(await api.updatePackage(req.body.name, req.body.version));
	} else {
		res.send({success:false,result:'Invalid request'});
	}

});
app.post('/updateUpdater', async (req,res)=>{
	
	if(req.body.name && req.body.version && req.body.code){
		res.send(await api.updateUpdater(req.body.name, req.body.version, req.body.code));
	} else {
		res.send({success:false,result:'Invalid request'});
	}

});
app.post('/fetchPackage', async (req,res)=>{
	
	if(req.body.name && req.body.version){
		res.send(await api.forceFetchPackage(req.body.name, req.body.version));
	} else {
		res.send({success:false,result:'Invalid request'});
	}

});

api.fetchAll();
app.listen(PORT,'127.0.0.1',()=>{
	console.error(`Listening on port ${PORT}.`);
});
