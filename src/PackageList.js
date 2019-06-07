import React, {Component} from 'react';
import Package from './Package';

export default class PackageView extends Component {
	state = {packages:null};
	constructor(props){
		super(props);
		this.updatePackages = this.updatePackages.bind(this);
		this.callUpdatePackages = this.callUpdatePackages.bind(this);
	}
	render(){
		let packages = this.state.packages;
		let data = packages?this.loadPackages(packages):'Loading';
		return (
			<center className = 'packageList'>
			{data}
			</center>
		);
	}
	componentDidMount(){
		this.updatePackages();
	}
	callUpdatePackages(){
		this.updatePackages();
	}
	updatePackages(){
		fetch('/listPackages')
			.then(res=>res.json())
			.then(data=>{
				this.setState({packages:data});

			})
			.catch((err)=>{
				console.log(err);
			});
	}
	loadPackages=(packages)=>{
		return packages.map(p=>(
			<div>
			<Package update = {this.callUpdatePackages} zipArgs={p.zipArgs} packageArgs={p.packageArgs} name={p.name} version = {p.version}/>
			<br/>
			</div>
		));
	}
}

