'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // 🚀 1. This is what changes the page!

export default function AIConcierge() {
  const router = useRouter(); // 2. Initialize router
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 
  
  const scrollRef = useRef(null);

  const quickActions = [
    { label: "Book a Car", text: "I want to book a car right now." },
    { label: "View Fleet", text: "Show me your luxury cars." },
    { label: "Rental Rules", text: "What are your rental rules?" },
    { label: "Group Travel", text: "I have a group of 10 people." }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      scrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleQuickAction = (text) => {
    sendMessage(text);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const sendMessage = async (content) => {
    const userMsg = { role: 'user', content: content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const chatHistory = [...messages, userMsg];
    setMessages(chatHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!response.ok) throw new Error("Backend failed");

      setMessages((prev) => [...prev, { role: 'assistant', content: '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastIndex = newMsgs.length - 1;
          let currentText = newMsgs[lastIndex].content + chunk;

          // ✨ 3. THE SPY INTERCEPTOR ✨
          // It looks for the secret code as it is streaming in
          const commandRegex = /\[NAVIGATE:\s*(.*?)\]/;
          const match = currentText.match(commandRegex);
          
          if (match) {
            const routeTarget = match[1].trim(); // Grabs "/booking" or "/our-fleet"
            currentText = currentText.replace(match[0], ''); // Deletes it so you don't see it!
            
            // 🚀 Instantly change the page!
            router.push(routeTarget); 
          }

          newMsgs[lastIndex].content = currentText;
          return newMsgs;
        });
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting.', time: 'Error' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[600px] border rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 border-gray-100">
          
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                🚗
              </div>
              <div>
                <p className="font-bold text-base leading-tight">A.D Cars AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-[10px] uppercase tracking-tighter opacity-80">Online & Ready</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-2 rounded-full transition-all active:scale-90">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8fafc]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <p className="text-gray-800 font-extrabold text-xl mb-2">Luxury Awaits</p>
                <p className="text-gray-500 text-xs mb-8">Welcome to A.D Cars Rental. Let me help you select the perfect vehicle.</p>
                
                <div className="grid grid-cols-1 gap-2 w-full">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.text)}
                      className="text-xs font-semibold p-3.5 bg-white border border-gray-100 text-blue-600 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left shadow-sm flex items-center justify-between group"
                    >
                      {action.label}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-[14px] leading-relaxed max-w-[85%] shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
                {m.time && <span className="text-[9px] text-gray-400 mt-1 px-1">{m.time}</span>}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex gap-2 items-center bg-gray-100 rounded-2xl px-3 py-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your request..."
                className="flex-1 py-3 bg-transparent border-none text-sm text-black outline-none placeholder:text-gray-400"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-200 active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center justify-center text-white transition-all duration-500 hover:scale-110 active:scale-90 relative ${
          isOpen ? 'bg-slate-800 rotate-[360deg]' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177V3.945a1.125 1.125 0 0 1 2.25 0v4.23" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white/30 backdrop-blur-sm border border-white/50"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}