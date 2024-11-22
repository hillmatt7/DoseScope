// components/CompoundLibrary.js

import React, { useState, useEffect } from 'react';

const CompoundLibrary = ({ addCompoundToProtocol }) => {
  const [compounds, setCompounds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCompounds = async () => {
    try {
      const response = await window.electronAPI.invoke('get-compounds');
      setCompounds(response);
    } catch (error) {
      console.error('Error fetching compounds:', error);
      alert('Failed to load compounds.');
    }
  };

  useEffect(() => {
    fetchCompounds();
  }, []);

  const filteredCompounds = compounds.filter((compound) =>
    compound.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="compound-library">
      <h2>Compound Library</h2>
      <input
        type="text"
        placeholder="Search compounds..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="compound-list">
        {filteredCompounds.map((compound) => (
          <div key={compound.name} className="compound-item">
            <span>{compound.name}</span>
            <button onClick={() => addCompoundToProtocol(compound)}>
              Add to Protocol
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompoundLibrary;
