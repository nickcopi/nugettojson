import React, {Component} from 'react';
import Package from './Package';

export default class PackageView extends Component {
	state = {packages:null};
	render(){
		let packages = this.state.packages;
		let data = packages?this.loadPackages(packages):'Loading';
		return (
			<div>
			{data}
			</div>
		);
	}
	componentDidMount(){
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
			<Package name={p.name} version = {p.version}/>
		));
	}
}

