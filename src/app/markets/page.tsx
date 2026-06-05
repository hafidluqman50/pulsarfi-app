import React, { useMemo, useState } from 'react';
import { MarketsUI } from './ui';
import { PSTOCKS } from '@/lib/mockData';

export default function MarketsPage({ onOpen }: { onOpen: (ticker: string) => void }) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredMarketsList = useMemo(() => {
    let outputList = [...PSTOCKS];
    
    if (activeFilter === 'gainers') {
      outputList = outputList.filter((token) => (token.change24h ?? 0) >= 0).sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
    }
    
    if (activeFilter === 'losers') {
      outputList = outputList.filter((token) => (token.change24h ?? 0) < 0).sort((a, b) => (a.change24h ?? 0) - (b.change24h ?? 0));
    }
    
    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      outputList = outputList.filter((token) => 
        token.ticker.toLowerCase().includes(lowerCaseQuery) || 
        token.name.toLowerCase().includes(lowerCaseQuery) || 
        token.ipo?.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return outputList;
  }, [activeFilter, searchQuery]);

  return (
    <MarketsUI 
      marketsList={filteredMarketsList} 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery} 
      activeFilter={activeFilter} 
      setActiveFilter={setActiveFilter} 
      onNavigateToDetail={onOpen} 
    />
  );
}
