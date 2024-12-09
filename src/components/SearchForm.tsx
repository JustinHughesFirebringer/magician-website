'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SearchFormProps {
  initialQuery?: string;
  initialState?: string;
  initialCity?: string;
  initialService?: string;
  className?: string;
}

export default function SearchForm({ 
  initialQuery = '', 
  initialState = '',
  initialCity = '',
  initialService = '',
  className = '' 
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);
  const [service, setService] = useState(initialService);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (query) {
      searchParams.set('query', query);
    }
    if (state) {
      searchParams.set('state', state);
    }
    if (city) {
      searchParams.set('city', city);
    }
    if (service) {
      searchParams.set('service', service);
    }
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search magicians..."
            className="pl-10"
          />
          <SearchIcon 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" 
          />
        </div>
        <Input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-32"
        />
        <Input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="State"
          className="w-32"
        />
        <Input
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Service"
          className="w-32"
        />
        <Button
          type="submit"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
