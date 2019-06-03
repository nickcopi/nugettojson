
import React, {Component} from 'react';

export default class QueueItem extends Component {
	constructor(props){
		super(props);
		this.removeItem = this.removeItem.bind(this);
	}
	defaultProps = {
		name:'',
		version:'',
		dibs:false
	}

	render(){
		let {name,version,dibs} = this.props;
		return (
			<div onClick={this.removeItem} className='testBar'>
				<span className='testItem'>
					{name}
				</span>
				<span className='testItem'>
					{version}
				</span>
				<span className = 'testItem' style = {{color:dibs?'green':'inherit'}}>
					{!dibs?'Awaiting an agent':'Being processed by an agent'}
				</span>
			</div>
		);
	}
	danger(){
		return window.confirm('Would you like to remove this item from the test queue?');
	}

	removeItem(e){
		if(!this.danger()) return;
		const element = e.target;
		fetch('/removeQueueItem',{
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
			this.props.refresh();
		}).catch(e=>{
			console.error(e);
			this.props.refresh();
		});


	}
	componentDidMount(){
	}
}

