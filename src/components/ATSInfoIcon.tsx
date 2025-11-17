'use client';

import { useState } from 'react';
import { ATSCategoryInfo } from '@/lib/ats-analyzer';

interface ATSInfoIconProps {
  category: ATSCategoryInfo;
}

export default function ATSInfoIcon({ category }: ATSInfoIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors cursor-help"
        aria-label={`Learn more about ${category.name}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  category.importance === 'High' ? 'bg-red-100 text-red-700' :
                  category.importance === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {category.importance} Priority
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{category.description}</p>
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Tips:</h4>
              <ul className="space-y-1">
                {category.tips.map((tip, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

