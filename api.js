const request = require('request-promise');
const parser = require('fast-xml-parser');
const mkdirp = require('mkdirp');
const fs = require('fs');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const Shell = require('node-powershell');

let fullData;

let getData = async () =>{
	let data = await request('https://choco.lcc.ts.vcu.edu/nuget/LCC/Packages');
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
	}
	);
	const outputFileName = 'output.json';
	const oldData = fs.existsSync(outputFileName)?JSON.parse(fs.readFileSync(outputFileName).toString('utf-8')):null;
	fs.writeFileSync(outputFileName,JSON.stringify(data.feed.entry,null,2));
	fullData = data.feed.entry;
	return {
		oldData,
		newData: data.feed.entry
	}

}

let buildPackage = async (name, version)=>{
	const path = `${__dirname}/packages/${name}.${version}/output`;
	const oldPackagePath = `${__dirname}/packages/${name}.${version}/${name}.${version}.nupkg`;
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
		return {success,result};
	}catch(e){
		return {success:false,result:e.toString()};
		console.error(e);
	}

}

let updatePackage = async (name, version)=>{
	const path = `${__dirname}/packages/${name}.${version}/`;
	const updaterName = `${name}.${version}-updater.js`;
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

let listPackages = ()=>{
	let newList = [];
	fullData.forEach(d=>{
		newList.push({
			name: d.title,
			version: d.properties.Version
		});
	});
	return newList;
}

let forceFetchPackage = async(name, version)=>{
	const path = `${__dirname}/packages/${name}.${version}/`;
	if(!fs.existsSync(path)) return {success:false};
	console.log(`Fetching ${name} version ${version}.`);
	await fetchPackage(name,version);
	return {success:true};
	
}

let fetchPackage = async (name,version)=>{
	const pkgName = `${name}.${version}`; 
	const path = `packages/${pkgName}`;
	const outputPath = path + '/output';
	const zipPath = `${path}/${pkgName}.nupkg`;
	mkdirp.sync(path);
	fs.copyFileSync('./template.js', `${path}/${pkgName}-updater.js`);
	rimraf.sync(outputPath);
	mkdirp.sync(outputPath);
	const options = {
		url: `https://choco.lcc.ts.vcu.edu/nuget/LCC/package/${name}/${version}`,
		encoding: null
	}
	let data = await request(options);
	fs.writeFileSync(zipPath,data);
	(new AdmZip(data)).extractAllTo(outputPath,true);
	rimraf.sync(outputPath + '/_rels');
	debugger;
}



let fetchAll = ()=>{ 
	getData().then(res=>{
		let newData = res.newData;
		let oldData = res.oldData;
		//console.log(res.map(r=>r.title).filter((r,i,arr)=>arr.indexOf(r) === i));
		newData.forEach(d=>{
			const name = d.title;
			const version = d.properties.Version
			const path = `packages/${name}.${version}`;
			let localExists = fs.existsSync(path);
			let oldVersion = oldData.find(o=>o.title === name && o.properties.Version === version);
			let hashDiffers = !oldVersion || oldVersion.properties.PackageHash !== d.properties.PackageHash;
			if(!localExists || hashDiffers){
				console.log(`Fetching ${name} version ${version}.`);
				fetchPackage(name,version);
			}
			debugger;

		});

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
	buildPackage
}
