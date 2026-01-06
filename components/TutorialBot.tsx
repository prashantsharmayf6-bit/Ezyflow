
import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
import { Icons, COLORS } from '../constants';

interface TutorialBotProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

type TutorialStep = 'welcome' | 'dashboard' | 'workflow' | 'administration' | 'award';

const TutorialBot: React.FC<TutorialBotProps> = ({ currentView, setView }) => {
  const [step, setStep] = useState<TutorialStep | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ezyflow_tutorial_complete');
    if (!hasSeenTutorial) {
      setTimeout(() => {
        setIsVisible(true);
        setStep('welcome');
      }, 1000);
    }
  }, []);

  const handleNext = () => {
    switch (step) {
      case 'welcome':
        setView('dashboard');
        setStep('dashboard');
        break;
      case 'dashboard':
        setView('workflow');
        setStep('workflow');
        break;
      case 'workflow':
        setView('administration');
        setStep('administration');
        break;
      case 'administration':
        setStep('award');
        break;
      case 'award':
        completeTutorial();
        break;
      default:
        break;
    }
  };

  const completeTutorial = () => {
    localStorage.setItem('ezyflow_tutorial_complete', 'true');
    setIsVisible(false);
    setStep(null);
  };

  if (!isVisible) return (
    <button 
      onClick={() => { setIsVisible(true); setStep('welcome'); }}
      className="fixed bottom-24 right-8 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all z-40 group"
    >
      <span className="text-xl">🤖</span>
      <div className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Help from KIA
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-indigo-600 p-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">🤖</div>
          <div>
            <h2 className="text-xl font-bold">I'm KIA</h2>
            <p className="text-indigo-100 text-sm">Your Ezyflow Success Guide</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {step === 'welcome' && (
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Welcome to <strong>Ezyflow</strong>! I'm here to show you how our low-code platform can supercharge your productivity. 
              </p>
              <p className="text-gray-600 text-sm italic">Would you like a quick 1-minute tour of the application?</p>
            </div>
          )}

          {step === 'dashboard' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Icons.Dashboard /> Dashboard
              </h3>
              <p className="text-gray-700 leading-relaxed">
                This is your <strong>Mission Control</strong>. Monitor task distribution, team productivity, and real-time metrics across all your active projects.
              </p>
            </div>
          )}

          {step === 'workflow' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Icons.Workflow /> Workflow Builder
              </h3>
              <p className="text-gray-700 leading-relaxed">
                The heart of Ezyflow. Use our <strong>low-code canvas</strong> to build automations. You can even ask our Smart Assistant to generate a workflow for you!
              </p>
            </div>
          )}

          {step === 'administration' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Icons.Admin /> Administration
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Control your environment. Manage team licenses, security protocols, and platform-wide settings from one central place.
              </p>
            </div>
          )}

          {step === 'award' && (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-50 duration-500">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                  <Icons.Trophy className="w-12 h-12" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Certified Expert!</h3>
                <p className="text-gray-600 mt-2">You've completed the tour. You're now ready to build amazing things with Ezyflow.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step !== 'award' ? (
              <>
                <button 
                  onClick={completeTutorial}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip Tour
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-[2] bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  {step === 'welcome' ? 'Start Tour' : 'Continue'}
                </button>
              </>
            ) : (
              <button 
                onClick={completeTutorial}
                className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl text-lg font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                Let's Get Started!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialBot;
