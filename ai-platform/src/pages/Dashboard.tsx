import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, User, Shield, Heart, Clock, Edit2, Check, X, ExternalLink, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('insights')
        .select(`
          *,
          kid_documents (
            id,
            file_url,
            kids (
              name_key,
              full_name
            )
          )
        `)
        .order('id', { ascending: false });

      if (error) {
        console.error("Supabase Query Error:", error.message);
      } else {
        setInsights(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditForm({
      full_name: item.kid_documents?.kids?.full_name || '',
      summary_teacher: item.summary_teacher || '',
      summary_parent: item.summary_parent || '',
      summary_admin: item.summary_admin || '',
      priority_level: item.priority_level || 'low'
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (item: any) => {
    try {
      // 1. Update Student Name if changed
      if (editForm.full_name !== item.kid_documents?.kids?.full_name) {
        const nameKey = item.kid_documents?.kids?.name_key;
        if (nameKey) {
          const { error: nameError } = await supabase
            .from('kids')
            .update({ full_name: editForm.full_name })
            .eq('name_key', nameKey);
          
          if (nameError) throw nameError;
        }
      }

      // 2. Update Insight fields
      const { error: insightError } = await supabase
        .from('insights')
        .update({
          summary_teacher: editForm.summary_teacher,
          summary_parent: editForm.summary_parent,
          summary_admin: editForm.summary_admin,
          priority_level: editForm.priority_level
        })
        .eq('id', item.id);

      if (insightError) throw insightError;

      // Refresh data and close editor
      await fetchInsights();
      setEditingId(null);
    } catch (err: any) {
      alert("Error updating record: " + err.message);
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Are you sure you want to delete the record for ${item.kid_documents?.kids?.full_name}? This will remove the insight and the linked document.`)) {
      return;
    }

    try {
      const { error: insightError } = await supabase
        .from('insights')
        .delete()
        .eq('id', item.id);
      
      if (insightError) throw insightError;

      if (item.kid_documents?.id) {
         const { error: docError } = await supabase
          .from('kid_documents')
          .delete()
          .eq('id', item.kid_documents.id);
        
        if (docError) throw docError;
      }

      await fetchInsights();
    } catch (err: any) {
      alert("Error deleting record: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Feed</h1>
          <p className="text-slate-500 font-medium">Review and Edit AI-generated educational insights.</p>
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
                    {item.kid_documents?.kids?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    {editingId === item.id ? (
                      <input 
                        type="text" 
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                        className="font-bold text-slate-900 border-b border-indigo-300 focus:outline-none bg-transparent"
                      />
                    ) : (
                      <h3 className="font-bold text-slate-900">{item.kid_documents?.kids?.full_name || 'Unknown'}</h3>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Clock size={10} /> {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {editingId === item.id ? (
                    <>
                      <button onClick={() => saveEdit(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Save">
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEditing} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Cancel">
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.priority_level === 'high' ? 'bg-rose-100 text-rose-600' : 
                        item.priority_level === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {item.priority_level} Priority
                      </span>
                      <button onClick={() => startEditing(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Data">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Permanent">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6 flex-grow">
                <section>
                  <h4 className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
                    <User size={16} /> Teacher Technical Note
                  </h4>
                  {editingId === item.id ? (
                    <textarea 
                      value={editForm.summary_teacher}
                      onChange={(e) => setEditForm({...editForm, summary_teacher: e.target.value})}
                      className="w-full p-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-300 min-h-[80px]"
                    />
                  ) : (
                    <p className="text-slate-600 text-sm leading-relaxed">{item.summary_teacher}</p>
                  )}
                </section>

                <section>
                  <h4 className="flex items-center gap-2 text-rose-500 font-bold text-sm mb-2">
                    <Heart size={16} /> Parent Engagement
                  </h4>
                  {editingId === item.id ? (
                    <textarea 
                      value={editForm.summary_parent}
                      onChange={(e) => setEditForm({...editForm, summary_parent: e.target.value})}
                      className="w-full p-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-300 min-h-[60px]"
                    />
                  ) : (
                    <p className="text-slate-600 text-sm leading-relaxed italic">"{item.summary_parent}"</p>
                  )}
                </section>

                <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-2">
                    <Shield size={14} /> Admin Compliance Insight
                  </h4>
                  {editingId === item.id ? (
                    <textarea 
                      value={editForm.summary_admin}
                      onChange={(e) => setEditForm({...editForm, summary_admin: e.target.value})}
                      className="w-full p-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-300"
                    />
                  ) : (
                    <p className="text-slate-500 text-[13px] leading-snug">{item.summary_admin}</p>
                  )}
                </section>
                
                {editingId === item.id && (
                  <section>
                    <h4 className="text-slate-800 font-bold text-xs mb-2 uppercase tracking-widest">Priority Level</h4>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(p => (
                        <button
                          key={p}
                          onClick={() => setEditForm({...editForm, priority_level: p})}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${
                            editForm.priority_level === p 
                              ? 'bg-slate-900 text-white shadow-lg' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Footer / Link to actual doc */}
                <div className="pt-4 mt-2 border-t border-slate-50 flex justify-end">
                  <a 
                    href={`http://localhost:8000${item.kid_documents?.file_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:text-indigo-700 transition"
                  >
                    View Original Document <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}