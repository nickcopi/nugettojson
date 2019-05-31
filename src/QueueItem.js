
import React, {Component} from 'react';

export default class QueueItem extends Component {
	constructor(props){
		super(props);
	}
	defaultProps = {
		name:'',
		version:'',
		dibs:false,

	}

	render(){
		let {name,version,dibs} = this.props;
		return (
			<div className='testBar'>
				<span className='testItem'>
					{name}
				</span>
				<span className='testItem'>
					{version}
				</span>
				<span className = 'testItem'style = {{color:dibs?'green':'inherit'}}>
					{!dibs?'Awaiting an agent':'Being processed by an agent'}
				</span>
			</div>
		);
	}
	componentDidMount(){
	}
}

