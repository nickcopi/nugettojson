import React, {Component} from 'react';

export default class Package extends Component {
	state = {packages:null};
	defaultProps = {
		name:'',
		version:''

	}
	render(){
		let name = this.props.name;
		let version = this.props.version;
		return (
			<div className = 'package'>
			<div className = 'nameHeader'>{name}</div>
			<div className = 'versionHeader'>Version: {version} </div>
			<a className = 'downloadBtn' href={`/packages/${name}_${version}/${name}_${version}.nupkg`}>Download</a>
			</div>
		);
	}
	componentDidMount(){
	}
}

