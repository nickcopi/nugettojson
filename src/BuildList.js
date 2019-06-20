import React, {Component} from 'react';
import BuildItem from './BuildItem';

export default class BuildList extends Component {
	state = {builds:null,interval:null};
	render(){
		let builds = this.state.builds;
		let data = builds?this.loadBuilds(builds):'Loading';
		return (
			<center className = 'packageList'>
			<br/>
			<div className='testHeader'>
				<span className='testItem'>
					Time Stamp
				</span>
				<span className='testItem'>
					Package Name
				</span>
				<span className='testItem'>
					Success
				</span>
				
			</div>
			{data}
			</center>
		);
	}
	componentDidMount(){
		this.updateBuilds();
		this.setState({interval:setInterval(()=>{
			this.updateBuilds();
		},1000*60)});
	}
	componentWillUnmount(){
		clearInterval(this.state.interval);
	}
	updateBuilds(){
		fetch('/getBuildLog')
			.then(res=>res.json())
			.then(data=>{
				this.setState({builds:data.reverse()});

			})
			.catch((err)=>{
				console.log(err);
			});
	}
	loadBuilds=(builds)=>{
		return builds.map(t=>(
			<BuildItem success={t.success} error={t.error} result={t.result} name={t.name} date={t.date}/> 
		));
	}
}

