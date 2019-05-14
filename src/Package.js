import React, {Component} from 'react';

export default class Package extends Component {
	state = {code:null};
	constructor(props){
		super(props);
		this.buildRequest = this.buildRequest.bind(this);
		this.fetchRequest = this.fetchRequest.bind(this);
		this.updateRequest = this.updateRequest.bind(this);
		this.updateCode = this.updateCode.bind(this);

	}
	defaultProps = {
		name:'',
		version:''

	}
	fetchRequest(e){
		const element = e.target;
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
				setTimeout(()=>{element.innerText = 'Fetch'},500);
			} else {
				element.innerText = 'Failure!';
				setTimeout(()=>{element.innerText = 'Fetch'},500);
			}
		}).catch(e=>{
			element.innerText = 'Fetch';
			console.error(e)
		});

	}
	buildRequest(e){
		const element = e.target;
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
				setTimeout(()=>{element.innerText = 'Build'},500);
			} else {
				element.innerText = 'Failure!';
				setTimeout(()=>{element.innerText = 'Build'},500);
				buildStatus.innerText = res.result;
			}
		}).catch(e=>{
			element.innerText = 'Build';
			console.error(e)
		});

	}
	updateRequest(e){
		const element = e.target;
		const buildStatus = element.parentElement.children[3];
		element.innerText = 'Updating...';
		fetch('/updatePackage',{
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
				setTimeout(()=>{element.innerText = 'Update'},500);
			} else {
				element.innerText = 'Failure!';
				setTimeout(()=>{element.innerText = 'Update'},500);
				buildStatus.innerText = res.result;
			}
		}).catch(e=>{
			element.innerText = 'Update';
			console.error(e)
		});

	}


	render(){
		let name = this.props.name;
		let version = this.props.version;
		let code = this.state.code?this.state.code:'Loading...';
		return (
			<div className = 'package'>
			<div className = 'nameHeader'>{name}</div>
			<div className = 'versionHeader'>Version: {version} </div>
			<textarea className = 'codeView' onChange={this.updateCode} value = {code}>{code}</textarea>
			<div className = 'buildStatus'></div>
			<a className = 'downloadBtn' href={`/packages/${name}.${version}/${name}.${version}.nupkg`}>Download</a>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.buildRequest}>Build</span>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.fetchRequest}>Fetch</span>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.updateRequest}>Update</span>
			</div>
		);
	}
	updateCode(e){
		this.setState({code:e.target.value});
	}
	getCode(){
		let pkgName = `${this.props.name}.${this.props.version}`;
		fetch(`/packages/${pkgName}/${pkgName}-updater.js`)
			.then(res=>{
				if(!res.status === 200){
					this.setState({code:'Failed to load code'});
				} else {
					res.text().then(data=>{
						this.setState({code:data});
					}).catch(e=>{
						this.setState({code:e.toString()});
					});
				}
			})
			.catch((err)=>{
				console.log(err);
			});
	}
	componentDidMount(){
		this.getCode();
	}
}

