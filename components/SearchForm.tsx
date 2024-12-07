import React, { useState } from 'react';

const SearchForm: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search magicians..."
        className="border border-gray-300 rounded-md p-2"
      />
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="">Any Location</option>
        {/* Add location options dynamically */}
      </select>
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="">Any Service</option>
        {/* Add service options dynamically */}
      </select>
      <button type="submit" className="bg-blue-500 text-white rounded-md p-2">
        Search
      </button>
    </form>
  );
};

export default SearchForm;
