// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AddDrugForm from './components/AddDrugForm';
import DrugLibrary from './components/DrugLibrary';
import DosingProtocolForm from './components/DosingProtocolForm';
import GraphPlotter from './components/GraphPlotter';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Switch>
            <Route path="/add-drug" component={AddDrugForm} />
            <Route path="/library" component={DrugLibrary} />
            <Route path="/protocol" component={DosingProtocolForm} />
            <Route path="/plot" component={GraphPlotter} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
