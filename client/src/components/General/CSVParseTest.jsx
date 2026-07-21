import React, { useState } from 'react';
import Papa from 'papaparse';

const CSVParseTest = () => {
  const [csvData, setCsvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    stateID: '',
    minVertical: '',
    maxVertical: '',
  });

  // Handle file upload and CSV parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setCsvData(result.data);
          setFilteredData(result.data); // Set initial data for filtering
        },
        header: true, // If your CSV has headers
        skipEmptyLines: true, // Skip empty lines in the CSV
      });
    }
  };

  // Handle changes in filter inputs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters to data
  const applyFilters = () => {
    let filtered = csvData;

    if (filters.search) {
      filtered = filtered.filter((resort) =>
        resort.resort_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.stateID) {
      filtered = filtered.filter((resort) =>
        resort.stateID.toLowerCase().includes(filters.stateID.toLowerCase())
      );
    }

    if (filters.minVertical) {
      filtered = filtered.filter(
        (resort) => parseInt(resort.vertical) >= parseInt(filters.minVertical)
      );
    }

    if (filters.maxVertical) {
      filtered = filtered.filter(
        (resort) => parseInt(resort.vertical) <= parseInt(filters.maxVertical)
      );
    }

    setFilteredData(filtered);
  };

  // Reapply filters whenever filters state changes
  React.useEffect(() => {
    applyFilters();
  }, [filters]);

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      
      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          name="search"
          placeholder="Search Resort by Name"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="stateID"
          placeholder="Filter by State ID"
          value={filters.stateID}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minVertical"
          placeholder="Min Vertical"
          value={filters.minVertical}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxVertical"
          placeholder="Max Vertical"
          value={filters.maxVertical}
          onChange={handleFilterChange}
        />
      </div>

      {filteredData.length > 0 && (
        <table>
          <thead>
            <tr>
              {Object.keys(filteredData[0]).map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CSVParseTest;
