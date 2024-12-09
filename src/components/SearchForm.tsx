'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { states } from '../lib/constants';

interface SearchFormProps {
  initialCity?: string;
  initialState?: string;
}

export default function SearchForm({ 
  initialCity = '', 
  initialState = '',
}: SearchFormProps) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <div>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="px-4 py-2 bg-white border border-indigo-200 text-gray-900 rounded-md 
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   placeholder:text-indigo-300 hover:border-indigo-400
                   shadow-sm transition-colors duration-200"
        />
      </div>
      
      <div>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="px-4 py-2 bg-white border border-indigo-200 text-gray-900 rounded-md
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   hover:border-indigo-400 shadow-sm transition-colors duration-200"
        >
          <option value="">Select state</option>
          {states.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-md 
                 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                 focus:ring-indigo-500 focus:ring-offset-2
                 shadow-sm transition-colors duration-200"
      >
        Search
      </button>
    </form>
  );
}
