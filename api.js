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

let fullData = {};
const feeds = ['LCC','VCU'];

let getData = async () =>{
	for(const feed of feeds){
		let data = await request(`https://choco.lcc.ts.vcu.edu/nuget/${feed}/Packages`);
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

let getSheet = async()=>{
	let data = await request('https://docs.google.com/spreadsheets/d/e/2PACX-1vR45pxpayXawpYaFR1Fg1loV5mjon8hX9Il46C8TEYas4UTxoBuZ08JKZMam-5W_rUxQUu0N4_PTWzi/pub?output=csv');
	let json = await csv().fromString(data);
	console.log(json);
}

let visitAll = async()=>{
	Object.entries(fullData).forEach(([k,d])=>{
		const name = d.title;
		const path = `${__dirname}/packages/${name}/output/tools/chocolateyInstall.ps1`;
		try {
			let data = fs.readFileSync(path).toString('utf-8');
			let line = data.split('\n').find(n=>n.toLowerCase().includes('url') && n.includes('=') && n.trim()[0] !== '$');
			fullData[k].properties.RealPackage = !!line;
		} catch(e){
			//i dont care just quit being annoying if it doesnt work lol
			fullData[k].properties.RealPackage = false;
		}
	});
	fs.writeFileSync('output.json',JSON.stringify(fullData,null,2));
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
		const success = fs.existsSync(oldPackagePath);
		if(!success && fs.existsSync(oldPackagePath + '.old')) fs.renameSync(oldPackagePath + '.old', oldPackagePath);
		if(success) addPackageToTestQueue(name);
		return {success,result};
	}catch(e){
		return {success:false,result:e.toString()};
		console.error(e);
	}
}

/*Gross race condition causing code (beware)*/
let addPackageToTestQueue = name=>{
	const queue = getTestQueue();
	if(queue.find(d=>d === name)) return;
	queue.push(name);
	fs.writeFileSync('testQueue.json',JSON.stringify(queue,null,2));
}

let getTestQueue = ()=>{
	if(!fs.existsSync('testQueue.json')) return [];
	return JSON.parse(fs.readFileSync('testQueue.json').toString('utf-8'));
}

let receiveAgentReport = (name,success,error,result)=>{
	const logString = `${name} at ${new Date().toString()}: `;
	const path = `${__dirname}/packages/${name}/`;
	/*If an agent builds for a package we don't have, what??? go away. just go away.*/
	if(!fs.existsSync(path)) return;
	if(error){
		/* Error means the agent is broken and can't even figure out how to build
		 * so we leave the build in the queue hoping it gets its self together or
		 * another agent is able to build it.*/
		fs.appendFileSync('tests.log', logString + 'agent had error: ' + error + '\n');
		return;
	}
	/*remove the package from the queue of packages to be tested*/
	let queue = getTestQueue();
	queue = queue.filter(d=>d !== name);
	fs.writeFileSync('testQueue.json',JSON.stringify(queue,null,2));
	if(!success){
		fs.appendFileSync('tests.log', logString + 'build/tests failed: ' + result + '\n');
		return;
	}
	fs.appendFileSync('tests.log', logString + 'Pushing package to proget.' + '\n');
	pushPackage(name);
}

let pushPackage = name=>{
	console.log(`Pretending to push package ${name}.`);

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

let listPackages = ()=>{
	let newList = [];
	Object.entries(fullData).forEach(([k,d])=>{
		newList.push({
			name: d.title,
			version: d.properties.Version,
			feed: d.feed
		});
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
		url: `https://choco.lcc.ts.vcu.edu/nuget/${feed}/package/${name}/${version}`,
		encoding: null
	}
	let data = await request(options);
	fs.writeFileSync(zipPath,data);
	(new AdmZip(data)).extractAllTo(outputPath,true);
	rimraf.sync(outputPath + '/_rels');
}



let fetchAll = ()=>{ 
	getData().then(res=>{
		let newData = res.newData;
		let oldData = res.oldData;
		//console.log(res.map(r=>r.title).filter((r,i,arr)=>arr.indexOf(r) === i));
		Object.entries(newData).forEach(([k,d])=>{
			const name = d.title;
			const version = d.properties.Version
			const path = `packages/${name}`;
			let localExists = fs.existsSync(path);
			let oldVersion = Object.entries(oldData).find(([k,o])=>o.title === name && o.properties.Version === version)[1];
			let hashDiffers = !oldVersion || oldVersion.properties.PackageHash !== d.properties.PackageHash;
			if(!localExists || hashDiffers){
				console.log(`Fetching ${name} version ${version}.`);
				fetchPackage(name,version);
			}
		});
		visitAll();

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
	receiveAgentReport
}
