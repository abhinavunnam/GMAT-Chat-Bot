import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MessageSquare, Sparkles, Brain, Send } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import GoogleSignIn from '../firebase/googleSignin';

const LandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const auth = getAuth();
  const [demoMessage, setDemoMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, [auth]);


  const LoginContent = () => {
  
    const sampleQuestions = [
      "Explain Data Sufficiency questions",
      "Help me solve this quadratic equation",
      "Create a study plan for Verbal",
      "Practice Critical Reasoning"
    ];
  
    const chatFeatures = [
      {
        icon: <Brain className="w-6 h-6 text-purple-500" />,
        title: "AI-Powered GMAT Tutor",
        description: "Get instant, personalized help with any GMAT topic 24/7"
      },
      {
        icon: <MessageSquare className="w-6 h-6 text-blue-500" />,
        title: "Interactive Practice",
        description: "Solve problems with step-by-step guidance and explanations"
      },
      {
        icon: <Sparkles className="w-6 h-6 text-amber-500" />,
        title: "Adaptive Learning",
        description: "Experience personalized tutoring that adapts to your level"
      }
    ];
    return (
      <>

    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section with Chat Demo */}
      <div className="container mx-auto px-4 pt-8">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left side - Chat Demo */}
          <div className="bg-white rounded-2xl shadow-xl p-4 order-2 md:order-1">
            <div className="bg-slate-50 rounded-xl p-4 mb-4 min-h-96">
              {/* AI Message */}
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm max-w-sm">
                  <p className="text-slate-700">Hi! I'm your GMAT AI Tutor. I can help you with any GMAT topic, create study plans, and provide practice questions. What would you like to learn today?</p>
                </div>
              </div>
              
              {/* Sample Questions Bubbles */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="bg-white px-3 py-1 rounded-full text-sm text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    {question}
                  </button>
                ))}
              </div>

              {/* Demo Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try asking a GMAT question..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={demoMessage}
                  onChange={(e) => setDemoMessage(e.target.value)}
                />
                <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Sign In */}
          <div className="text-center md:text-left order-1 md:order-2">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Personal GMAT AI Tutor
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Get instant help with GMAT prep through our advanced AI chatbot. Practice questions, receive explanations, and improve your score.
            </p>
            <div className="space-y-4">
              <div className="inline-block">
                <GoogleSignIn />
              </div>
              <p className="text-sm text-slate-500">Join thousands of students already improving their GMAT scores with AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {chatFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-purple-100">Available Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">1M+</div>
              <div className="text-purple-100">Questions Answered</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">95%</div>
              <div className="text-purple-100">Student Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/home" replace={true} /> : <LoginContent />;
};

export default LandingPage;