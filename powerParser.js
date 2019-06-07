
let readObj = (ps1,header)=>{
	let ripping = false;
	let zip = {};
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
	return toWrite.join('');
}

let formatObj = (data)=>{
	let str = "";
	Object.entries(data).forEach(([k,v])=>{
		str += `${k} = ${v}\r\n`;
	});
	return str;
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
module.exports={
	readZip,
	readPackage,
	writeZip,
	writePackage
}
