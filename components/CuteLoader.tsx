
import React from 'react';

const CuteLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      <div className="relative w-24 h-24">
        {/* Pulsing Brain/Pencil Mockup */}
        <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative flex items-center justify-center w-24 h-24 bg-indigo-600 rounded-full shadow-lg">
          <svg className="w-12 h-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Curation in progress...</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Gemini is brainstorming unique questions for your exam. Hang tight!</p>
      </div>
    </div>
  );
};

export default CuteLoader;
