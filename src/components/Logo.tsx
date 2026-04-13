import React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#FF0000" />
      <path 
        d="M25 45 C 25 20, 75 20, 75 45 C 75 60, 60 70, 50 70 C 35 70, 25 55, 25 45 Z" 
        fill="none" 
        stroke="white" 
        strokeWidth="16" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="25" cy="45" r="8" fill="white" />
    </svg>
  );
}
