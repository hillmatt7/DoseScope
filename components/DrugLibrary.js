// DrugLibrary.js
import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

const DrugLibrary = () => {
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(null);

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

  const handleDrugClick = (drug) => {
    setSelectedDrug(drug);
  };

  return (
    <div>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {selectedDrug ? (
        <div>
          <h2>{selectedDrug.name}</h2>
          <p>Molecular Weight: {selectedDrug.molecularWeight} g/mol</p>
          <p>
            Half-Life: {selectedDrug.halfLife} {selectedDrug.halfLifeUnit}
          </p>
          <p>Esters: {selectedDrug.esters ? 'Yes' : 'No'}</p>
          <button onClick={() => setSelectedDrug(null)}>Back to List</button>
        </div>
      ) : (
        <div className="drug-list">
          {filteredDrugs.map((drug) => (
            <div
              key={drug.name}
              className="drug-item"
              onClick={() => handleDrugClick(drug)}
            >
              {drug.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrugLibrary;
