import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { synthesizeObservation } from '../services/aiServices';
import { Mic, Camera, FileText, Send, CheckCircle, Loader2, X } from 'lucide-react';

export default function Capture() {
  const [studentName, setStudentName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: 'info', msg: `Attached: ${e.target.files[0].name}` });
    }
  };

  const handleDeploy = async () => {
    if (!studentName) return alert("Please enter a child's name");
    setLoading(true);
    setStatus({ type: 'info', msg: 'AI Agent is synthesizing multi-modal data...' });

    try {
      let mediaUrl = '';

      // 1. Upload File to Supabase Storage (Bucket: ai-ed)
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from('ai-ed') // UPDATED BUCKET NAME HERE
          .upload(fileName, file);
        
        if (storageError) throw storageError;
        mediaUrl = fileName;
      }

      // 2. Save Observation
      const { data: obsData, error: obsError } = await supabase
        .from('observations')
        .insert([{ 
          student_name: studentName, 
          media_url: mediaUrl,
          media_type: file ? (file.type.startsWith('audio') ? 'audio' : 'document') : 'document',
          raw_transcription: `Manual entry for ${studentName}` 
        }])
        .select().single();

      if (obsError) throw obsError;

      // 3. Trigger Gemini AI Synthesis
      const aiResult = await synthesizeObservation(`Observation for ${studentName}. Media provided: ${file?.name || 'Text only'}`);
      
      if (aiResult) {
        await supabase.from('insights').insert([{
          observation_id: obsData.id,
          summary_teacher: aiResult.teacher_summary,
          summary_parent: aiResult.parent_summary,
          summary_admin: aiResult.admin_summary,
          priority_level: aiResult.priority
        }]);
      }

      setStatus({ type: 'success', msg: 'Deployment Successful! Data synthesized.' });
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
          <h2 className="text-4xl font-black text-slate-900 mb-3">New Observation</h2>
          <p className="text-slate-400 font-medium">Multi-modal data ingestion for early education.</p>
        </div>
        
        <div className="space-y-8">
          <input 
            type="text" placeholder="Child's Full Name" value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-medium"
          />

          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="audio/*,image/*,.pdf" />

          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
              <Mic className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Audio</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
              <Camera className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Photo</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
              <FileText className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Doc</span>
            </button>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <span className="text-xs font-bold text-indigo-600 truncate max-w-[200px]">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-indigo-400 hover:text-indigo-600">
                <X size={16} />
              </button>
            </div>
          )}

          <button 
            onClick={handleDeploy} disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
          >
            {loading ? <><Loader2 className="animate-spin" /> Analyzing...</> : <><Send size={20}/> Deploy to AI Agent</>}
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