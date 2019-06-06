import React, {Component} from 'react';

export default class Package extends Component {
	state = {code:null};
	constructor(props){
		super(props);
		this.buildRequest = this.buildRequest.bind(this);
		this.fetchRequest = this.fetchRequest.bind(this);
		this.updateRequest = this.updateRequest.bind(this);
		this.runRequest = this.runRequest.bind(this);
		this.updateCode = this.updateCode.bind(this);

	}
	defaultProps = {
		name:'',
		version:'',
		zipArgs:{},
		packageArgs:{}
	}
	updateRequest(e){
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
		let code = this.state.code?this.state.code:'Loading...';
		return (
			<div className = 'package'>
			{JSON.stringify(zipArgs,null,2)}
			{JSON.stringify(packageArgs,null,2)}
			<div className = 'nameHeader'>{name}</div>
			<div className = 'versionHeader'>Version: {version} </div>
			<textarea className = 'codeView' onChange={this.updateCode} value = {code}>{code}</textarea>
			<div className = 'buildStatus'></div>
			<a className = 'downloadBtn' href={`/packages/${name}/${name}.${version}.nupkg`}>Download</a>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.buildRequest}>Build</span>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.fetchRequest}>Fetch</span>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.runRequest}>Run Script</span>
			&nbsp;
			<span className = 'downloadBtn' onClick = {this.updateRequest}>Update Script</span>
			</div>
		);
	}
	updateCode(e){
		this.setState({code:e.target.value});
	}
	getCode(){
		fetch(`/packages/${this.props.name}/${this.props.name}-updater.js`)
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

