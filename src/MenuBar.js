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
				<MenuItem url = '/builds' text = "Build Log"></MenuItem>
				<MenuItem url = '/tests' text = "Test Log"></MenuItem>
				<MenuItem url = '/queue' text = "Test Queue"></MenuItem>
				<MenuItem url = '/danger' text = "Settings"></MenuItem>
			</div>
		);
	}
}

