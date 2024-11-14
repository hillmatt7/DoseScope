// DrugLibrary.js
import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

const DrugLibrary = () => {
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDrugs = async () => {
      const response = await window.electronAPI.invoke('get-drugs'); // Use the exposed API
      setDrugs(response);
    };
    fetchDrugs();
  }, []);

  const filteredDrugs = drugs.filter((drug) =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ul>
        {filteredDrugs.map((drug) => (
          <li key={drug.name}>
            {drug.name} - {drug.molecularWeight} - {drug.halfLife}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DrugLibrary;
