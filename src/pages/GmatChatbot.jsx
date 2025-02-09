import React, { useState, useRef, useEffect } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { Groq } from 'groq-sdk';
// import { ModeToggle } from '@/components/mode-toggle';
import { Send, Loader2, BookOpen, Brain, Timer, History, AlertTriangle, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { addMessage, getMessages, clearSessionHistory } from '@/lib/firestore';
import { addConversation, getConversations } from '@/lib/firestore';

const groq = new Groq({ 
  apiKey: "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", 
  dangerouslyAllowBrowser: true 
});

const GmatChatbot = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [conversations, setConversations] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  const quickTopics = [
    { icon: <BookOpen className="w-4 h-4" />, label: 'Verbal Reasoning', systemPrompt: "You are a GMAT Verbal Reasoning expert. Focus on helping users with Reading Comprehension, Critical Reasoning, and Sentence Correction." },
    { icon: <Brain className="w-4 h-4" />, label: 'Quantitative Analysis', systemPrompt: "You are a GMAT Quantitative Analysis expert. Focus on Problem Solving and Data Sufficiency questions, mathematical concepts, and calculation strategies." },
    { icon: <Timer className="w-4 h-4" />, label: 'Time Management', systemPrompt: "You are a GMAT time management expert. Focus on helping users develop effective strategies for managing time during each section and the overall test." },
    { icon: <History className="w-4 h-4" />, label: 'Practice Tests', systemPrompt: "You are a GMAT practice test expert. Focus on helping users prepare for, take, and review practice tests effectively, including analysis of their performance and improvement strategies." },
  ];

  useEffect(() => {
    if (user) {
      const newSessionId = `${user.uid}-${selectedTopic || 'general'}`;
      setSessionId(newSessionId);
    }
  }, [selectedTopic, user]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!sessionId) return;

      try {
        const existingConversations = await getConversations(sessionId);
        
        if (existingConversations.length === 0) {
          const initialMessage = selectedTopic 
            ? `I'm here to help you with ${selectedTopic}. What would you like to know?`
            : 'Hello! I\'m your GMAT prep assistant. I can help you with study plans, specific topics, or practice questions. What would you like to focus on today?';
          
          setConversations([{ aiResponse: initialMessage }]);
        } else {
          setConversations(existingConversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load chat history.');
      }
    };

    fetchConversations();
  }, [sessionId, selectedTopic]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const getGroqResponse = async (messages) => {
    try {
      const currentTopic = quickTopics.find(topic => topic.label === selectedTopic);
      const systemPrompt = currentTopic
        ? currentTopic.systemPrompt
        : "You are a general GMAT preparation assistant, expert in verbal reasoning, quantitative analysis, and test-taking strategies. Provide concise, accurate, and helpful responses.";

      const formattedMessages = messages.map(msg => ({
        role: msg.userMessage ? 'user' : 'assistant',
        content: msg.userMessage || msg.aiResponse
      }));

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...formattedMessages
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 1024,
      });
      return chatCompletion.choices[0]?.message?.content;
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  };

const handleMessage = async (messageText) => {
  setError('');
  setIsLoading(true);

  try {
    // Get AI response for the current message
    const aiResponse = await getGroqResponse([...conversations, { userMessage: messageText }]);

    // Append the new message and AI response directly to the state
    const newConversationEntry = {
      userMessage: messageText,
      aiResponse: aiResponse,
    };

    setConversations((prevConversations) => [...prevConversations, newConversationEntry]);

    // Save the new message and AI response to the database in the background
    await addConversation(sessionId, messageText, aiResponse, 'llama-3.3-70b-versatile', user.email);
  } catch (error) {
    console.error('Error handling message:', error);
    setError(error.message || 'Failed to process your message. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    handleMessage(input);
    setInput('');
  };

  const handleQuickTopic = (topic) => {
    setSelectedTopic(topic.label);
  };

  const handleClearChat = () => {
    try {
      const initialMessage = selectedTopic 
        ? `I'm here to help you with ${selectedTopic}. What would you like to know?`
        : 'Hello! I\'m your GMAT prep assistant. I can help you with study plans, specific topics, or practice questions. What would you like to focus on today?';
  
      // Reset conversations state with the initial message
      setConversations([{ aiResponse: initialMessage }]);
    } catch (error) {
      console.error('Error clearing chat:', error);
      setError('Failed to clear chat.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <div className="px-6 py-4 border-b bg-card flex items-center justify-between">
          {/* <div className="flex items-center gap-4">
            <ModeToggle />
            <span className="text-sm text-muted-foreground">Switch theme</span>
          </div> */}
          <Button 
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className='bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md text-sm'
          >
            Logout
          </Button>
        </div>
        <CardHeader className="bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">GMAT Prep Assistant</CardTitle>
                <CardDescription className="text-sm">Your AI-powered GMAT preparation guide</CardDescription>
              </div>
            </div>
            <Button
              onClick={handleClearChat}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex flex-col gap-6">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickTopics.map((topic, index) => (
              <Button
                key={index}
                variant={selectedTopic === topic.label ? "default" : "outline"}
                className="h-14 flex flex-col items-center gap-1 p-2 transition-all hover:scale-102"
                onClick={() => handleQuickTopic(topic)}
              >
                {topic.icon}
                <span className="text-xs font-medium">{topic.label}</span>
              </Button>
            ))}
          </div>

          <div className="flex-1 min-h-[400px] max-h-[600px] overflow-y-auto rounded-lg border bg-background/50 backdrop-blur-sm">
            <div className="p-4 space-y-4">
            {conversations.map((conversation, index) => (
                <div key={index} className="space-y-4">
                  {conversation.userMessage && (
                    <div key={`user-${index}`} className="flex justify-end">
                      <Alert className="max-w-[80%] bg-[#d9fdd3]/90 text-primary-foreground shadow-sm">
                        <AlertDescription className="whitespace-pre-wrap">
                          {conversation.userMessage}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <div key={`ai-${index}`} className="flex justify-start">
                    <Alert className="max-w-[80%] bg-white/80 shadow-sm">
                      <AlertDescription className="whitespace-pre-wrap">
                        {conversation.aiResponse}
                      </AlertDescription>
                    </Alert>
                  </div>
                  </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Alert className="max-w-[80%] bg-secondary/50 backdrop-blur-sm">
                    <AlertDescription className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing your question...
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-xl">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about GMAT topics, study plans, or practice questions..."
                className="flex-1 h-12 bg-background/50 backdrop-blur-sm focus:outline-none focus:border-transparent"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="h-12 px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GmatChatbot;