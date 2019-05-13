const request = require('request-promise');
const parser = require('fast-xml-parser');
const mkdirp = require('mkdirp');
const fs = require('fs');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');

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
	return {
		oldData,
		newData: data.feed.entry
	}

}

let fetchPackage = async (name,version)=>{
	const pkgName = `${name}_${version}`; 
	const path = `packages/${pkgName}`;
	const outputPath = path + '/output';
	const zipPath = `${path}/${pkgName}.nupkg`;
	mkdirp.sync(path);
	rimraf.sync(outputPath);
	mkdirp.sync(outputPath);
	const options = {
		url: `https://choco.lcc.ts.vcu.edu/nuget/LCC/package/${name}/${version}`,
		encoding: null
	}
	let data = await request(options);
	fs.writeFileSync(zipPath,data);
	(new AdmZip(data)).extractAllTo(outputPath,true);
	debugger;
}




let updateAll = ()=>{ 
	getData().then(res=>{
		let newData = res.newData;
		let oldData = res.oldData;
		//console.log(res.map(r=>r.title).filter((r,i,arr)=>arr.indexOf(r) === i));
		newData.forEach(d=>{
			const name = d.title;
			const version = d.properties.Version
			const path = `packages/${name}_${version}`;
			let localExists = fs.existsSync(path);
			let oldVersion = oldData.find(o=>o.title === name && o.properties.Version === version);
			let hashDiffers = !oldVersion || oldVersion.properties.PackageHash !== d.properties.PackageHash;
			if(!localExists || hashDiffers){
				console.log(`Grabbing ${name} version ${version}.`);
				fetchPackage(name,version);
			}
			debugger;

		});

	}).catch(e=>{
		console.error(e);
	});
}

module.exports = {
	updateAll,
	fetchPackage
}
