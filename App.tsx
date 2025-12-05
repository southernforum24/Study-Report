
import React, { useState, useEffect } from 'react';
import { MOCK_STUDENTS, CURRENT_YEAR } from './constants';
import { Student, AnalysisState } from './types';
import { StudentSearch } from './components/StudentSearch';
import { StudentReport } from './components/StudentReport';
import { generateStudentAnalysis } from './services/geminiService';
import { School } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'report'>('search');
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Static data only, no management needed
  const studentsData = MOCK_STUDENTS;
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    content: null,
    error: null
  });

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const addToRecentSearches = (name: string) => {
    const updated = [name, ...recentSearches.filter(s => s !== name)].slice(0, 5); // Keep last 5
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
      setRecentSearches([]);
      localStorage.removeItem('recentSearches');
  }

  const handleSearch = (query: string, year: string) => {
    const trimmedQuery = query.toLowerCase().replace(/\s+/g, '');
    
    const foundStudent = studentsData.find(s => {
      // Must match year
      if (s.academicYear !== year) return false;

      const fullName = `${s.firstName}${s.lastName}`.toLowerCase();
      const idMatch = s.id === query;
      const nameMatch = fullName.includes(trimmedQuery) || s.firstName.toLowerCase().includes(trimmedQuery) || s.lastName.toLowerCase().includes(trimmedQuery);
      return idMatch || nameMatch;
    });

    if (foundStudent) {
      setStudent(foundStudent);
      setError(null);
      setCurrentView('report');
      setAnalysis({ isLoading: false, content: null, error: null });
      // Add to history using First Name + Last Name for better readability
      addToRecentSearches(`${foundStudent.firstName} ${foundStudent.lastName}`);
    } else {
      setError(`ไม่พบข้อมูลนักเรียน: "${query}" ในปีการศึกษา ${year}`);
      setStudent(null);
    }
  };

  const handleBack = () => {
    setStudent(null);
    setCurrentView('search');
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!student) return;

    setAnalysis({ isLoading: true, content: null, error: null });
    try {
      const result = await generateStudentAnalysis(student);
      setAnalysis({ isLoading: false, content: result, error: null });
    } catch (err) {
      setAnalysis({ isLoading: false, content: null, error: 'ไม่สามารถวิเคราะห์ข้อมูลได้ กรุณาลองใหม่ภายหลัง' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 text-gray-900 pb-20 font-sarabun transition-colors duration-500">
      {/* Navbar/Header */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-yellow-400 p-2 rounded-lg shadow-lg transition-colors">
                <School className="w-6 h-6 text-blue-900" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">โรงเรียนบ้านตะโละ</h1>
                <p className="text-white/80 text-xs">ระบบรายงานผลการเรียนออนไลน์</p>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* VIEW: Search */}
        {currentView === 'search' && (
          <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-4 border-yellow-400 animate-fade-in">
             <StudentSearch 
                onSearch={handleSearch} 
                error={error} 
                students={studentsData}
                recentSearches={recentSearches}
                onClearHistory={clearRecentSearches}
                currentYear={CURRENT_YEAR}
             />
          </div>
        )}

        {/* VIEW: Report */}
        {currentView === 'report' && student && (
          <StudentReport 
            student={student} 
            onBack={handleBack}
            analysis={analysis}
            onAnalyze={handleAnalyze}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-blue-900/90 backdrop-blur-sm text-white/70 py-4 border-t border-white/10 z-40 print:hidden transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
           <p className="opacity-80">© 2568 โรงเรียนบ้านตะโละ สำนักงานเขตพื้นที่การศึกษาประถมศึกษาปัตตานี เขต 1</p>
           <div className="flex items-center gap-4">
               <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
               <p className="font-medium text-white">พัฒนาโดย: นางสาวฟิรดาวส์ ตะโละมีแย @2568</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
