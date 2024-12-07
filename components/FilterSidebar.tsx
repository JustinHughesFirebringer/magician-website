import React from 'react';

const FilterSidebar: React.FC = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Filter Magicians</h2>
      {/* Add filter options here */}
      <div>
        <label className="block mb-1">Service</label>
        <select className="w-full border border-gray-300 rounded-md p-2">
          <option value="">Any Service</option>
          {/* Add service options dynamically */}
        </select>
      </div>
      <div className="mt-4">
        <label className="block mb-1">Location</label>
        <select className="w-full border border-gray-300 rounded-md p-2">
          <option value="">Any Location</option>
          {/* Add location options dynamically */}
        </select>
      </div>
    </div>
  );
};

export default FilterSidebar;
