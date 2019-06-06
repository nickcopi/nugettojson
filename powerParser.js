
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
let readZip = (ps1)=>{
	return readObj(ps1,'$zipArgs = @{');

}
let readPackage = (ps1)=>{
	return readObj(ps1,'$packageArgs = @{');

}
module.exports={
	readZip,
	readPackage


}
