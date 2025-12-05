
import React, { useState } from 'react';
import { Student, SubjectScore } from '../types';
import { GRADE_CONFIG, calculateGrade, getCategory, DIRECTOR, YEAR_OPTIONS } from '../constants';
import { UserPlus, Save, ArrowLeft, Edit, Plus, Users, School, Search, Calendar, User, FileText, Trash2, X } from 'lucide-react';

interface TeacherPortalProps {
  students: Student[];
  onUpdateStudent: (student: Student) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onLogout: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ students, onUpdateStudent, onAddStudent, onDeleteStudent, onLogout }) => {
  const [selectedGrade, setSelectedGrade] = useState<string>("ป.1");
  const [selectedYear, setSelectedYear] = useState<string>("2568");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  // Filter students by grade, year and search query
  const filteredStudents = students.filter(s => {
      const inGrade = s.class === selectedGrade;
      const inYear = s.academicYear === selectedYear;
      const matchesSearch = filterQuery === "" || 
                            s.firstName.includes(filterQuery) || 
                            s.lastName.includes(filterQuery);
      return inGrade && inYear && matchesSearch;
  });

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setFilterQuery(""); // Reset search when changing grade
    setEditingStudent(null);
    setIsAddingNew(false);
  };

  const handleYearChange = (year: string) => {
      setSelectedYear(year);
      setFilterQuery("");
      setEditingStudent(null);
      setIsAddingNew(false);
  }

  const handleEditClick = (student: Student) => {
    setEditingStudent({ ...student });
    setIsAddingNew(false);
  };

  const handleDeleteClick = (student: Student) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายชื่อนักเรียน: ${student.firstName} ${student.lastName}?`)) {
        onDeleteStudent(student.id);
    }
  };

  const handleEditViewDelete = () => {
    if (!editingStudent) return;
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายชื่อนักเรียน: ${editingStudent.firstName} ${editingStudent.lastName}?\nการกระทำนี้ไม่สามารถเรียกคืนได้`)) {
        onDeleteStudent(editingStudent.id);
        setEditingStudent(null);
        setIsAddingNew(false);
    }
  };

  const handleAddNewClick = () => {
    const config = GRADE_CONFIG[selectedGrade];
    const emptyScores: SubjectScore[] = config.subjects.map(sub => ({
      subjectName: sub,
      score: 0,
      fullScore: 100,
      grade: "0",
      category: getCategory(sub)
    }));

    // Generate Sequential ID based on CURRENT FILTERED LIST (or all in that grade/year)
    const allInGradeYear = students.filter(s => s.class === selectedGrade && s.academicYear === selectedYear);
    const gradeNum = selectedGrade.replace('ป.', '');
    const currentSequences = allInGradeYear.map(s => {
        if (s.id.startsWith(gradeNum)) {
            return parseInt(s.id.substring(gradeNum.length)) || 0;
        }
        return 0;
    });
    
    const maxSeq = currentSequences.length > 0 ? Math.max(...currentSequences) : 0;
    const nextSeq = maxSeq + 1;
    // Format: GradeNum + Sequence (e.g., 101, 125)
    const newId = `${gradeNum}${String(nextSeq).padStart(2, '0')}`;

    const newStudent: Student = {
      id: newId, 
      firstName: "",
      lastName: "",
      class: selectedGrade,
      semester: `1/${selectedYear}`,
      academicYear: selectedYear,
      image: "",
      gpa: 0,
      scores: emptyScores,
      teachers: config.teachers,
      director: DIRECTOR
    };

    setEditingStudent(newStudent);
    setIsAddingNew(true);
  };

  const handleScoreChange = (index: number, val: string) => {
    if (!editingStudent) return;
    
    const newScores = [...editingStudent.scores];
    let numVal = parseFloat(val);
    if (isNaN(numVal)) numVal = 0;
    if (numVal > 100) numVal = 100;
    if (numVal < 0) numVal = 0;

    newScores[index] = {
      ...newScores[index],
      score: numVal,
      grade: calculateGrade(numVal)
    };

    setEditingStudent({ ...editingStudent, scores: newScores });
  };

  const handleSubjectNameChange = (index: number, val: string) => {
    if (!editingStudent) return;
    const newScores = [...editingStudent.scores];
    newScores[index] = { ...newScores[index], subjectName: val };
    setEditingStudent({ ...editingStudent, scores: newScores });
  };

  const handleDeleteSubject = (index: number) => {
    if (!editingStudent) return;
    if (window.confirm("ยืนยันลบวิชานี้ออก?")) {
        const newScores = editingStudent.scores.filter((_, i) => i !== index);
        setEditingStudent({ ...editingStudent, scores: newScores });
    }
  };

  const handleAddSubject = () => {
    if (!editingStudent) return;
    const newSubject: SubjectScore = {
        subjectName: "วิชาใหม่ (แก้ไขได้)",
        score: 0,
        fullScore: 100,
        grade: "0",
        category: 'Activity'
    };
    setEditingStudent({ ...editingStudent, scores: [...editingStudent.scores, newSubject] });
  };

  const handleNameChange = (field: 'firstName' | 'lastName', val: string) => {
    if (!editingStudent) return;
    setEditingStudent({ ...editingStudent, [field]: val });
  };

  const handleSave = () => {
    if (!editingStudent) return;
    
    // Recalculate GPA
    const totalGrade = editingStudent.scores.reduce((sum, s) => sum + parseFloat(s.grade), 0);
    const gpa = editingStudent.scores.length > 0 ? totalGrade / editingStudent.scores.length : 0;
    
    const studentToSave = {
        ...editingStudent,
        gpa: parseFloat(gpa.toFixed(2))
    };

    if (isAddingNew) {
        onAddStudent(studentToSave);
    } else {
        onUpdateStudent(studentToSave);
    }
    
    setEditingStudent(null);
    setIsAddingNew(false);
    alert("บันทึกข้อมูลเรียบร้อยแล้ว");
  };

  if (editingStudent) {
    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border-2 border-yellow-400 overflow-hidden animate-fade-in mb-10">
            <div className="bg-gradient-to-r from-purple-800 to-pink-600 p-6 border-b-4 border-yellow-400 flex justify-between items-center sticky top-0 z-20 shadow-md">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    {isAddingNew ? <UserPlus className="w-6 h-6 text-yellow-300" /> : <Edit className="w-6 h-6 text-yellow-300" />}
                    <span className="text-yellow-50">{isAddingNew ? "เพิ่มรายชื่อนักเรียน" : "แก้ไขข้อมูลนักเรียน"}</span>
                    <span className="hidden sm:inline-block text-sm bg-white/20 px-2 py-0.5 rounded text-white ml-2">ปี {editingStudent.academicYear}</span>
                </h2>
                <button 
                    onClick={() => setEditingStudent(null)} 
                    type="button" 
                    className="text-pink-100 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20"
                >
                    <ArrowLeft className="w-4 h-4" /> ยกเลิก
                </button>
            </div>
            
            <div className="p-4 md:p-8">
                {/* Personal Info Section */}
                <h3 className="text-lg font-bold text-purple-800 mb-4 border-b border-purple-100 pb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-yellow-500" />
                    ข้อมูลทั่วไป (แก้ไขชื่อ-นามสกุล)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-purple-50 p-6 rounded-lg border border-purple-100 shadow-inner">
                    <div className="relative group">
                        <label className="block text-sm font-bold text-purple-900 mb-2">ชื่อ (First Name)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={editingStudent.firstName}
                                onChange={(e) => handleNameChange('firstName', e.target.value)}
                                className="w-full pl-4 pr-10 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-purple-900 bg-white shadow-sm text-lg font-medium relative z-0"
                                placeholder="ระบุชื่อจริง..."
                            />
                            {editingStudent.firstName && (
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNameChange('firstName', '');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-2 bg-white/80 rounded-full z-20 cursor-pointer"
                                    title="ล้างชื่อ"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="block text-sm font-bold text-purple-900 mb-2">นามสกุล (Last Name)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={editingStudent.lastName}
                                onChange={(e) => handleNameChange('lastName', e.target.value)}
                                className="w-full pl-4 pr-10 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-purple-900 bg-white shadow-sm text-lg font-medium relative z-0"
                                placeholder="ระบุนามสกุล..."
                            />
                            {editingStudent.lastName && (
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNameChange('lastName', '');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-2 bg-white/80 rounded-full z-20 cursor-pointer"
                                    title="ล้างนามสกุล"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scores Section */}
                <h3 className="text-lg font-bold text-purple-800 mb-4 border-b border-purple-100 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-yellow-500" />
                        ข้อมูลรายวิชาและคะแนน
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        * กดที่ชื่อวิชาเพื่อแก้ไข
                    </span>
                </h3>
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {editingStudent.scores.map((score, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all group">
                            <div className="flex-grow w-full relative">
                                <label className="text-xs text-purple-400 font-bold mb-1 block sm:hidden">ชื่อวิชา</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={score.subjectName}
                                        onChange={(e) => handleSubjectNameChange(idx, e.target.value)}
                                        className="w-full bg-transparent border-b border-dashed border-gray-300 text-base font-bold text-gray-800 focus:outline-none focus:border-yellow-500 focus:bg-yellow-50 px-2 py-1 transition-colors pr-10 relative z-0"
                                        placeholder="ชื่อวิชา"
                                    />
                                    {score.subjectName && (
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSubjectNameChange(idx, '');
                                            }}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors p-2 z-20 cursor-pointer"
                                            title="ล้างชื่อวิชา"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500 font-bold sm:hidden">คะแนน:</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        value={score.score}
                                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-blue-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-gray-50 text-lg"
                                    />
                                </div>
                                <div className="h-8 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteSubject(idx);
                                    }}
                                    className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-100 flex-shrink-0 cursor-pointer relative z-20"
                                    title="ลบรายวิชานี้"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        type="button"
                        onClick={handleAddSubject}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-purple-200 text-purple-600 bg-purple-50 hover:bg-yellow-50 hover:border-yellow-400 hover:text-purple-800 transition-all font-bold group"
                    >
                        <div className="bg-white p-1 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5" />
                        </div>
                        เพิ่มวิชาใหม่
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                    {/* Delete Student Button */}
                    {!isAddingNew && (
                        <button 
                            type="button"
                            onClick={handleEditViewDelete}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold border border-transparent hover:border-red-200 w-full sm:w-auto justify-center cursor-pointer z-10"
                        >
                            <Trash2 className="w-4 h-4" />
                            ลบนักเรียนคนนี้
                        </button>
                    )}
                    {isAddingNew && <div></div>} {/* Spacer */}

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                            type="button"
                            onClick={() => setEditingStudent(null)}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button 
                            type="button"
                            onClick={handleSave}
                            className="flex-1 sm:flex-none px-8 py-3 rounded-full bg-yellow-400 text-purple-900 font-bold hover:bg-yellow-500 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 text-lg"
                        >
                            <Save className="w-5 h-5" />
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        {/* Header Dashboard */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-8 border-yellow-400 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5">
                <Users className="w-40 h-40 text-purple-900" />
            </div>
            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
                   ระบบจัดการข้อมูล <span className="text-pink-500 text-lg font-normal">(Teacher Portal)</span>
                </h2>
                <p className="text-purple-600 text-sm mt-1">ยินดีต้อนรับคุณครู กรุณาเลือกปีการศึกษาและชั้นเรียนเพื่อจัดการรายชื่อและคะแนน</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                 {/* Year Selector for Teacher */}
                 <div className="flex items-center bg-purple-50 rounded-full px-4 py-2 border border-purple-200 shadow-sm">
                     <Calendar className="w-4 h-4 text-purple-600 mr-2" />
                     <span className="text-sm text-purple-900 font-bold mr-2">ปีการศึกษา:</span>
                     <select 
                        value={selectedYear}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="bg-transparent font-bold text-pink-600 outline-none cursor-pointer"
                     >
                         {YEAR_OPTIONS.map(year => (
                             <option key={year} value={year}>{year}</option>
                         ))}
                     </select>
                 </div>

                <button 
                    onClick={onLogout}
                    className="px-5 py-2 rounded-full bg-white text-purple-700 font-bold hover:bg-pink-50 transition-colors text-sm border border-purple-200 shadow-sm"
                >
                    ออกจากระบบ
                </button>
            </div>
        </div>

        {/* Grade Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
            {Object.keys(GRADE_CONFIG).map(grade => (
                <button
                    key={grade}
                    onClick={() => handleGradeChange(grade)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm transform hover:-translate-y-0.5 border-2 ${
                        selectedGrade === grade 
                        ? 'bg-yellow-400 text-purple-900 border-yellow-400 ring-2 ring-purple-200' 
                        : 'bg-white text-purple-800 hover:bg-pink-50 border-purple-100'
                    }`}
                >
                    {grade}
                </button>
            ))}
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
            <div className="p-6 border-b border-purple-100 flex flex-col sm:flex-row justify-between items-center bg-purple-50/50 gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-purple-100">
                        <School className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                        <h3 className="font-bold text-purple-900 text-lg">รายชื่อนักเรียนชั้น {selectedGrade}</h3>
                        <div className="flex gap-2">
                             <span className="text-pink-500 text-xs font-bold">{filteredStudents.length} คน</span>
                             <span className="text-purple-400 text-xs">|</span>
                             <span className="text-purple-500 text-xs">ปีการศึกษา {selectedYear}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search in List */}
                    <div className="relative flex-grow sm:flex-grow-0">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-purple-400" />
                         </div>
                         <input 
                            type="text" 
                            className="pl-9 pr-4 py-2 rounded-full border border-purple-200 text-sm focus:ring-2 focus:ring-pink-300 outline-none w-full sm:w-64"
                            placeholder="ค้นหาชื่อในรายการ..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                         />
                    </div>

                    <button 
                        onClick={handleAddNewClick}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold text-sm hover:from-pink-600 hover:to-purple-700 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 text-yellow-300" /> เพิ่มนักเรียน
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-purple-900 text-yellow-400 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-center w-20">เลขที่</th>
                            <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                            <th className="px-6 py-4 text-center">จำนวนวิชา</th>
                            <th className="px-6 py-4 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-16 text-center text-purple-400">
                                    <Users className="w-16 h-16 mx-auto text-purple-200 mb-3" />
                                    {filterQuery ? "ไม่พบชื่อที่ค้นหา" : `ยังไม่มีข้อมูลนักเรียนในปี ${selectedYear}`}
                                    {!filterQuery && (
                                        <div className="mt-2">
                                            <button onClick={handleAddNewClick} className="text-pink-500 font-bold underline hover:text-pink-700 text-sm">
                                                เพิ่มนักเรียนคนแรก
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student, index) => (
                                <tr key={student.id} className="hover:bg-yellow-50 transition-colors group">
                                    <td className="px-6 py-4 text-center font-bold text-purple-900">
                                        <span className="inline-block w-8 h-8 rounded-full bg-purple-100 leading-8 text-purple-800 text-sm group-hover:bg-yellow-300 group-hover:text-purple-900 transition-colors">
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{student.firstName} {student.lastName}</td>
                                    <td className="px-6 py-4 text-center text-purple-500 text-sm font-medium">
                                        {student.scores.length} วิชา
                                    </td>
                                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleEditClick(student)}
                                            className="inline-flex items-center gap-1 px-4 py-1.5 bg-white border border-pink-200 text-pink-600 rounded-full text-sm font-medium hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all shadow-sm"
                                        >
                                            <Edit className="w-3 h-3" /> แก้ไขข้อมูล
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteClick(student)}
                                            className="p-1.5 bg-white border border-red-200 text-red-500 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm cursor-pointer z-10"
                                            title="ลบรายชื่อ"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
