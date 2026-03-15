
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Capture from './pages/Capture';
import Dashboard from './pages/Dashboard';
import ChatBot from './pages/ChatBot';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-12 py-5 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-slate-900">AI<span className="text-indigo-600">Education</span></span>
          </div>
          <div className="flex gap-10">
            <Link to="/" className="text-slate-500 hover:text-indigo-600 font-bold text-sm uppercase tracking-widest transition-all">Capture</Link>
            <Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 font-bold text-sm uppercase tracking-widest transition-all">Dashboard</Link>
            <Link to="/chat" className="text-slate-500 hover:text-indigo-600 font-bold text-sm uppercase tracking-widest transition-all">Secure Chat</Link>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto py-16 px-6">
          <Routes>
            <Route path="/" element={<Capture />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatBot />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}