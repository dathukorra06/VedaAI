import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, UploadCloud, X, Plus } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useStore } from '../store/store';


const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Answer Questions",
  "Long Answer Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems"
];

export default function CreateView() {
  const { setView, setCurrentAssignment, currentAssignment, jobStatus, jobProgress, jobMessage } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    className: '',
    dueDate: '',
    fileText: '',
    additionalInfo: '',
    questionTypes: [
      { id: '1', type: "Multiple Choice Questions", count: 4, marks: 1 },
      { id: '2', type: "Short Answer Questions", count: 3, marks: 2 }
    ]
  });

  useEffect(() => {
    if (currentAssignment && !currentAssignment._id) {
        setForm(prev => ({
            ...prev,
            title: currentAssignment.title || prev.title,
            subject: currentAssignment.subject || prev.subject,
            className: currentAssignment.className || prev.className,
            dueDate: currentAssignment.dueDate || prev.dueDate,
            questionTypes: currentAssignment.questionTypes || prev.questionTypes
        }));
    }
  }, [currentAssignment]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  // Keep socket alive

  const handleCreate = async () => {
    // Validate
    let e: any = {};
    if (!form.title) e.title = true;
    if (!form.subject) e.subject = true;
    if (!form.className) e.className = true;
    if (!form.dueDate) e.dueDate = true;
    if (Object.keys(e).length > 0) return setErrors(e);

    setStep(2);
    useStore.getState().setJobInfo('processing', 10, 'Job queued...');
    
    // Simulate progress updates for synchronous serverless generation
    const progressInterval = setInterval(() => {
        const currentProgress = useStore.getState().jobProgress;
        if (currentProgress < 90) {
            useStore.getState().setJobInfo('processing', currentProgress + 5, 'Generating AI assignment...');
        }
    }, 1500);

    try {
      const { data } = await axios.post(`${API_URL}/api/assignments`, form);
      clearInterval(progressInterval);
      
      const { assignment, paper } = data;
      setCurrentAssignment(assignment);
      useStore.getState().setJobInfo('done', 100, 'Question paper ready!');
      if (paper) useStore.getState().setGeneratedPaper(paper);
      
      setTimeout(() => useStore.getState().setView('output'), 800);
    } catch (err: any) {
      clearInterval(progressInterval);
      useStore.getState().setJobInfo('error', 0, 'Generation failed');
      alert("Failed to create assignment");
      console.error(err);
    }
  };

  const addQType = () => {
    const nextId = String(Date.now());
    setForm(f => ({ ...f, questionTypes: [...f.questionTypes, { id: nextId, type: "Short Answer Questions", count: 1, marks: 1 }] }));
  };

  const removeQType = (id: string) => {
    setForm(f => ({ ...f, questionTypes: f.questionTypes.filter(q => q.id !== id) }));
  };

  const updateQType = (id: string, key: string, value: any) => {
    setForm(f => ({
      ...f, questionTypes: f.questionTypes.map(q => q.id === id ? { ...q, [key]: value } : q)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFile(file);
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      try {
          const res = await axios.post(`${API_URL}/api/assignments/upload`, fd);
          setForm(f => ({ ...f, fileText: res.data.text }));
      } catch (err) {
          console.error(err);
      } finally {
          setUploading(false);
      }
  };

  const totalQuestions = form.questionTypes.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalMarks = form.questionTypes.reduce((acc, curr) => acc + ((curr.count || 0) * (curr.marks || 0)), 0);

  if (step === 2) {
    if (jobStatus === 'done') {
        setTimeout(() => setView('output'), 1000);
    }
    
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-10 h-full">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 text-center">
            {jobStatus === 'error' ? (
                <>
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <X size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-playfair font-bold text-[#1a1a2e] mb-2">Generation Failed</h2>
                <p className="text-gray-500 mb-8">{jobMessage}</p>
                <button onClick={() => setStep(1)} className="bg-[#1a1a2e] text-white px-6 py-2 rounded-full">Try Again</button>
                </>
            ) : (
                <>
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <svg className="w-full h-full text-gray-200" viewBox="0 0 36 36">
                        <path className="fill-none stroke-current stroke-[3]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="fill-none stroke-[#3A86FF] stroke-[3]" strokeDasharray={`${jobProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-[#1a1a2e] font-mono">
                        {Math.round(jobProgress)}%
                    </div>
                </div>
                <h2 className="text-2xl font-playfair font-bold text-[#1a1a2e] mb-2">
                   {jobStatus === 'done' ? 'Complete!' : 'AI is thinking...'}
                </h2>
                <p className="text-gray-500">{jobMessage || "Initializing..."}</p>
                </>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 h-full overflow-auto bg-[#f7f7fb]">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
        <h1 className="text-3xl font-bold font-playfair text-[#1a1a2e] mb-2">Create Assignment</h1>
        <p className="text-gray-500 mb-10">Set up a new assignment for your students.</p>

        <div className="space-y-8">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-blue-400 transition-colors bg-gray-50 relative group">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".pdf,.txt" />
                <UploadCloud className="mx-auto text-gray-400 mb-4 group-hover:text-blue-500 transition-colors" size={40} />
                <h3 className="font-semibold text-gray-700 mb-1">Choose a file or drag & drop it here</h3>
                <p className="text-sm text-gray-500">{file ? file.name : "PDF, TXT up to 10MB"}</p>
                {uploading && <div className="mt-4 text-blue-500 font-medium">Extracting text...</div>}
                {form.fileText && !uploading && <div className="mt-4 text-green-500 font-medium">Text Extracted Successfully!</div>}
                <button className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold shadow-sm text-gray-700">Browse Files</button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={`w-full p-4 bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E84855]`} placeholder="e.g. Science Midterm" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date <span className="text-red-500">*</span></label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className={`w-full p-4 bg-gray-50 border ${errors.dueDate ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E84855] text-gray-700`} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
                    <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className={`w-full p-4 bg-gray-50 border ${errors.subject ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E84855]`} placeholder="e.g. Science" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Class Section <span className="text-red-500">*</span></label>
                    <input type="text" value={form.className} onChange={e => setForm({...form, className: e.target.value})} className={`w-full p-4 bg-gray-50 border ${errors.className ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E84855]`} placeholder="e.g. Grade 8" />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold font-playfair text-[#1a1a2e] mb-4 border-b pb-2">Question Types</h3>
                
                <div className="space-y-4">
                    <div className="flex font-semibold text-sm text-gray-500 px-4">
                        <div className="flex-[3]">Type</div>
                        <div className="flex-1 text-center">No. of Qs</div>
                        <div className="flex-1 text-center">Marks/Q</div>
                        <div className="w-10"></div>
                    </div>
                    {form.questionTypes.map((q) => (
                        <div key={q.id} className="flex items-center gap-4 bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                            <div className="flex-[3]">
                                <select value={q.type} onChange={(e) => updateQType(q.id, 'type', e.target.value)} className="w-full bg-transparent font-medium text-gray-700 focus:outline-none">
                                    {QUESTION_TYPES.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 flex justify-center items-center">
                                <button onClick={() => updateQType(q.id, 'count', Math.max(1, q.count - 1))} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md font-mono hover:bg-gray-200">-</button>
                                <span className="w-12 text-center font-mono font-bold text-lg">{q.count}</span>
                                <button onClick={() => updateQType(q.id, 'count', q.count + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md font-mono hover:bg-gray-200">+</button>
                            </div>
                            <div className="flex-1 flex justify-center items-center">
                                <button onClick={() => updateQType(q.id, 'marks', Math.max(1, q.marks - 1))} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md font-mono hover:bg-gray-200">-</button>
                                <span className="w-12 text-center font-mono font-bold text-lg">{q.marks}</span>
                                <button onClick={() => updateQType(q.id, 'marks', q.marks + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md font-mono hover:bg-gray-200">+</button>
                            </div>
                            <button onClick={() => removeQType(q.id)} className="w-10 flex justify-end text-gray-400 hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    ))}

                    <button onClick={addQType} className="flex items-center text-sm font-semibold text-[#1a1a2e] bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <Plus size={16} className="mr-2" /> Add Question Type
                    </button>
                </div>

                <div className="mt-8 flex justify-end">
                    <div className="text-right">
                        <div className="text-gray-500 text-sm font-medium">Total Questions: <span className="text-[#1a1a2e] font-bold text-lg ml-2">{totalQuestions}</span></div>
                        <div className="text-gray-500 text-sm font-medium mt-1">Total Marks: <span className="text-[#1a1a2e] font-bold text-lg ml-2">{totalMarks}</span></div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information (For better output)</label>
                <textarea 
                    value={form.additionalInfo}
                    onChange={e => setForm({...form, additionalInfo: e.target.value})}
                    placeholder="e.g. Generate a question paper for 3-hour exam duration focusing on Chapter 4 & 5."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E84855] min-h-[120px] resize-none text-gray-700"
                ></textarea>
            </div>

        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
            <button onClick={() => setView('list')} className="px-6 py-3 border border-gray-200 rounded-full font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center">
                <ArrowLeft size={18} className="mr-2" /> Previous
            </button>
            <button onClick={handleCreate} className="px-8 py-3 bg-[#1a1a2e] rounded-full font-semibold text-white shadow-lg hover:bg-[#2d2d46] hover:-translate-y-1 transition-all flex items-center">
                Next <ArrowRight size={18} className="ml-2" />
            </button>
        </div>

      </div>
    </div>
  );
}
