import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { synthesizeObservation } from '../services/aiServices';
import { FileText, Send, Loader2, X } from 'lucide-react';

export default function Capture() {
  const [studentName, setStudentName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: 'info', msg: `Document attached: ${e.target.files[0].name}` });
    }
  };

  const handleDeploy = async () => {
    if (!studentName || !file) return alert("Please enter a name and upload a PDF.");
    setLoading(true);
    setStatus({ type: 'info', msg: 'RAG Agent is analyzing the document context...' });

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: storageError } = await supabase.storage
        .from('ai-ed')
        .upload(fileName, file);
      
      if (storageError) throw storageError;

      // 2. Trigger Python RAG Backend
      // The backend now securely handles all the necessary database inserts.
      const aiResult = await synthesizeObservation(studentName, file);
      
      if (!aiResult) {
          throw new Error("Failed to process document");
      }

      setStatus({ type: 'success', msg: 'RAG Synthesis Complete! View the Dashboard.' });
      setStudentName('');
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 mb-3">RAG Ingestion</h2>
          <p className="text-slate-400 font-medium">Upload educational PDFs for autonomous synthesis.</p>
        </div>
        
        <div className="space-y-8">
          <input 
            type="text" placeholder="Student's Name" value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-medium"
          />

          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf" />

          {/* Centered Document Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex flex-col items-center gap-3 p-10 w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all group"
            >
              <FileText size={40} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Click to Upload PDF</span>
            </button>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <span className="text-xs font-bold text-indigo-600 truncate max-w-[250px]">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-indigo-400 hover:text-indigo-600">
                <X size={16} />
              </button>
            </div>
          )}

          <button 
            onClick={handleDeploy} disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
          >
            {loading ? <><Loader2 className="animate-spin" /> Analyzing Context...</> : <><Send size={20}/> Deploy to RAG Agent</>}
          </button>

          {status.msg && (
            <div className={`p-4 rounded-2xl text-sm text-center font-bold ${status.type === 'error' ? 'bg-rose-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {status.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}