import { useState } from 'react';
import { Send, ShieldAlert, Sparkles } from 'lucide-react';
import { askChatbot } from '../services/aiServices';

// message type definition
interface Msg {
  role: 'user' | 'bot' | 'system';
  content: string;
}

export default function ChatBot() {
  const [stdName, setStdName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [chatLog, setChatLog] = useState<Msg[]>([]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState('English');

  const availLangs = ['English', 'Tamil', 'Hindi', 'Spanish', 'French', 'German'];

  // starts the chat session
  function initSession() {
    if (!stdName.trim()) return;
    setIsActive(true);
    setChatLog([
      { role: 'system', content: `Secure session started for: ${stdName}. Fetching relevant data...` },
      { role: 'bot', content: `Hi! I'm here to help with questions about ${stdName}'s progress. What would you like to know?` }
    ]);
  }

  // sends message to backend
  async function sendMessage() {
    if (!query.trim() || !stdName.trim()) return;
    
    const userMsg = query.trim();
    setQuery('');
    setChatLog(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const resp = await askChatbot(stdName, userMsg);
      
      if (resp.blocked) {
        setChatLog(prev => [...prev, { role: 'bot', content: `[Safety Filter]: ${resp.reply}` }]);
      } else {
        let text = resp.reply;
        
        // auto-translate if needed
        if (lang !== 'English') {
          try {
            const apiResp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/translate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, target_lang: lang }),
            });
            const data = await apiResp.json();
            text = data.translated_text;
          } catch (e) {
            console.log("translation failed", e);
          }
        }
        
        setChatLog(prev => [...prev, { role: 'bot', content: text }]);
      }
    } catch (err) {
      setChatLog(prev => [...prev, { role: 'bot', content: "Connection error. Please check if the server is running." }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">StudyMate Chat</h1>
        <p className="text-gray-500">Secure AI insights for personalized learning.</p>
      </div>

      {!isActive ? (
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
            <div className="bg-blue-50 p-5 rounded-full mb-4 text-blue-500">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Start a Conversation</h2>
            <p className="text-gray-500 mb-6 text-center">Enter the student's name to pull up their records.</p>
            
            <div className="flex gap-3 w-full max-w-sm">
              <input 
                type="text" 
                placeholder="Student Name..." 
                value={stdName}
                onChange={(e) => setStdName(e.target.value)}
                className="flex-grow p-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none"
                onKeyDown={(e) => e.key === 'Enter' && initSession()}
              />
              <button 
                onClick={initSession}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
              >
                Access
              </button>
            </div>
        </div>
      ) : (
        <div className="bg-white flex flex-col h-[550px] rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-yellow-400" />
              <span className="font-medium">Student: {stdName}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-gray-800 px-2 py-1 rounded border border-gray-700 outline-none"
              >
                {availLangs.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button 
                onClick={() => setIsActive(false)}
                className="text-gray-400 hover:text-white transition"
              >
                Exit
              </button>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50">
            {chatLog.map((m, i) => (
              m.role === 'system' ? (
                <div key={i} className="text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{m.content}</span>
                </div>
              ) : (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : m.content.includes('[Safety Filter]') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-white border border-gray-200 text-gray-800'}`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  </div>
                </div>
              )
            ))}
            {isTyping && <div className="text-xs text-gray-400 italic">Bot is thinking...</div>}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about performance or goals..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-grow p-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-blue-500"
              />
              <button 
                onClick={sendMessage}
                disabled={isTyping || !query.trim()}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
