import LeftSidebar from "@/components/LeftSidebar";
import Drawer from "@/components/Drawer";
import { useState } from "react";
import { Button, Textarea, Badge } from "flowbite-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  references?: {
    type: 'ticket' | 'document' | 'review';
    id: string;
    title: string;
  }[];
}

export default function Chat() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedPrompts = [
    "What tasks are currently in progress?",
    "Summarize recent team activity",
    "What documentation do we have on authentication?"
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a simulated response. In production, this would query your work items, team activity, and documentation to provide context-aware answers.',
        timestamp: new Date(),
        references: [
          { type: 'ticket', id: 'WS-123', title: 'Implement OAuth flow' },
          { type: 'document', id: 'auth-guide', title: 'Authentication Architecture' }
        ]
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <>
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="bg-gray-50 dark:bg-gray-900 antialiased h-screen overflow-hidden p-4">
        <div className="flex h-full gap-4">
          <LeftSidebar onRetrospectiveClick={() => setDrawerOpen(true)} />

          <main className="flex-1 bg-white dark:bg-gray-800 h-full rounded-lg shadow-lg flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Context-Aware Chat
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Query across work items, reviews, and documentation
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 ? (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Start a conversation
                  </h2>
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
                    I can help you understand work items, team activity, summarize discussions, 
                    or answer questions about your documentation.
                  </p>

                  {/* Suggested Prompts */}
                  <div className="w-full max-w-2xl space-y-3">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(prompt)}
                        className="w-full text-left px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
                                 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors
                                 text-gray-900 dark:text-white font-medium"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Messages
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {message.role === 'user' ? 'U' : 'AI'}
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        } rounded-2xl px-4 py-3`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>

                        {/* References */}
                        {message.references && message.references.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Referenced items:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.references.map((ref, idx) => (
                                <Badge
                                  key={idx}
                                  color={ref.type === 'ticket' ? 'info' : ref.type === 'document' ? 'purple' : 'warning'}
                                >
                                  {ref.id}: {ref.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        AI
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask a question..."
                      rows={1}
                      className="resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    color="blue"
                    size="lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Chat can access your work items, team activity, and documentation to provide context-aware answers
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}