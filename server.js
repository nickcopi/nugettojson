const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api');
const packageSchedule = require('./packageSchedule');
const app = express();
const PORT = 8080;

app.use(bodyParser.json({limit:'50mb', extended:true}));
app.use('/packages',express.static(`${__dirname}/packages`));
app.use('/',express.static(`${__dirname}/build`));


app.get('/listPackages', (req,res)=>{
	res.send(api.listPackages());

});
app.get('/getTestQueue', (req,res)=>{
	res.send(api.getTestQueue());

});

app.post('/agentReport',(req,res)=>{
	if(req.body.name && req.body.result){
		api.receiveAgentReport(req.body.name,req.body.success,req.body.error,req.body.result);
		return res.send('Ok');
	} else {
		return res.send('Bad');
	}
});

app.post('/agentDibs',(req,res)=>{
	if(req.body.name){
		return res.send(api.callDibs(req.body.name));
	} else {
		return res.send('Bad');
	}
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
packageSchedule();
app.listen(PORT,'127.0.0.1',()=>{
	console.error(`Listening on port ${PORT}.`);
});
