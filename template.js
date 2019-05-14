const originalDir = process.cwd();
process.chdir('../../');
const fs = require('fs');
const request = require('request-promise');
process.chdir(originalDir);
const chocoPS1Path = 'output/tools/chocolateyInstall.ps1';
const chocoPS1 = fs.readFileSync(chocoPS1Path).toString('utf-8');	

let updateChocoPS1 = () =>{
	/*Your code goes here*/
	let data = chocoPS1;
	data += '\n#You see nothing!';
	writeChocoPS1(data);
}

let writeChocoPS1 = data=>{
	fs.writeFileSync(chocoPS1Path,data);

}

updateChocoPS1();
