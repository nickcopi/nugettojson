import React, { Component } from 'react';
import MenuItem from './MenuItem';

export default class MenuBar extends Component {

	componentDidMount() {
		console.log('mounted');
	}
	render() {
		return (
			<div class='menuBar'>
				<MenuItem url = '/' text = "Home"></MenuItem>
				<MenuItem url = '/tests' text = "View Tests"></MenuItem>
			</div>
		);
	}
}

