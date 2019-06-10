const parser = require('fast-xml-parser');
/*ps1 stuff*/
let readObj = (ps1,header)=>{
	let ripping = false;
	let zip = {};
	debugger;
	ps1.split('\n').forEach(l=>{
		if(l.includes(header)) return ripping = true;
		if(ripping){
			if(l.trim() === '}') return ripping = false;
			let split = l.split('=');
			let leftHand = split.shift().trim();
			let rightHand = split.join('').trim();
			zip[leftHand] = rightHand;
		}

	});
	return zip;
}
let writeObj = (ps1,header,data)=>{
	let ripping = false;
	let start = 0;
	let end = 0;
	let split = ps1.split('\n');
	let done = false;
	let toWrite = split;
	split.forEach((l,i)=>{
		if(done) return;
		if(l.includes(header)){
			ripping = true;
			start = i+1;
			end = i;
			return;
		}
		if(ripping){
			end++;
			if(l.trim() === '}'){
				toWrite = [...split.slice(0,start), ...data.split('\n'), ...split.slice(end)];
				done = true;
				return ripping = false;
			}
		}

	});
	return toWrite.join('\n');
}

let formatObj = (data)=>{
	let str = "";
	Object.entries(data).forEach(([k,v])=>{
		str += `${k} = ${v}\r\n`;
	});
	return str.substring(0,str.length-1);
}

let writeZip = async (ps1,data)=>{
	return writeObj(ps1,'$zipArgs = @{',formatObj(data));
}

let writePackage = async (ps1,data)=>{
	return writeObj(ps1,'$packageArgs = @{',formatObj(data));
}

let readZip = (ps1)=>{
	return readObj(ps1,'$zipArgs = @{');
}
let readPackage = (ps1)=>{
	return readObj(ps1,'$packageArgs = @{');
}
/*nuspec stuff*/
let readNuspec = nuspec=>{
	let parsed = parser.parse(nuspec);
	Object.entries(parsed.package.metadata).forEach(([k,v])=>{
		if(typeof(v) === 'object'){
			delete parsed.package.metadata[k];
		}
	});
	return parsed.package.metadata;
}

let writeNuspec = (nuspec,args)=>{
	//console.log(xmlify(args));
	let toAdd = xmlify(args);
	let parsed = parser.parse(nuspec).package.metadata;
	Object.entries(parsed).forEach(([k,v])=>{
		if(typeof(v) !== 'object'){
			delete parsed[k];
		}
	});
	let newSplit = [];
	let ripping = false;
	let split = nuspec.split('\r');
	let currentWhite;
	split.forEach(l=>{
		newSplit.push(l);
		if(l.includes('<metadata>')) return ripping = true;	
		if(l.includes('</metadata>')) {
			ripping = false;	
			newSplit.pop();
			newSplit = newSplit.concat(toAdd);
			newSplit.push(l);
		}
		if(ripping){
			if(currentWhite){
				if(l.includes(`</${currentWhite}>`)) currentWhite = null;
				return;	
			}
			let found = false;
			Object.keys(parsed).forEach(m=>{
				if(found) return;
				found = l.includes(`<${m}>`)?m:null;
			});
			if(!found) newSplit.pop();
			else {
				if(!l.includes(`</${found}>`)) currentWhite = found;
			}
		}
	});
	return newSplit.join('\r');
	
}

let xmlify = obj => Object.entries(obj).map(([k,v])=>`<${k}>${v}</${k}>`);

module.exports={
	readZip,
	readPackage,
	writeZip,
	writePackage,
	readNuspec,
	writeNuspec
}
