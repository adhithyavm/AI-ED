import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, User, Shield, Heart, AlertCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
  setLoading(true);
  console.log("Fetching insights from Supabase...");

  try {
    // Simplified query: Fetch everything from insights and the related observation
    const { data, error } = await supabase
      .from('insights')
      .select(`
        *,
        observations (
          student_name,
          created_at
        )
      `)
      // Use the insights created_at for ordering to avoid the 'inner' requirement
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase Query Error:", error.message);
    } else {
      console.log("Successfully fetched data:", data);
      setInsights(data || []);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Feed</h1>
          <p className="text-slate-500 font-medium">Autonomous synthesis for multi-modal student data.</p>
        </div>
        <button 
          onClick={fetchInsights}
          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-100 transition"
        >
          Refresh Data
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse">Syncing with AI Agent...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-4 text-slate-300">
            <Sparkles size={48} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Insights Processed</h2>
          <p className="text-slate-400 max-w-xs mx-auto mt-2">Captured observations will be synthesized by the AI and appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {insights.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {item.observations.student_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.observations.student_name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Clock size={10} /> {new Date(item.observations.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.priority_level === 'high' ? 'bg-rose-100 text-rose-600' : 
                  item.priority_level === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {item.priority_level} Priority
                </span>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6 flex-grow">
                <section>
                  <h4 className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
                    <User size={16} /> Teacher Technical Note
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.summary_teacher}</p>
                </section>

                <section>
                  <h4 className="flex items-center gap-2 text-rose-500 font-bold text-sm mb-2">
                    <Heart size={16} /> Parent Engagement
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{item.summary_parent}"</p>
                </section>

                <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-2">
                    <Shield size={14} /> Admin Compliance Insight
                  </h4>
                  <p className="text-slate-500 text-[13px] leading-snug">{item.summary_admin}</p>
                </section>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}