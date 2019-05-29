import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';

export default class MenuItem extends Component {

	componentDidMount() {
		console.log('mounted');
	}
	render() {
		return (
				<Link className = "menuItem" to={this.props.url}>{this.props.text}</Link>
		);
	}
}

