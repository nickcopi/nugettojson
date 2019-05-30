import React, { Component } from 'react';


export default class Buttons extends Component {

	componentDidMount() {
	}
	constructor(props){
		super(props);
		this.fetchPath = this.fetchPath.bind(this);
	}

	render() {
		return (
			<div>
				<br/>
				<span path='/fetchAll' onClick={this.fetchPath} className = 'testBar centerBar'>Force Fetch All Packages</span>	
				<span path='/updateAll' onClick={this.fetchPath} className = 'testBar centerBar'>Run Update All Packages</span>	
				<span path='/buildAll' onClick={this.fetchPath} className = 'testBar centerBar'>Build All Packages</span>	
				<span path='/clearTestLogs' onClick={this.fetchPath} className = 'testBar centerBar'>Clear All Test Logs</span>	
				<span path='/clearTestQueue' onClick={this.fetchPath} className = 'testBar centerBar'>Empty Test Queue</span>	
				<span path='/removeAllPackages' onClick={this.fetchPath }className = 'testBar centerBar'>Delete All Local Packages</span>	
			</div>
		);
	}
	danger(){
		return window.confirm('This could break operations, not work properly, or be generally bad. Are you sure you want to continue?');
	}
	fetchPath(e){
		if(!this.danger()) return;
		const element = e.target;
		const originalText = element.innerText;
		const path = element.getAttribute('path');
		element.innerText = 'Sending...';
		fetch(path,{
			method: 'POST',
			headers:{
				'Content-Type': 'application/json'
			},
		}).then(res=>res.json()).then(res=>{
			console.log(res);
			if(res.attempted){
				element.innerText = 'Action Attempted!';
				setTimeout(()=>{element.innerText = originalText},500);
			} else {
				element.innerText = 'Failure!';
				setTimeout(()=>{element.innerText = originalText},500);
			}
		}).catch(e=>{
			element.innerText = originalText;
			console.error(e)
		});

	}
}

