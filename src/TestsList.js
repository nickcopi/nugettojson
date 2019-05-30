import React, {Component} from 'react';
import Test from './Test';

export default class TestsList extends Component {
	state = {tests:null,interval:null};
	render(){
		let tests = this.state.tests;
		let data = tests?this.loadTests(tests):'Loading';
		return (
			<center className = 'packageList'>
			<br/>
			{data}
			</center>
		);
	}
	componentDidMount(){
		this.updateTests();
		this.setState({interval:setInterval(()=>{
			this.updateTests();
		},1000*60)});
	}
	componentWillUnmount(){
		clearInterval(this.state.interval);
	}
	updateTests(){
		fetch('/getTests')
			.then(res=>res.json())
			.then(data=>{
				this.setState({tests:data.reverse()});

			})
			.catch((err)=>{
				console.log(err);
			});
	}
	loadTests=(tests)=>{
		return tests.map(t=>(
			<Test success={t.success} error={t.error} result={t.result} name={t.name} date={t.date}/> 
		));
	}
}

