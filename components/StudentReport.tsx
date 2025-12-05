
import React, { useRef } from 'react';
import { Student } from '../types';
import { ArrowLeft, GraduationCap, User, Calendar, Award, Download } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { AIAnalysis } from './AIAnalysis';
import { AnalysisState } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StudentReportProps {
  student: Student;
  onBack: () => void;
  analysis: AnalysisState;
  onAnalyze: () => void;
}

export const StudentReport: React.FC<StudentReportProps> = ({ student, onBack, analysis, onAnalyze }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Transform data for Charts
  const chartData = student.scores.map(s => ({
    fullSubject: s.subjectName,
    subject: s.subjectName.split('(')[0].replace('และ', ' ').split(' ')[0].trim().substring(0, 8) + '..', 
    score: s.score,
    fullMark: 100
  }));

  // Calculate Average
  const totalScore = student.scores.reduce((sum, s) => sum + s.score, 0);
  const averageScore = student.scores.length > 0 ? (totalScore / student.scores.length).toFixed(2) : "0.00";

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-100';
    if (score >= 50) return 'text-orange-700 bg-orange-50 border-orange-100';
    return 'text-red-700 bg-red-50 border-red-100';
  };
  
  const getBarColor = (score: number) => {
    if (score >= 80) return '#059669'; // Emerald
    if (score >= 60) return '#2563eb'; // Blue
    if (score >= 50) return '#d97706'; // Amber/Orange
    return '#dc2626'; // Red
  };

  const getSignatureName = (fullName: string) => {
    const titles = ['ว่าที่ร้อยตรี', 'ว่าที่ร.ต.', 'นางสาว', 'นาง', 'นาย', 'ดร.', 'ผอ.', 'ครู'];
    let cleanName = fullName;
    for (const title of titles) {
        if (cleanName.startsWith(title)) {
            cleanName = cleanName.replace(title, '').trim();
            // Check again in case of multiple titles
            cleanName = cleanName.trim();
        }
    }
    // Return Full Name (First + Last)
    return cleanName;
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    // Hide buttons during capture
    const buttons = document.querySelector('.action-buttons') as HTMLElement;
    if(buttons) buttons.style.display = 'none';

    try {
      // Reduced scale from 2 to 1.5 for smaller file size while maintaining readability
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Use JPEG with 0.85 quality for better compression than PNG
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate ratio to fit within A4
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      const imgX = (pdfWidth - finalWidth) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, finalWidth, finalHeight);
      pdf.save(`ผลการเรียน_${student.firstName}_${student.class}.pdf`);
    } catch (err) {
      console.error("PDF Export Error", err);
      alert("ไม่สามารถสร้าง PDF ได้ในขณะนี้");
    } finally {
        if(buttons) buttons.style.display = 'flex';
    }
  };

  return (
    <div className="animate-fade-in pb-8">
      {/* Action Bar */}
      <div className="action-buttons flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 max-w-[210mm] mx-auto print:hidden">
        <button 
          onClick={onBack}
          className="group inline-flex items-center text-blue-700 hover:text-blue-900 transition-colors font-semibold text-base bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-blue-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          กลับไปหน้าค้นหา
        </button>

        <div className="flex gap-2">
            <button 
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-5 py-2.5 bg-blue-900 text-white font-medium text-base rounded-full shadow-md hover:bg-blue-800 hover:shadow-lg transition-all gap-2 border-2 border-transparent hover:border-yellow-400"
            >
                <Download className="w-5 h-5 text-yellow-400" />
                บันทึกเป็น PDF
            </button>
        </div>
      </div>

      {/* Report Content - A4 Fixed Dimensions */}
      <div className="overflow-x-auto flex justify-center mb-8">
        <div 
            ref={reportRef} 
            className="bg-white shadow-xl border border-gray-200 overflow-hidden text-gray-800 flex flex-col relative print:shadow-none print:border-none print:w-full print:absolute print:top-0 print:left-0"
            style={{ width: '210mm', minHeight: '297mm', height: 'auto' }}
        >
            
            {/* Header Strip */}
            <div className="bg-blue-900 px-8 py-5 border-b-[6px] border-yellow-400 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-yellow-400">
                        <Award className="w-6 h-6 text-blue-900" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide leading-tight">รายงานผลการเรียนรายบุคคล</h1>
                        <p className="text-blue-200 text-base mt-1">คะแนนภาคเรียนที่ 1 ปีการศึกษา {student.academicYear} | โรงเรียนบ้านตะโละ</p>
                        <p className="text-blue-200 text-sm opacity-90">สำนักงานเขตพื้นที่การศึกษาประถมศึกษาปัตตานี เขต 1</p>
                     </div>
                </div>
            </div>

            <div className="p-8 flex-grow flex flex-col">
                {/* Student Info */}
                <div className="mb-6 bg-blue-50/50 rounded-lg border border-blue-100 p-5 relative overflow-hidden shrink-0">
                     <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-bl-full"></div>
                     <div className="flex flex-row justify-between items-end relative z-10">
                        <div>
                            <p className="text-gray-500 text-sm mb-1 font-medium">ชื่อ-นามสกุล</p>
                            <h2 className="text-3xl font-bold text-blue-900 leading-none">{student.firstName} {student.lastName}</h2>
                        </div>
                        <div className="flex gap-8 text-base">
                             <div className="text-right">
                                 <div className="flex items-center justify-end gap-1 text-gray-500 text-xs uppercase font-semibold mb-0.5">
                                     <GraduationCap className="w-4 h-4 text-yellow-500" /> ระดับชั้น
                                 </div>
                                 <div className="font-bold text-gray-900 text-lg">{student.class}</div>
                             </div>
                             <div className="text-right">
                                 <div className="flex items-center justify-end gap-1 text-gray-500 text-xs uppercase font-semibold mb-0.5">
                                     <User className="w-4 h-4 text-yellow-500" /> เลขที่
                                 </div>
                                 <div className="font-bold text-gray-900 text-lg">{parseInt(student.id.slice(-2))}</div>
                             </div>
                             <div className="text-right">
                                 <div className="flex items-center justify-end gap-1 text-gray-500 text-xs uppercase font-semibold mb-0.5">
                                     <Calendar className="w-4 h-4 text-yellow-500" /> ภาคเรียน
                                 </div>
                                 <div className="font-bold text-gray-900 text-lg">{student.semester}</div>
                             </div>
                        </div>
                     </div>
                </div>

                <div className="flex flex-col gap-6 flex-grow">
                    {/* Score Table */}
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-sm"></span>
                            <h3 className="font-bold text-blue-900 text-lg">ผลการเรียนรายวิชา</h3>
                        </div>
                        
                        <div className="overflow-hidden rounded-lg border-2 border-blue-900">
                            <table className="w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-blue-900 text-white">
                                        <th className="px-5 py-3 text-left text-base font-semibold tracking-wide">รายวิชา</th>
                                        <th className="px-4 py-3 text-center text-base font-semibold tracking-wide w-32 bg-blue-800 border-r border-blue-700">คะแนนเต็ม</th>
                                        <th className="px-4 py-3 text-center text-base font-semibold tracking-wide w-32">คะแนนที่ได้</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {student.scores.map((s, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                            <td className="px-5 py-2.5">
                                                <div className="text-[16px] font-bold text-gray-800">{s.subjectName}</div>
                                            </td>
                                            <td className="px-4 py-2.5 text-center border-r border-gray-100">
                                                <span className="text-[16px] text-gray-500 font-medium">100</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className={`inline-block px-3 py-0.5 rounded text-[16px] font-bold border ${getScoreColor(s.score)}`}>
                                                    {s.score}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Average Row */}
                                    <tr className="bg-yellow-50 border-t-2 border-blue-900">
                                        <td className="px-5 py-3 text-right font-bold text-blue-900 text-[16px]">
                                            คะแนนเฉลี่ยรวม
                                        </td>
                                        <td className="px-4 py-3 text-center border-r border-yellow-200">
                                            <span className="text-gray-400 text-[16px]">-</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-lg font-extrabold text-blue-900 px-3 py-0.5 bg-yellow-200 rounded">
                                                {averageScore}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Charts Section - Side by Side and Compact */}
                    <div className="grid grid-cols-2 gap-6 shrink-0 mt-auto">
                         {/* Radar Chart */}
                         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col">
                            <h3 className="font-bold text-gray-700 mb-2 text-base text-center">ศักยภาพรายด้าน</h3>
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke="#1e40af"
                                            strokeWidth={2}
                                            fill="#3b82f6"
                                            fillOpacity={0.2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                         </div>

                         {/* Bar Chart */}
                         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col">
                            <h3 className="font-bold text-gray-700 mb-2 text-base text-center">เปรียบเทียบรายวิชา</h3>
                             <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="subject" tick={{fontSize: 9, fill: '#64748b'}} interval={0} angle={-15} textAnchor="end" height={30}/>
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip 
                                            cursor={{fill: '#f8fafc', opacity: 0.5}}
                                            contentStyle={{ fontSize: '14px', padding: '6px 10px' }}
                                        />
                                        <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Signature Section - Bottom */}
                <div className="mt-8 pt-6 border-t border-gray-100 shrink-0">
                    <div className="grid grid-cols-2 gap-y-10 gap-x-8 items-end">
                        {/* Teacher 1 - Left Column */}
                        <div className="flex justify-center">
                             <div className="flex flex-col items-center">
                                 <div className="flex items-end gap-2 mb-1">
                                     <span className="text-[10px] text-gray-500 font-semibold mb-1">(ลงชื่อ)</span>
                                     <div className="relative w-40">
                                         <div className="text-xl text-blue-900 absolute bottom-[4px] left-0 right-0 text-center" style={{ fontFamily: '"Brush Script MT", "Dancing Script", cursive', fontStyle: 'italic', lineHeight: '1' }}>
                                            {getSignatureName(student.teachers[0])}
                                         </div>
                                         <div className="w-full border-b-[1.5px] border-dotted border-gray-400"></div>
                                     </div>
                                 </div>
                                 <p className="font-bold text-gray-900 text-sm">({student.teachers[0]})</p>
                                 <p className="text-gray-500 text-xs mt-0.5">ครูประจำชั้น</p>
                             </div>
                        </div>

                        {/* Director - Right Column */}
                        <div className="flex justify-center">
                             <div className="flex flex-col items-center">
                                 <div className="flex items-end gap-2 mb-1">
                                     <span className="text-[10px] text-gray-500 font-semibold mb-1">(ลงชื่อ)</span>
                                     <div className="relative w-40">
                                         <div className="text-xl text-blue-900 absolute bottom-[4px] left-0 right-0 text-center" style={{ fontFamily: '"Brush Script MT", "Dancing Script", cursive', fontStyle: 'italic', lineHeight: '1' }}>
                                            {getSignatureName(student.director)}
                                         </div>
                                         <div className="w-full border-b-[1.5px] border-dotted border-gray-400"></div>
                                     </div>
                                 </div>
                                 <p className="font-bold text-gray-900 text-sm">({student.director})</p>
                                 <p className="text-gray-500 text-xs mt-0.5">ผู้อำนวยการโรงเรียน</p>
                             </div>
                        </div>

                        {/* Teacher 2 - Left Column (Below Teacher 1) */}
                        {student.teachers[1] && (
                            <div className="flex justify-center">
                                <div className="flex flex-col items-center">
                                     <div className="flex items-end gap-2 mb-1">
                                         <span className="text-[10px] text-gray-500 font-semibold mb-1">(ลงชื่อ)</span>
                                         <div className="relative w-40">
                                             <div className="text-xl text-blue-900 absolute bottom-[4px] left-0 right-0 text-center" style={{ fontFamily: '"Brush Script MT", "Dancing Script", cursive', fontStyle: 'italic', lineHeight: '1' }}>
                                                {getSignatureName(student.teachers[1])}
                                             </div>
                                             <div className="w-full border-b-[1.5px] border-dotted border-gray-400"></div>
                                         </div>
                                     </div>
                                    <p className="font-bold text-gray-900 text-sm">({student.teachers[1]})</p>
                                    <p className="text-gray-500 text-xs mt-0.5">ครูประจำชั้น</p>
                                </div>
                            </div>
                        )}
                        {/* Empty slot for Director column if teacher 2 exists */}
                        {student.teachers[1] && <div />}
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* AI Analysis Section (Outside Report PDF) */}
      <div className="max-w-[210mm] mx-auto mt-6 print:hidden">
           <AIAnalysis 
              analysis={analysis} 
              onAnalyze={onAnalyze} 
              teacherName={student.teachers[0]}
           />
      </div>
    </div>
  );
};
