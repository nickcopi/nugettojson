import React, {Component} from 'react';

export default class Package extends Component {
	state = {};
	constructor(props){
		super(props);
		this.buildRequest = this.buildRequest.bind(this);
		this.fetchRequest = this.fetchRequest.bind(this);
		this.runRequest = this.runRequest.bind(this);

	}
	defaultProps = {
		name:'',
		version:'',
		zipArgs:{},
		packageArgs:{}
	}
	updateZipArgs(e){
		const element = e.target;
		const code = element.parentElement.children[2].value;
		const originalText = element.innerText;
		element.innerText = 'Updating...';
		fetch('/updateUpdater',{
			method: 'POST',
			headers:{
				'Content-Type': 'application/json'
			},
			body:JSON.stringify({
				name: this.props.name,
				version:this.props.version,
				code

			})
		}).then(res=>res.json()).then(res=>{
			console.log(res);
			if(res.success){
				element.innerText = 'Success!';
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
	fetchRequest(e){
		const element = e.target;
		const originalText = element.innerText;
		element.innerText = 'Fetching...';
		fetch('/fetchPackage',{
			method: 'POST',
			headers:{
				'Content-Type': 'application/json'
			},
			body:JSON.stringify({
				name: this.props.name,
				version:this.props.version

			})
		}).then(res=>res.json()).then(res=>{
			console.log(res);
			if(res.success){
				element.innerText = 'Success!';
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
	buildRequest(e){
		const element = e.target;
		const originalText = element.innerText;
		const buildStatus = element.parentElement.children[3];
		element.innerText = 'Building...';
		fetch('/buildPackage',{
			method: 'POST',
			headers:{
				'Content-Type': 'application/json'
			},
			body:JSON.stringify({
				name: this.props.name,
				version:this.props.version

			})
		}).then(res=>res.json()).then(res=>{
			console.log(res);
			if(res.success){
				element.innerText = 'Success!';
				setTimeout(()=>{element.innerText = originalText},500);
			} else {
				element.innerText = 'Failure!';
				setTimeout(()=>{element.innerText = originalText},500);
				buildStatus.innerText = res.result;
			}
		}).catch(e=>{
			element.innerText = originalText;
			console.error(e)
		});

	}
	runRequest(e){
		const element = e.target;
		const originalText = element.innerText;
		const buildStatus = element.parentElement.children[3];
		element.innerText = 'Running...';
		fetch('/runUpdatePackage',{
			method: 'POST',
			headers:{
				'Content-Type': 'application/json'
			},
			body:JSON.stringify({
				name: this.props.name,
				version:this.props.version

			})
		}).then(res=>res.json()).then(res=>{
			console.log(res);
			if(res.success){
				element.innerText = 'Success!';
				setTimeout(()=>{element.innerText = originalText},500);
			} else {
				element.innerText = 'Failure!';
				setTimeout(()=>{element.innerText = originalText},500);
				buildStatus.innerText = res.result;
			}
		}).catch(e=>{
			element.innerText = originalText;
			console.error(e)
		});
	}


	render(){
		let {name, version, zipArgs, packageArgs} = this.props;
		return (
			<div className = 'package'>
			<div className = 'nameHeader'>{name}</div>
			<div className = 'versionHeader'>Version: {version} </div>
			{this.buildObjectView(zipArgs,'Zip')}
			{this.buildObjectView(packageArgs,'Package')}
			<div className = 'buildStatus'></div>
			<a className = 'downloadBtn' href={`/packages/${name}/${name}.${version}.nupkg`}>Download</a>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.buildRequest}>Build</span>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.fetchRequest}>Fetch</span>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.updateRequest}>Update Package</span>
			</div>
		);
	}
	componentDidMount(){
	}
	buildObjectView(obj,type){
		if(!Object.entries(obj).length) return;
		return (
				<div>
					<h3>{type} Arguments</h3>
					{Object.entries(obj).map(([k,v])=>
						(<div> {k}: <input placeholder = {k} className = 'argInput' defaultValue={v}/></div>)
					)}
					<br/>
					<span className = 'downloadBtn' onClick = {this['update' + type + 'Args']}>Update {type} Args</span>
					<br/>
					<br/>
				</div>
			)
	}
}

