import { useState, useEffect, useRef } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import WorkDrawer3 from "@/components/WorkDrawer3";

interface SelectedWorkItem {
  key: string;
  title: string;
  intent?: string;
  status: 'keep' | 'blocked';
  recent_changes?: string;
}

interface Message {
  role: 'system' | 'user';
  content: string;
}

interface ItemState {
  reviewed: boolean;
  messages: Message[];
}

const mockSelectedWorkItems: SelectedWorkItem[] = [
  {
    key: 'ABC-123',
    title: 'Add authentication endpoint for mobile clients',
    intent: 'Enable mobile app users to authenticate securely',
    status: 'keep',
  },
  {
    key: 'ABC-156',
    title: 'Fix dashboard loading performance',
    intent: 'Reduce initial page load time for analytics dashboard',
    status: 'keep',
  },
  {
    key: 'ABC-140',
    title: 'Refactor user permissions module',
    intent: 'Simplify permission logic and reduce technical debt',
    status: 'blocked',
  },
];

export default function WorkReview() {
  const [selectedWorkItems] = useState<SelectedWorkItem[]>(mockSelectedWorkItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentItem = selectedWorkItems[currentIndex];
  const isComplete = currentIndex >= selectedWorkItems.length;

  useEffect(() => {
    const initialStates: Record<string, ItemState> = {};
    selectedWorkItems.forEach(item => {
      initialStates[item.key] = {
        reviewed: false,
        messages: [
          {
            role: 'system',
            content: 'What did you accomplish yesterday with this item?',
          }
        ],
      };
    });
    setItemStates(initialStates);
  }, [selectedWorkItems]);

  useEffect(() => {
    if (!isComplete) {
      textareaRef.current?.focus();
    }
  }, [currentIndex, isComplete]);

  const handleSend = () => {
    if (!input.trim() || isComplete) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setItemStates(prev => ({
      ...prev,
      [currentItem.key]: {
        reviewed: true,
        messages: [...prev[currentItem.key].messages, userMessage],
      }
    }));

    selectedWorkItems[currentIndex].recent_changes = input.trim();

    setInput('');

    const nextIndex = currentIndex + 1;
    if (nextIndex < selectedWorkItems.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(selectedWorkItems.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFinish = () => {
    console.log('Review complete. Data:', selectedWorkItems);
    alert('Review submitted! Check console for data.');
  };

  return (
    <>
      <WorkDrawer3 isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      
      <div className="bg-gray-50 dark:bg-gray-900 antialiased h-screen overflow-hidden p-4">
        <div className="flex h-full gap-4">
          <LeftSidebar 
            onRetrospectiveClick={() => {}} 
            onDailyReviewClick={() => setDrawerOpen(true)}
          />
          
          {/* Main Content - Two Column Layout */}
          <div className="flex-1 flex h-full gap-4">
            {/* Left Column - Prompt + Input */}
            <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daily Review Update Session
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Provide updates for each selected work item
                </p>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {isComplete ? (
                  <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
                    <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                      <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      All items reviewed
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                      You have provided updates for all {selectedWorkItems.length} work items.
                    </p>
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Finish
                    </button>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Current Item Header */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {currentItem.key}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {currentItem.title}
                        </span>
                      </div>
                      {currentItem.intent && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {currentItem.intent}
                        </p>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="space-y-4">
                      {itemStates[currentItem.key]?.messages.map((message, idx) => (
                        <div key={idx} className="flex gap-3">
                          {message.role === 'system' ? (
                            <>
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex-1" />
                              <div className="flex-1">
                                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                                U
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              {!isComplete && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type your update..."
                          rows={3}
                          className="block w-full rounded-2xl border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
                      >
                        Send
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Press Enter to send • Shift+Enter for new line
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Work Item Checklist */}
            <div className="w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Work Items
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedWorkItems.filter(item => itemStates[item.key]?.reviewed).length} of {selectedWorkItems.length} reviewed
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedWorkItems.map((item, idx) => {
                    const state = itemStates[item.key];
                    const isReviewed = state?.reviewed || false;
                    const isCurrent = idx === currentIndex && !isComplete;

                    return (
                      <li
                        key={item.key}
                        className={`px-6 py-4 transition-colors ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                {item.key}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                              {item.title}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isReviewed
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {isReviewed ? 'Reviewed' : 'Not reviewed'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
