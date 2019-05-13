const request = require('request-promise');
const parser = require('fast-xml-parser');
const fs = require('fs');

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

	fs.writeFileSync('output.json',JSON.stringify(data,null,2));
	return data.feed.entry;

}
getData().then(res=>{
	console.log(res.map(r=>r.title).filter((r,i,arr)=>arr.indexOf(r) === i));
}).catch(e=>{
	console.error(e);
});
