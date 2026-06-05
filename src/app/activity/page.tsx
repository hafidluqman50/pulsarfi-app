import React, { useState } from 'react';
import { ActivityUI } from './ui';
import { ActivityItem } from '@/lib/mockData';

function getRelativeDay(date: Date) {
  const currentDate = new Date(2026, 4, 23, 9, 30);
  const startOfCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const startOfGivenDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const differenceInDays = Math.round((startOfCurrentDate.getTime() - startOfGivenDate.getTime()) / 86400000);
  
  if (differenceInDays <= 0) return 'Today';
  if (differenceInDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long' });
}

export default function ActivityPage({ activity }: { activity: ActivityItem[] }) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'swaps' | 'custody'>('all');
  
  let filteredActivity = activity;
  if (activeFilter === 'swaps') {
    filteredActivity = filteredActivity.filter((item) => item.kind === 'swap');
  }
  if (activeFilter === 'custody') {
    filteredActivity = filteredActivity.filter((item) => item.kind === 'mint' || item.kind === 'redeem');
  }
  
  const activityGroups = filteredActivity.reduce<{ key: string; items: ActivityItem[] }[]>((accumulator, item) => {
    const groupKey = getRelativeDay(item.time);
    const existingGroup = accumulator.find((group) => group.key === groupKey);
    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      accumulator.push({ key: groupKey, items: [item] });
    }
    return accumulator;
  }, []);

  return (
    <ActivityUI activeFilter={activeFilter} setActiveFilter={setActiveFilter} activityGroups={activityGroups} />
  );
}
