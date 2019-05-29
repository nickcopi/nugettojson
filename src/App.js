import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {HashRouter} from 'react-router-dom';
import './App.css';
import Home from './Home';
import Tests from './Tests';
import PackageList from './PackageList';
import MenuBar from './MenuBar';


function App() {
  return (
    <div className="App">
	  <HashRouter basename = '/'>
		<div>
			<MenuBar/>
			<Route exact path = '/' component = {Home}/>
			<Route path = '/tests' component = {Tests}/>
		</div>
	</HashRouter>
    </div>
  );
}

export default App;
