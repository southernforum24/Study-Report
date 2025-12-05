
import React, { useState } from 'react';
import { Search, History, X, Calendar } from 'lucide-react';
import { Student } from '../types';
import { YEAR_OPTIONS } from '../constants';

interface StudentSearchProps {
  onSearch: (query: string, year: string) => void;
  error?: string | null;
  students: Student[];
  recentSearches: string[];
  onClearHistory: () => void;
  currentYear: string;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({ 
  onSearch, 
  error, 
  students, 
  recentSearches,
  onClearHistory,
  currentYear
}) => {
  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), selectedYear);
    }
  };

  const handleRecentClick = (name: string) => {
      setQuery(name);
      onSearch(name, selectedYear);
  }

  const clearInput = () => {
      setQuery('');
  }

  return (
    <div className="text-center relative">
      <div className="mb-8 relative z-10 pt-4">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider mb-3 uppercase border border-blue-200">ระบบตรวจสอบผลการเรียนออนไลน์</span>
        <h2 className="text-4xl font-extrabold text-blue-900 mb-3 drop-shadow-sm">ตรวจสอบผลการเรียน</h2>
        <p className="text-gray-500 text-lg max-w-md mx-auto">กรอกชื่อ หรือ นามสกุล ของนักเรียนเพื่อค้นหาข้อมูลผลการสอบ</p>
      </div>

      <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto z-10">
        
        {/* Year Selector */}
        <div className="flex justify-center mb-4">
             <div className="flex items-center bg-white rounded-full px-4 py-1.5 shadow-sm border border-gray-200 gap-2">
                 <Calendar className="w-4 h-4 text-gray-400" />
                 <span className="text-sm font-semibold text-gray-500">ปีการศึกษา:</span>
                 <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="text-sm font-bold text-blue-900 bg-transparent outline-none cursor-pointer"
                 >
                     {YEAR_OPTIONS.map(year => (
                         <option key={year} value={year}>{year}</option>
                     ))}
                 </select>
             </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-12 py-5 rounded-full border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-lg text-lg"
            placeholder="ค้นหาด้วยชื่อ เช่น ซาฟี..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          
          {/* Clear Button */}
          {query && (
             <button 
                type="button"
                onClick={clearInput}
                className="absolute inset-y-0 right-28 flex items-center pr-2 text-gray-400 hover:text-gray-600"
             >
                 <X className="w-5 h-5" />
             </button>
          )}

          <div className="absolute inset-y-2 right-2">
              <button 
                type="submit"
                className="h-full px-6 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-full transition-colors shadow-sm flex items-center gap-2"
              >
                ค้นหา
              </button>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
            <div className="mt-6 text-left animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400 font-semibold flex items-center gap-1">
                        <History className="w-4 h-4" /> ประวัติการค้นหาล่าสุด
                    </p>
                    <button 
                        type="button"
                        onClick={onClearHistory}
                        className="text-xs text-red-400 hover:text-red-600 underline"
                    >
                        ล้างประวัติ
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {recentSearches.map((name, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleRecentClick(name)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded-lg text-sm transition-colors border border-transparent hover:border-blue-200"
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {error && (
          <div className="mt-6 text-red-600 text-sm bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-md animate-fade-in flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};
