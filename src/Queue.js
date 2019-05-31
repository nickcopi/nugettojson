import React, {Component} from 'react';
import QueueItem from './QueueItem';

export default class Queue extends Component {
	state = {queue:null,interval:null};
	render(){
		let queue = this.state.queue;
		let data = queue?this.loadQueue(queue):'Loading';
		return (
			<center className = 'packageList'>
			<br/>
			{data}
			</center>
		);
	}
	componentDidMount(){
		this.updateQueue();
		this.setState({interval:setInterval(()=>{
			this.updateQueue();
		},1000*60)});
	}
	componentWillUnmount(){
		clearInterval(this.state.interval);
	}
	updateQueue(){
		fetch('/getTestQueue')
			.then(res=>res.json())
			.then(data=>{
				this.setState({queue:data});

			})
			.catch((err)=>{
				console.log(err);
			});
	}
	loadQueue=(queue)=>{
		return queue.map(q=>(
			<QueueItem name={q.name} version={q.version} dibs={q.dibs}/>
		));
	}
}

