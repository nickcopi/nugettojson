const schedule = require('node-schedule');
const api = require('./api');
const fs = require('fs');

let startSchedule = ()=>{
	// run at 1 am every day
	schedule.scheduleJob('0 1 * * *', async ()=>{
		const output = [];
		console.log('Starting scheduled package job.');
		await api.fetchAll();
		output.push(await api.updateAll());
		output.push(await api.buildAll());
		fs.writeFileSync('schedule.log',JSON.stringify(output,null,2));
		console.log('Finished scheduled package job.');
	});
}


module.exports = startSchedule;
