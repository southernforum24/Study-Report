import React from 'react';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import { AnalysisState } from '../types';

interface AIAnalysisProps {
  analysis: AnalysisState;
  onAnalyze: () => void;
  teacherName?: string;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis, onAnalyze, teacherName }) => {
  const displayTitle = teacherName 
    ? `คำแนะนำจาก${teacherName.split(' ')[0]} (AI)` 
    : 'ครูแนะแนว AI อัจฉริยะ';

  return (
    <div className="bg-white rounded-2xl p-6 border-l-4 border-yellow-400 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-900 rounded-xl shadow-sm">
            <Bot className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
              <h3 className="text-xl font-bold text-blue-900">{displayTitle}</h3>
              <p className="text-xs text-gray-500">วิเคราะห์ผลการเรียนด้วย Gemini AI</p>
          </div>
        </div>
      </div>

      {!analysis.content && !analysis.isLoading && (
        <div className="text-center py-8 bg-blue-50/50 rounded-xl border border-blue-100 border-dashed">
          <p className="text-gray-600 mb-6 font-medium">
            ให้ {displayTitle} ช่วยวิเคราะห์จุดแข็ง จุดอ่อน และแนะนำแผนการเรียนที่เหมาะสม
          </p>
          <button
            onClick={onAnalyze}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold text-sm leading-tight uppercase rounded-full shadow-md hover:shadow-lg hover:from-yellow-500 hover:to-yellow-600 focus:outline-none transition-all duration-200 gap-2 transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            ขอคำแนะนำ
          </button>
        </div>
      )}

      {analysis.isLoading && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
          <p className="text-blue-900 font-bold animate-pulse">กำลังปรึกษา{teacherName ? teacherName.split(' ')[0] : 'ครูแนะแนว'}... รอสักครู่</p>
        </div>
      )}

      {analysis.content && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap shadow-inner">
          {analysis.content}
        </div>
      )}
      
      {analysis.error && (
        <div className="text-red-500 text-center py-6 bg-red-50 rounded-xl border border-red-100">
            <p className="font-bold">{analysis.error}</p>
            <button onClick={onAnalyze} className="mt-2 text-sm underline hover:text-red-700">ลองใหม่อีกครั้ง</button>
        </div>
      )}
    </div>
  );
};