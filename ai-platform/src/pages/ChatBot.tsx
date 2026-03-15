import { useState } from 'react';
import { Bot, User, Send, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { askChatbot } from '../services/aiServices';

interface Message {
  role: 'user' | 'bot' | 'system';
  content: string;
}

export default function ChatBot() {
  const [studentName, setStudentName] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState('English');

  const languages = ['English', 'Tamil', 'Hindi', 'Spanish', 'French', 'German'];

  const startSession = () => {
    if (!studentName.trim()) return;
    setSessionActive(true);
    setMessages([
      { role: 'system', content: `GuardRAIL Security Active. End-to-end monitoring enabled for student: ${studentName}. Searching secure educational vault...` },
      { role: 'bot', content: `Hello! I am your AI Educational Assistant. You can ask me any questions about ${studentName}'s educational progress, observations, and insights.` }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || !studentName.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      let result = await askChatbot(studentName, userMsg);
      
      // Handle the GuardRAIL blocked response format explicitly
      if (result.blocked) {
        setMessages((prev) => [...prev, { role: 'bot', content: `[GuardRAIL Alert]: ${result.reply}` }]);
      } else {
        let finalReply = result.reply;
        
        // If target language is not English, translate the reply
        if (targetLang !== 'English') {
          try {
            const transResponse = await fetch('http://localhost:8000/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: finalReply, target_lang: targetLang }),
            });
            const transData = await transResponse.json();
            finalReply = transData.translated_text;
          } catch (transErr) {
            console.error("Translation error:", transErr);
          }
        }
        
        setMessages((prev) => [...prev, { role: 'bot', content: finalReply }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', content: "Network error trying to securely reach the server." }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Security-First Chat</h1>
          <p className="text-slate-500 font-medium">Safe, context-aware RAG retrieval protected by strict LLM GuardRAILs.</p>
        </div>
      </header>

      {!sessionActive ? (
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100 flex flex-col items-center">
           <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-500">
             <ShieldAlert size={48} />
           </div>
           <h2 className="text-2xl font-bold text-slate-800 mb-2">Initialize Secure Session</h2>
           <p className="text-slate-500 mb-8 max-w-sm text-center">To authorize access to the educational vault, please enter the verified student's name.</p>
           
           <div className="flex gap-4 w-full max-w-md">
             <input 
               type="text" 
               placeholder="Enter strictly student's full name" 
               value={studentName}
               onChange={(e) => setStudentName(e.target.value)}
               className="flex-grow p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-medium"
               onKeyDown={(e) => e.key === 'Enter' && startSession()}
             />
             <button 
               onClick={startSession}
               className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
             >
               Verify
             </button>
           </div>
        </div>
      ) : (
        <div className="bg-white flex flex-col h-[600px] rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          
          <div className="flex items-center justify-between bg-slate-900 text-white px-8 py-5">
            <div className="flex items-center gap-4">
              <Sparkles size={20} className="text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm tracking-widest uppercase">Target: {studentName}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1"><ShieldAlert size={12}/> GuardRAIL Active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Language:</span>
                <select 
                  value={targetLang} 
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="text-xs font-bold text-slate-300 bg-transparent outline-none cursor-pointer"
                >
                  {languages.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                </select>
              </div>
              <button 
                onClick={() => setSessionActive(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition"
              >
                Close Session
              </button>
            </div>
          </div>

          <div className="flex-grow p-8 overflow-y-auto space-y-6 bg-slate-50">
            {messages.map((m, idx) => (
              m.role === 'system' ? (
                <div key={idx} className="flex justify-center my-4">
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-2">
                    <ShieldAlert size={14} /> {m.content}
                  </span>
                </div>
              ) : (
                <div key={idx} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <div className={`w-10 h-10 flex-shrink-0 rounded-2xl flex items-center justify-center text-white ${m.role === 'user' ? 'bg-indigo-400' : m.content.includes('[GuardRAIL Alert]') ? 'bg-rose-500' : 'bg-slate-800'}`}>
                      {m.role === 'user' ? <User size={18} /> : m.content.includes('[GuardRAIL Alert]') ? <AlertTriangle size={18} /> : <Bot size={18} />}
                    </div>

                    <div className={`p-5 rounded-3xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : m.content.includes('[GuardRAIL Alert]') ? 'bg-rose-50 border border-rose-100 text-rose-800 rounded-tl-sm font-medium' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>

                  </div>
                </div>
              )
            ))}
            {loading && (
              <div className="flex justify-start w-full">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 flex-shrink-0 bg-slate-200 rounded-2xl animate-pulse"></div>
                  <div className="bg-slate-200 p-4 rounded-full w-24 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder={`Ask educational questions about ${studentName}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-grow p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-medium text-slate-700 transition"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 text-white w-14 h-14 flex flex-shrink-0 items-center justify-center rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
              </button>
            </div>
            <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-wider">
              Protected by LLM GuardRAIL • Data is confidentially monitored
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
