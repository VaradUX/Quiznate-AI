
import React, { useState, useEffect, useMemo } from 'react';
import { ExamType, QuestionFormat, QuizConfig, Question, AppState, Group } from './types';
import { generateQuizQuestions } from './geminiService';
import { PlusIcon, UsersIcon, ClockIcon, CheckIcon, ExamIcon } from './components/Icons';
import CuteLoader from './components/CuteLoader';

const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'Engineering Batch A', candidatesCount: 45 },
  { id: 'g2', name: 'MBA Finals Section C', candidatesCount: 32 },
  { id: 'g3', name: 'Internal QA Team', candidatesCount: 12 },
  { id: 'g4', name: 'HR Management Group', candidatesCount: 28 },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [config, setConfig] = useState<QuizConfig>({
    type: ExamType.ACADEMIC,
    name: '',
    date: '',
    time: '',
    description: '',
    totalQuestions: 10,
    isCustomDistribution: false,
    distribution: {
      [QuestionFormat.MCQ]: 10,
      [QuestionFormat.MSQ]: 0,
      [QuestionFormat.WRITTEN]: 0,
      [QuestionFormat.AUDIO]: 0,
    },
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Updated credentials as requested: Username: Admin, Password: Admin@123
    if (username === 'Admin' && password === 'Admin@123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials! (Try Admin / Admin@123)');
    }
  };

  const handleConfigChange = (field: keyof QuizConfig, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      
      // Handle distribution syncing
      if (field === 'totalQuestions' && !prev.isCustomDistribution) {
        newConfig.distribution = {
          [QuestionFormat.MCQ]: value,
          [QuestionFormat.MSQ]: 0,
          [QuestionFormat.WRITTEN]: 0,
          [QuestionFormat.AUDIO]: 0,
        };
      }
      return newConfig;
    });
  };

  const handleDistributionChange = (type: QuestionFormat, val: number) => {
    setConfig(prev => {
      const newDist = { ...prev.distribution, [type]: val };
      // Fix: cast Object.values to number[] to avoid 'unknown' type error in reduce
      const newTotal = (Object.values(newDist) as number[]).reduce((a, b) => a + b, 0);
      return { ...prev, distribution: newDist, totalQuestions: newTotal };
    });
  };

  const isFormValid = useMemo(() => {
    return (
      config.name.trim() !== '' &&
      config.date !== '' &&
      config.time !== '' &&
      config.description.trim() !== '' &&
      config.totalQuestions > 0
    );
  }, [config]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateQuizQuestions(config);
      setQuestions(result);
      setHasGeneratedOnce(true);
    } catch (error) {
      alert("Error generating quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleGroupSelection = (id: string) => {
    setSelectedGroups(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsModalOpen(false);
      setShowPreview(false);
      setShowAssign(false);
      setHasGeneratedOnce(false);
    }, 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <ExamIcon />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">ExamGenius</h1>
            <p className="text-slate-500">Admin Portal Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter admin username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Sign In
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400 uppercase tracking-widest">Powered by Gemini AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <ExamIcon />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                ExamGenius
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500">Welcome, <strong>Admin</strong></span>
              <button onClick={() => setIsAuthenticated(false)} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exam Overview</h1>
            <p className="text-slate-500 text-sm">Monitor and manage your active assessment cycles</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-md font-medium transition-all"
          >
            <PlusIcon />
            <span>Create New Quiz</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <ExamIcon />
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Total Exams</h3>
            <p className="text-3xl font-bold text-slate-900">42</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <UsersIcon />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+5%</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Total Candidates</h3>
            <p className="text-3xl font-bold text-slate-900">1,284</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <ClockIcon />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Ongoing Quizzes</h3>
            <p className="text-3xl font-bold text-slate-900">8</p>
          </div>
        </div>

        {/* Recent Exams List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent Assessment History</h2>
            <button className="text-sm text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Exam Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Candidates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Python Backend Fundamentals', type: ExamType.ACADEMIC, date: '2023-10-24', time: '10:00 AM', status: 'Completed', count: 45 },
                  { name: 'Senior UI/UX Interview', type: ExamType.CORPORATE, date: '2023-11-02', time: '02:30 PM', status: 'Scheduled', count: 12 },
                  { name: 'National Scholarship Test', type: ExamType.COMPETITIVE, date: '2023-11-15', time: '09:00 AM', status: 'Draft', count: 0 },
                ].map((exam, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{exam.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">{exam.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{exam.date} @ {exam.time}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        exam.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        exam.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{exam.count || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CREATE QUIZ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {showAssign ? 'Assign Groups' : showPreview ? 'Quiz Preview' : 'Configure Quiz Engine'}
                </h2>
                <p className="text-sm text-slate-500">
                  {showAssign ? 'Select groups to deploy this assessment' : 
                   showPreview ? 'Verify the generated questionnaire' : 
                   'Specify your exam parameters and let AI build it'}
                </p>
              </div>
              <button 
                onClick={() => {
                  if (showPreview) { setShowPreview(false); return; }
                  if (showAssign) { setShowAssign(false); setShowPreview(true); return; }
                  setIsModalOpen(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {isGenerating ? (
                <CuteLoader />
              ) : showSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                    <CheckIcon />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900">Exam Generated Successfully!</h3>
                    <p className="text-slate-500 mt-2">The quiz has been assigned and will be visible to candidates at the scheduled time.</p>
                  </div>
                </div>
              ) : showAssign ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_GROUPS.map((group) => (
                      <div 
                        key={group.id}
                        onClick={() => toggleGroupSelection(group.id)}
                        className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-start justify-between ${
                          selectedGroups.includes(group.id) 
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10' 
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-slate-900">{group.name}</h4>
                          <p className="text-sm text-slate-500 flex items-center mt-1">
                            <UsersIcon />
                            <span className="ml-1.5">{group.candidatesCount} Candidates</span>
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          selectedGroups.includes(group.id) ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300'
                        }`}>
                          {selectedGroups.includes(group.id) && <CheckIcon />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : showPreview ? (
                <div className="space-y-8">
                  <div className="bg-indigo-50 p-6 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-indigo-900">{config.name}</h3>
                        <p className="text-sm text-indigo-700 mt-1">{config.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          {config.type}
                        </span>
                        <p className="text-xs text-indigo-600 mt-2 font-medium">{config.date} | {config.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">
                            Q{idx + 1} • {q.type}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium mb-4">{q.question}</p>
                        
                        {(q.type === QuestionFormat.MCQ || q.type === QuestionFormat.MSQ) && q.options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, i) => (
                              <div key={i} className="flex items-center p-3 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-600">
                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold mr-3">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === QuestionFormat.AUDIO && q.audioPrompt && (
                          <div className="flex items-center p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mr-4">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Audio Prompt (Text-to-Speech)</p>
                              <p className="text-sm text-orange-800 italic">"{q.audioPrompt}"</p>
                            </div>
                          </div>
                        )}

                        {q.type === QuestionFormat.WRITTEN && (
                          <div className="h-24 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                            <p className="text-slate-400 text-xs">Candidates will provide a long-form response here</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Exam Type */}
                  <div className="col-span-full">
                    <label className="block text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Select Exam Category</label>
                    <div className="flex flex-wrap gap-4">
                      {Object.values(ExamType).map((type) => (
                        <label 
                          key={type}
                          className={`flex-1 min-w-[200px] cursor-pointer relative group`}
                        >
                          <input 
                            type="radio" 
                            name="examType" 
                            className="peer sr-only" 
                            checked={config.type === type}
                            onChange={() => handleConfigChange('type', type)}
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all text-center ${
                            config.type === type 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-50' 
                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                          }`}>
                            <span className="font-bold">{type}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* General Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name / Subject</label>
                      <input 
                        type="text" 
                        value={config.name}
                        onChange={(e) => handleConfigChange('name', e.target.value)}
                        placeholder="e.g. Advanced Calculus 101"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input 
                          type="date" 
                          value={config.date}
                          onChange={(e) => handleConfigChange('date', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                        <input 
                          type="time" 
                          value={config.time}
                          onChange={(e) => handleConfigChange('time', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Subject Description / Topics</label>
                      <textarea 
                        rows={5}
                        value={config.description}
                        onChange={(e) => handleConfigChange('description', e.target.value)}
                        placeholder="Describe the topics to cover (e.g. Derivatives, Integrals, Taylor Series...)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Question Config */}
                  <div className="col-span-full border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Question Distribution</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500">Custom Mix</span>
                        <button 
                          onClick={() => handleConfigChange('isCustomDistribution', !config.isCustomDistribution)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${config.isCustomDistribution ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isCustomDistribution ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>

                    {!config.isCustomDistribution ? (
                      <div className="flex items-center space-x-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Total MCQ Questions</label>
                          <input 
                            type="range" 
                            min="1" 
                            max="50" 
                            value={config.totalQuestions}
                            onChange={(e) => handleConfigChange('totalQuestions', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                        <div className="w-20 h-20 rounded-full border-4 border-indigo-600 flex items-center justify-center bg-white shadow-inner">
                          <span className="text-2xl font-bold text-indigo-600">{config.totalQuestions}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.values(QuestionFormat).map((format) => (
                          <div key={format} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">{format}</label>
                            <input 
                              type="number" 
                              min="0"
                              value={config.distribution[format]}
                              onChange={(e) => handleDistributionChange(format, parseInt(e.target.value) || 0)}
                              className="w-full text-center text-xl font-bold text-slate-800 border-none bg-slate-50 py-2 rounded-lg focus:ring-0"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-end space-y-3 md:space-y-0 md:space-x-4">
              {showSuccess ? null : showAssign ? (
                <>
                  <button 
                    onClick={() => { setShowAssign(false); setShowPreview(true); }}
                    className="w-full md:w-auto px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800 transition-colors"
                  >
                    Back to Preview
                  </button>
                  <button 
                    onClick={handleShare}
                    disabled={selectedGroups.length === 0}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-10 py-2.5 rounded-xl shadow-lg transition-all"
                  >
                    Share Quiz Now
                  </button>
                </>
              ) : showPreview ? (
                <>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="w-full md:w-auto px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800 transition-colors"
                  >
                    Edit Config
                  </button>
                  <button 
                    onClick={() => setShowAssign(true)}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center"
                  >
                    Assign Quiz
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 text-center md:text-left">
                    {!isFormValid && (
                      <p className="text-xs text-rose-500 font-medium">* Please complete all mandatory fields</p>
                    )}
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={!isFormValid || isGenerating}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-10 py-2.5 rounded-xl shadow-lg transition-all"
                  >
                    {hasGeneratedOnce ? 'Regenerate Quiz' : 'Generate Quiz'}
                  </button>
                  {hasGeneratedOnce && !isGenerating && (
                    <button 
                      onClick={() => setShowPreview(true)}
                      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10 py-2.5 rounded-xl shadow-lg transition-all"
                    >
                      Preview Quiz
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
