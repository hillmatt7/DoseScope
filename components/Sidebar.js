// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to="/add-drug">Add Drug</Link>
      <Link to="/library">Drug Library</Link>
      <Link to="/protocol">Dosing Protocol</Link>
      <Link to="/plot">Plot Graph</Link>
    </div>
  );
};

export default Sidebar;
