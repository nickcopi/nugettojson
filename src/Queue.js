import React, {Component} from 'react';
import QueueItem from './QueueItem';

export default class Queue extends Component {
	constructor(props){
		super(props);
		this.updateQueue = this.updateQueue.bind(this);
	}
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
		console.log('aaaa');
		fetch('/getTestQueue')
			.then(res=>res.json())
			.then(data=>{
				this.setState({queue:data});

			})
			.catch((err)=>{
				console.log(err);
			});
	}
	doQueueUpdate(){
		this.updateQueue();
	}	
	loadQueue=(queue)=>{
		return queue.map(q=>(
			<QueueItem refresh={this.doQueueUpdate} refresh={this.updateQueue} name={q.name} version={q.version} dibs={q.dibs}/>
		));
	}
}

