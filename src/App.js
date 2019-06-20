import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {HashRouter} from 'react-router-dom';
import './App.css';
import Home from './Home';
import Tests from './Tests';
import Buttons from './Buttons';
import Queue from './Queue';
import Builds from './BuildList';
import MenuBar from './MenuBar';


function App() {
  return (
    <div className="App">
	  <HashRouter basename = '/'>
		<div>
			<MenuBar/>
	  		<br/><br/>
			<Route exact path = '/' component = {Home}/>
			<Route path = '/builds' component = {Builds}/>
			<Route path = '/tests' component = {Tests}/>
			<Route path = '/queue' component = {Queue}/>
			<Route path = '/danger' component = {Buttons}/>
		</div>
	</HashRouter>
    </div>
  );
}

export default App;
