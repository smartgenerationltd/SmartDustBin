import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { apiService } from '../../services/api';
import { WasteClassificationResult } from '../../types';
import {
  Bot,
  Sparkles,
  Send,
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

export const AIAssistantView: React.FC = () => {
  const { bins, collections, alerts } = useSmartBin();

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am the SG SmartBin Operational Intelligence Assistant powered by SG AI Agency. You can ask me about live Kigali fill levels, critical overflow bins, route dispatch optimization, or sensor anomalies.',
      timestamp: 'Just now',
      source: 'SG AI Fleet Engine',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Vision Classifier State
  const [itemInput, setItemInput] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<WasteClassificationResult | null>(
    null
  );

  const sampleQuestions = [
    'Which SmartBins require immediate collection right now?',
    'What is the highest fill compartment across Kigali today?',
    'Suggest an optimized route for Nyarugenge and Gasabo collectors.',
    'Are there any station hardware temperature or battery alarms?',
  ];

  const sampleItems = [
    'Plastic water bottle (PET)',
    'Banana peels and food leftovers',
    'Aluminum soda can',
    'Soiled greasy pizza box',
    'Glass juice bottle',
    'Polystyrene foam takeout box',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoadingChat(true);

    try {
      const response = await apiService.askOperationalAI(textToSend, {
        bins,
        collectionQueue: collections,
        alertsContext: alerts,
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleClassifyWaste = async (customItem?: string) => {
    const item = customItem || itemInput;
    if (!item.trim()) return;

    setIsClassifying(true);
    try {
      const result = await apiService.classifyWaste(item);
      setClassificationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div id="ai-assistant-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                GEMINI 2.5 OPERATIONAL INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400">SG AI Agency</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              AI Smart Operations & Computer Vision Classification
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time reasoning across live ESP32 ultrasonic sensors and automated computer vision sorting for the three SmartBin compartments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Fleet Context: 12 Bins Synchronized
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Chatbot + Right Vision Classifier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Operational Fleet Chatbot */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Smart Fleet AI Dispatch Copilot</h3>
                <span className="text-[10px] text-emerald-400 font-mono">Live Grounding Enabled</span>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: '1',
                    sender: 'ai',
                    text: 'Chat history cleared. How can I assist you with SG SmartBin operations?',
                    timestamp: 'Just now',
                  },
                ])
              }
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {/* Quick Questions Chips */}
          <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <div
                    className={`mt-1.5 flex items-center justify-between text-[10px] ${
                      m.sender === 'user' ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {m.source && <span className="font-mono text-emerald-400">{m.source}</span>}
                  </div>
                </div>
              </div>
            ))}

            {isLoadingChat && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 animate-pulse">
                  Analyzing Kigali ultrasonic telemetry and computing optimal response...
                </div>
              </div>
            )}
          </div>

          {/* Input Row */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI Copilot regarding bins, routes, fill anomalies..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoadingChat || !inputQuery.trim()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Right 5 cols: AI Waste Classifier & Vision Simulator */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">AI Waste Segregation Vision</h3>
                  <span className="text-[10px] text-sky-400 font-mono">3-Compartment Auto-Routing</span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                Smart Sorter
              </span>
            </div>

            {/* Prompt Input / Presets */}
            <div className="space-y-3 mt-4">
              <label className="block text-xs font-semibold text-slate-300">
                Identify Waste Item or Test Vision:
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClassifyWaste()}
                  placeholder="e.g. Avocado peel, Plastic juice bottle, Styrofoam..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => handleClassifyWaste()}
                  disabled={isClassifying || !itemInput.trim()}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sort
                </button>
              </div>

              {/* Sample item pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 block">Or select test item:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setItemInput(item);
                        handleClassifyWaste(item);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] transition-colors"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Classification Output Box */}
            {classificationResult ? (
              <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Designated SmartBin Compartment
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {(classificationResult.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                {/* Big Compartment Banner */}
                <div
                  className={`p-3 rounded-xl border text-center ${
                    classificationResult.category === 'FOOD'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : classificationResult.category === 'RECYCLING'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-700/40 border-slate-600 text-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    DEPOSIT IN LOWER SECTION:
                  </div>
                  <div className="text-lg font-extrabold font-mono mt-0.5">
                    {classificationResult.compartment}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">Item Identified:</span>{' '}
                    <strong className="text-white">{classificationResult.itemIdentified}</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {classificationResult.reasoning}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300">
                  🌱 <strong>Rwanda Eco Tip:</strong> {classificationResult.environmentalTip}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                  <span>Biodegradable: {classificationResult.biodegradable ? 'YES' : 'NO'}</span>
                  <span>Recyclable: {classificationResult.recyclable ? 'YES' : 'NO'}</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-8 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500">
                <Trash2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Ready for Waste Classification</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Type an item or select a test pill above to simulate camera vision sorting.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
            SG SmartBin Physical Vision Pipeline • Kigali Smart City Protocol
          </div>
        </div>
      </div>
    </div>
  );
};
