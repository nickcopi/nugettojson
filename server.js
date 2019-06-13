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
	res.send(api.listPackages(true));

});
app.get('/getTestQueue', (req,res)=>{
	res.send(api.getTestQueue());

});
app.get('/getTests', (req,res)=>{
	res.send(api.getTests());

});

app.post('/agentReport',(req,res)=>{
	if(req.body.name && req.body.result && req.body.hostname){
		api.receiveAgentReport(req.body.name,req.body.success,req.body.error,req.body.result,req.body.hostname);
		return res.send('Ok');
	} else {
		return res.send('Bad');
	}
});

app.post('/agentDibs',(req,res)=>{
	if(req.body.name && req.body.hostname){
		return res.send(api.callDibs(req.body.name, req.body.hostname));
	} else {
		return res.send('Bad');
	}
});

app.post('/updateAll', async (req,res)=>{
	try{
		api.updateAll();
		return res.send({attempted:true});
	} catch(e){
		console.log(e);
		return res.send({attempted:false});
	}
});
app.post('/buildAll', async (req,res)=>{
	try{
		api.buildAll();
		return res.send({attempted:true});
	} catch(e){
		return res.send({attempted:false});
	}
});
app.post('/fetchAll', async (req,res)=>{
	try{
		api.fetchAll(true);
		return res.send({attempted:true});
	} catch(e){
		return res.send({attempted:false});
	}
});
app.post('/clearTestLogs', async (req,res)=>{
	try{
		api.clearTestLogs();
		return res.send({attempted:true});
	} catch(e){
		return res.send({attempted:false});
	}
});
app.post('/clearTestQueue', async (req,res)=>{
	try{
		api.clearTestQueue();
		return res.send({attempted:true});
	} catch(e){
		return res.send({attempted:false});
	}
});
app.post('/removeQueueItem', async (req,res)=>{
	if(req.body.name && req.body.version){
		res.send(await api.removeQueueItem(req.body.name, req.body.version));
	} else {
		res.send({success:false,result:'Invalid request'});
	}
});
app.post('/removeAllPackages', async (req,res)=>{
	try{
		api.removeAllPackages();
		return res.send({attempted:true});
	} catch(e){
		return res.send({attempted:false});
	}
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
app.post('/writeNuspec', async (req,res)=>{
	if(req.body.name && req.body.version && req.body.args){
		res.send(await api.writeNuspec(req.body.name, req.body.version, req.body.args));
	} else {
		res.send({success:false,result:'Invalid request'});
	}
});
app.post('/writeZip', async (req,res)=>{
	if(req.body.name && req.body.version && req.body.args){
		res.send(await api.writeArgs(req.body.name, req.body.version, req.body.args, true));
	} else {
		res.send({success:false,result:'Invalid request'});
	}
});
app.post('/writePackage', async (req,res)=>{
	if(req.body.name && req.body.version && req.body.args){
		res.send(await api.writeArgs(req.body.name, req.body.version, req.body.args, false));
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

let init = async ()=>{
	await api.fetchAll();
	packageSchedule();
	app.listen(PORT,'0.0.0.0',()=>{
		console.error(`Listening on port ${PORT}.`);
	});
}
init();
