/*
 *	Some pretty big warnings about this mess:
 *	It is NOT race condition safe and WILL have problems if multiple 
 *	functions that do the same file IO are called at once.
 *	It is NOT well documented. If you want documentation,
 *	read the code and figure out what it does and submit your
 *	docs as a pull request or wait until I do it.
 *
 *
 * */
const request = require('request-promise');
const parser = require('fast-xml-parser');
const mkdirp = require('mkdirp');
const fs = require('fs');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const Shell = require('node-powershell');
const csv = require('csvtojson');
const config = require('./config.json');
const pp = require('./powerParser');

let fullData = {};
const feeds = config.feeds;

let getData = async () =>{
	for(const feed of feeds){
		let data = await request(`${config.nugetServer}${feed}/Packages`);
		data = parser.parse(data);
		newData = data.feed.entry;
		newData = newData.map(d=>{
			d.properties = JSON.parse(JSON.stringify(d['m:properties']));
			delete d['m:properties'];
			const newObject = {};
			Object.keys(d.properties).forEach(p=>{
				newObject[p.substring(2)] = d.properties[p];
				delete d.properties[p];
			}
			);
			d.properties = newObject;
			d.feed = feed;
		}
		);
		data.feed.entry = data.feed.entry.filter(d=>d.properties.IsLatestVersion);
		let dataObj = {};
		data.feed.entry.forEach(d=>{
			dataObj[d.title] = d;
		});
		fullData = {...dataObj,...fullData};
	}
	const outputFileName = 'output.json';
	const oldData = fs.existsSync(outputFileName)?JSON.parse(fs.readFileSync(outputFileName).toString('utf-8')):null;
	fs.writeFileSync(outputFileName,JSON.stringify(fullData,null,2));
	return {
		oldData,
		newData: fullData
	}

}

let clearTestLogs = ()=>{
	fs.writeFileSync('testLogs.json','[]');
}
let clearTestQueue = ()=>{
	fs.writeFileSync('testQueue.json','[]');
}
let removeAllPackages = ()=>{
	rimraf.sync(`${__dirname}/packages`);
	fullData = {};
}

let getSheet = async()=>{
	let data = await request(config.googleSheet);
	let json = await csv().fromString(data);
	console.log(json);
}

let writeArgs = async (name,version,args,isZip)=>{
		const path = `${__dirname}/packages/${name}/output/tools/chocolateyInstall.ps1`;
		try{
			let ps1 = fs.readFileSync(path).toString('utf-8');
			let modified;
			if(isZip){
				modified = await pp.writeZip(ps1,args);
			} else {
				modified = await pp.writePackage(ps1,args);
			}
			fs.writeFileSync(path,modified);
			fullData[name].properties[isZip?'ZipArgs':'PackageArgs'] = args;
			return {success:true};
		} catch (e) {
			return {success:false,result:e};
		}
}

/*let visitAll = async()=>{
	Object.entries(fullData).forEach(([k,d])=>{
		const name = d.title;
		const path = `${__dirname}/packages/${name}/output/tools/chocolateyInstall.ps1`;
		try {
			let data = fs.readFileSync(path).toString('utf-8');
			let line = data.split('\n').find(n=>n.toLowerCase().includes('url') && n.includes('=') && n.trim()[0] !== '$');
			fullData[k].properties.RealPackage = !!line;
			fullData[k].properties.ZipArgs = pp.readZip(data);
			fullData[k].properties.PackageArgs = pp.readPackage(data);
		} catch(e){
			//i dont care just quit being annoying if it doesnt work lol
			fullData[k].properties.RealPackage = false;
			fullData[k].properties.ZipArgs = {};
			fullData[k].properties.PackageArgs = {};
		}
	});
	fs.writeFileSync('output.json',JSON.stringify(fullData,null,2));
}*/
let visitPackage = async name=>{
	const path = `${__dirname}/packages/${name}/output/tools/chocolateyInstall.ps1`;
	try {
		let data = fs.readFileSync(path).toString('utf-8');
		let line = data.split('\n').find(n=>n.toLowerCase().includes('url') && n.includes('=') && n.trim()[0] !== '$');
		fullData[name].properties.RealPackage = !!line;
		fullData[name].properties.ZipArgs = pp.readZip(data);
		fullData[name].properties.PackageArgs = pp.readPackage(data);
	} catch(e){
		//i dont care just quit being annoying if it doesnt work lol
		fullData[name].properties.RealPackage = false;
		fullData[name].properties.ZipArgs = {};
		fullData[name].properties.PackageArgs = {};
	}
}

let buildPackage = async (name, version)=>{
	const path = `${__dirname}/packages/${name}/output`;
	const oldPackagePath = `${__dirname}/packages/${name}/${name}.${version}.nupkg`;
	if(!fs.existsSync(path)) return {success:false, result:'Package does not exist locally.'};
	try{
		const ps = new Shell({
			executionPolicy: 'Bypass',
			noProfile:true

		});
		ps.addCommand(`cd ${path}`);
		ps.addCommand('choco pack');
		ps.addCommand('Move-Item -Force *.nupkg ..');
		if(fs.existsSync(oldPackagePath)) fs.renameSync(oldPackagePath, oldPackagePath + '.old');
		const result = await ps.invoke();
		ps.dispose();
		const success = fs.existsSync(oldPackagePath);
		if(!success && fs.existsSync(oldPackagePath + '.old')) fs.renameSync(oldPackagePath + '.old', oldPackagePath);
		if(success) addPackageToTestQueue(name,version);
		return {success,result};
	}catch(e){
		return {success:false,result:e.toString()};
		console.error(e);
	}
}

/*Gross race condition causing code (beware)*/
let addPackageToTestQueue = (name,version)=>{
	let queue = getTestQueue();
	queue = queue.filter(d=>d.name !== name);
	queue.push({name,version});
	fs.writeFileSync('testQueue.json',JSON.stringify(queue,null,2));
}

let removeQueueItem = (name,version)=>{
	let queue = getTestQueue();
	queue = queue.filter(d=>!(d.name === name && d.version === version));
	fs.writeFileSync('testQueue.json',JSON.stringify(queue,null,2));
	return {success:true};
}

let getTestQueue = ()=>{
	if(!fs.existsSync('testQueue.json')) return [];
	return JSON.parse(fs.readFileSync('testQueue.json').toString('utf-8'));
}

let receiveAgentReport = (name,success,error,result,hostname)=>{
	const path = `${__dirname}/packages/${name}/`;
	const response = {
		name,
		success,
		error,
		result,
		agent: hostname,
		date: new Date().toString()
	}
	/*If an agent builds for a package we don't have, what??? go away. just go away.*/
	if(!fs.existsSync(path)) return;
	let currentStatus = getTests();
	currentStatus.push(response);
	fs.writeFileSync('testLogs.json',JSON.stringify(currentStatus));
	/* Error means the agent is broken and can't even figure out how to build
	 * so we leave the build in the queue hoping it gets its self together or
	 * another agent is able to build it.*/
	if(error) return;
	/*remove the package from the queue of packages to be tested*/
	let queue = getTestQueue();
	queue = queue.filter(d=>d.name !== name);
	fs.writeFileSync('testQueue.json',JSON.stringify(queue,null,2));
	if(!success) return;
	pushPackage(name);
}

let callDibs = (name,hostname)=>{
	let queue = getTestQueue();
	let success = false;
	queue = queue.map(q=>{
		if(q.name === name && !q.dibs){
			success = true;
			q.dibs = hostname;
		}
		return q;
	});
	//let dependencies = fullData[name].properties.Dependencies;
	//dependencies = dependencies?dependencies.split('|'):[];
	fs.writeFileSync('testQueue.json',JSON.stringify(queue,null,2));
	return {success};


}

let pushPackage = name=>{
	console.log(`Pretending to push package ${name}.`);

}

let getTests = ()=>{
	let data;
	try{
		data = JSON.parse(fs.readFileSync('testLogs.json').toString('utf-8'));
	} catch(e){
		data = [];
	}
	return data;
}

let updatePackage = async (name, version)=>{
	const path = `${__dirname}/packages/${name}/`;
	const updaterName = `${name}-updater.js`;
	if(!fs.existsSync(path)) return {success:false, result:'Package does not exist locally.'};
	try{
		const ps = new Shell({
			executionPolicy: 'Bypass',
			noProfile:true

		});
		ps.addCommand(`cd ${path}`);
		ps.addCommand(`node ${updaterName}`);
		const result = await ps.invoke();
		ps.dispose();
		return {success:true,result};
	}catch(e){
		return {success:false,result:e.toString()};
		console.error(e);
	}

}
let updateUpdater = async (name, version, code)=>{
	const path = `${__dirname}/packages/${name}/`;
	const updaterName = `${name}-updater.js`;
	if(!fs.existsSync(path)) return {success:false, result:'Package does not exist locally.'};
	fs.writeFileSync(`${path}/${updaterName}`,code)
	// a dumb thing to assume
	return { success: true, result: 'Updated!'};
}


let updateAll = async ()=>{
	let list = listPackages();
	return await Promise.all(list.map(async p=>{
		const result = await updatePackage(p.name,p.version);
		return {...p,...result};
	}));
}
let buildAll = async ()=>{
	let list = listPackages();
	return await Promise.all(list.map(async p=>{
		const result = await buildPackage(p.name,p.version);
		return {...p,...result};
	}));
}

let listPackages = (extraInfo)=>{
	let newList = [];
	Object.entries(fullData).forEach(([k,d])=>{
		const packageInfo = {
			name: d.title,
			version: d.properties.Version,
			feed: d.feed
		}
		if(extraInfo){ 
			packageInfo.zipArgs = d.properties.ZipArgs;
			packageInfo.packageArgs = d.properties.PackageArgs;
		}
		newList.push(packageInfo);
	});
	return newList;
}

let forceFetchPackage = async(name, version)=>{
	const path = `${__dirname}/packages/${name}/`;
	if(!fs.existsSync(path)) return {success:false};
	console.log(`Fetching ${name} version ${version}.`);
	await fetchPackage(name,version);
	return {success:true};

}

let fetchPackage = async (name,version)=>{
	const pkgName = `${name}.${version}`; 
	const path = `packages/${name}`;
	const outputPath = path + '/output';
	const zipPath = `${path}/${pkgName}.nupkg`;
	const feed = fullData[name].feed;
	mkdirp.sync(path);
	fs.copyFileSync('./template.js', `${path}/${name}-updater.js`);
	rimraf.sync(outputPath);
	mkdirp.sync(outputPath);
	const options = {
		url: `${config.nugetServer}${feed}/package/${name}/${version}`,
		encoding: null
	}
	let data = await request(options);
	fs.writeFileSync(zipPath,data);
	(new AdmZip(data)).extractAllTo(outputPath,true);
	rimraf.sync(outputPath + '/_rels');
	let nuspecPath = `${outputPath}/${name}.nuspec`;
	let nuspec = fs.readFileSync(nuspecPath).toString('utf-8');
	nuspec = nuspec.split('\n').filter(l=>!l.includes('<serviceable>')).join('');
	fs.writeFileSync(nuspecPath,nuspec);
	await visitPackage(name);
}



let fetchAll = async force=>{ 
	await getData().then(async res=>{
		let newData = res.newData;
		let oldData = res.oldData;
		//console.log(res.map(r=>r.title).filter((r,i,arr)=>arr.indexOf(r) === i));
		await Promise.all(Object.entries(newData).map(async ([k,d])=>{
			const name = d.title;
			const version = d.properties.Version
			const path = `packages/${name}`;
			let localExists = fs.existsSync(path);
			let oldVersion = Object.entries(oldData).find(([k,o])=>o.title === name && o.properties.Version === version)[1];
			let hashDiffers = !oldVersion || oldVersion.properties.PackageHash !== d.properties.PackageHash || force;
			if(!localExists || hashDiffers){
				console.log(`Fetching ${name} version ${version}.`);
				await fetchPackage(name,version);
			} else {
				await visitPackage(name);
			}
		}));
		//visitAll();

	}).catch(e=>{
		console.error(e);
	});
}

module.exports = {
	fetchAll,
	fetchPackage,
	updatePackage,
	forceFetchPackage,
	listPackages,
	buildPackage,
	updateAll,
	buildAll,
	updateUpdater,
	getTestQueue,
	receiveAgentReport,
	callDibs,
	getTests,
	clearTestLogs,
	clearTestQueue,
	removeAllPackages,
	removeQueueItem,
	writeArgs
}
