// App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import GraphPlotter from './components/GraphPlotter';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <GraphPlotter />
        <Sidebar />
      </div>
    </Router>
  );
}

export default App;
