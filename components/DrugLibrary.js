// DrugLibrary.js
import React, { useState, useEffect } from 'react';

const DrugLibrary = ({ addDrugToProtocol }) => {
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDrugs = async () => {
      const response = await window.electronAPI.invoke('get-drugs');
      setDrugs(response);
    };
    fetchDrugs();
  }, []);

  const filteredDrugs = drugs.filter((drug) =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="drug-library">
      <h2>Drug Library</h2>
      <input
        type="text"
        placeholder="Search drugs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="drug-list">
        {filteredDrugs.map((drug) => (
          <div key={drug.name} className="drug-item">
            <span>{drug.name}</span>
            <button onClick={() => addDrugToProtocol(drug)}>
              Add to Protocol
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrugLibrary;
