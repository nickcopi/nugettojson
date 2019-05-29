
import React, {Component} from 'react';

export default class Package extends Component {
	state = {code:null};
	constructor(props){
		super(props);
		this.showMore = this.showMore.bind(this);
	}
	defaultProps = {
		name:'',
		success:false,
		error:'',
		result:'',
		date:'',

	}
	state = {
		hiding:true,
		info:<div >{this.props.result + '\n' + (this.props.error?this.props.error:'')}</div>
	}
	
	showMore(e){
		//this.setState({info:<div> {this.props.result}</div>});
		this.setState({hiding:!this.state.hiding});
	}
	


	render(){
		let {name,success,error,result,date} = this.props;
		return (
			<div className='testBar' onClick={this.showMore}>
				<span className='testItem'>
					{date}
				</span>
				<span className='testItem'>
					{name}
				</span>
				<span className = 'testItem'style = {{'font-size':'20px',color:success?'green':'red'}}>
					{success?'✔':'❌'}
				</span>
				{!this.state.hiding?this.state.info:''}
				
			</div>
		);
	}
	componentDidMount(){
	}
}

