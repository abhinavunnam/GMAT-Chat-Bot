import React, { useState, useRef, useEffect } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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
import { addConversation, getConversations } from '@/lib/firestore';

const GmatChatbot = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [conversations, setConversations] = useState([]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  const quickTopics = [
    { 
      icon: <BookOpen className="w-4 h-4" />, 
      label: 'Verbal Reasoning', 
      systemPrompt: "You are an AI assistant for GMAT Verbal Reasoning. Provide **only final answers**, without `<think>` responses, internal reasoning, or meta-cognitive explanations. If asked a question, respond **directly** and concisely." 
    },
    { 
      icon: <Brain className="w-4 h-4" />, 
      label: 'Quantitative Analysis', 
      systemPrompt: "You are an AI expert in GMAT Quantitative Analysis. Respond **with direct answers only**—do not include `<think>` sections, self-analysis, or explanations of reasoning steps unless explicitly requested." 
    },
    { 
      icon: <Timer className="w-4 h-4" />, 
      label: 'Time Management', 
      systemPrompt: "You are an AI expert in GMAT time management. Give **only practical and actionable advice**. Do not include `<think>` responses, reasoning steps, or any self-reflection—just respond concisely." 
    },
  ];

  useEffect(() => {
    if (user) {
      const newSessionId = `${user.uid}-${selectedTopic || 'general'}`;
      setSessionId(newSessionId);
    }
  }, [selectedTopic, user]);

  useEffect(() => {
    const initialMessage = selectedTopic 
      ? `I'm here to help you with ${selectedTopic}. What would you like to know?`
      : "Hello! I'm your GMAT prep assistant. I can help you with study plans, specific topics, or practice questions. What would you like to focus on today?";
    
    setConversations([{ aiResponse: initialMessage }]);
  }, [selectedTopic]);

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

  // NEW: Gemini AI integration (replace with actual API details)
  const getGeminiResponse = async (messages, image = null) => {
    try {
      const currentTopic = quickTopics.find(topic => topic.label === selectedTopic);
      const systemPrompt = currentTopic
        ? currentTopic.systemPrompt
        : "You are a general GMAT preparation assistant, expert in verbal reasoning, quantitative analysis, and test-taking strategies. Provide concise, accurate, and helpful responses.";

      const formattedMessages = messages.map(msg => ({
        role: msg.userMessage ? 'user' : 'assistant',
        content: msg.userMessage || msg.aiResponse
      }));

      // Use FormData to support file uploads along with the conversation payload
      const formData = new FormData();
      formData.append("system_prompt", systemPrompt);
      formData.append("messages", JSON.stringify(formattedMessages));
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("https://api.gemini.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`
          // Note: Do not set "Content-Type" when sending FormData
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gemini API request failed");
      }

      const data = await response.json();
      return data.choices[0]?.message?.content;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to get response from Gemini AI. Please try again.');
    }
  };

  const handleMessage = async (messageText) => {
    setError('');
    setIsLoading(true);

    try {
      // Call Gemini with both text and (optionally) the image file.
      const aiResponse = await getGeminiResponse(
        [...conversations, { userMessage: messageText }],
        imageFile
      );

      // Append the new conversation entry
      const newConversationEntry = {
        userMessage: messageText,
        aiResponse: aiResponse,
      };

      setConversations((prev) => [...prev, newConversationEntry]);

      // Save to the database (update as needed for Gemini)
      await addConversation(sessionId, messageText, aiResponse, 'gemini-ai', user.email);
    } catch (error) {
      console.error('Error handling message:', error);
      setError(error.message || 'Failed to process your message. Please try again.');
    } finally {
      setIsLoading(false);
      // Clear image input after submission
      setImageFile(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && !imageFile) return;
    
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
        : "Hello! I'm your GMAT prep assistant. I can help you with study plans, specific topics, or practice questions. What would you like to focus on today?";
  
      setConversations([{ aiResponse: initialMessage }]);
    } catch (error) {
      console.error('Error clearing chat:', error);
      setError('Failed to clear chat.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">GMAT Prep Buddy</CardTitle>
                <CardDescription className="text-sm">Your AI-powered GMAT preparation guide</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
              >
                Logout
              </Button>
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
          </div>
        </CardHeader>

        <CardContent className="p-6 flex flex-col gap-6">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickTopics.map((topic, index) => (
              <Button
                key={index}
                variant={selectedTopic === topic.label ? "default" : "outline"}
                className="h-14 flex flex-row items-center gap-1 p-2 transition-all hover:scale-102"
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
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-4 mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-3 mb-1" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-2 mb-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-primary" {...props} />,
                            em: ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc ml-5 space-y-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal ml-5 space-y-1" {...props} />,
                            li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-l-4 pl-4 italic text-gray-500 bg-gray-100 my-2" {...props} />
                            ),
                            hr: () => <hr className="my-4 border-t-2 border-gray-300" />,
                            table: ({ node, ...props }) => (
                              <table className="table-auto border-collapse border border-gray-300 w-full my-4" {...props} />
                            ),
                            th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-200" {...props} />,
                            td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                          }}
                        >
                          {conversation.aiResponse}
                        </ReactMarkdown>
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

          {/* New: File input for image prompts */}
          <div className="p-4 bg-gray-100 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attach an image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mb-4"
            />
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
                disabled={isLoading || (!input.trim() && !imageFile)}
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
