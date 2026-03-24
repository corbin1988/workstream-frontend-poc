import { useState, useEffect, useRef } from "react";

const EXPRESS_URL = process.env.NEXT_PUBLIC_EXPRESS_URL ?? 'http://localhost:3001';

interface ReviewQuestion {
  id: string;
  text: string;
  scope: 'project' | 'tenant';
}

interface ReviewItem {
  key: string;
  title: string;
  intent?: string;
  projectKey: string;
  status: string;
  questions: ReviewQuestion[];
}

interface Message {
  role: 'system' | 'user';
  content: string;
}

interface ItemState {
  reviewed: boolean;
  messages: Message[];
  answers: Array<{ question_id: string; answer: string }>;
}

const FALLBACK_QUESTION: ReviewQuestion = {
  id: '_default',
  text: 'Any updates on this item?',
  scope: 'project',
};

const mockItems: ReviewItem[] = [
  {
    key: 'ABC-123',
    title: 'Add authentication endpoint for mobile clients',
    intent: 'Enable mobile app users to authenticate securely',
    projectKey: 'ABC',
    status: 'keep',
    questions: [
      { id: 'q_yesterday', text: 'What did you accomplish yesterday with this item?', scope: 'project' },
      { id: 'q_today', text: 'What will you do today?', scope: 'project' },
    ],
  },
  {
    key: 'ABC-156',
    title: 'Fix dashboard loading performance',
    intent: 'Reduce initial page load time for analytics dashboard',
    projectKey: 'ABC',
    status: 'keep',
    questions: [
      { id: 'q_yesterday', text: 'What did you accomplish yesterday with this item?', scope: 'project' },
      { id: 'q_today', text: 'What will you do today?', scope: 'project' },
    ],
  },
];

export default function WorkReview() {
  const [selectedWorkItems, setSelectedWorkItems] = useState<ReviewItem[]>(mockItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Read session from sessionStorage after hydration
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('workstream_review_session');
      if (raw) {
        const session = JSON.parse(raw);
        if (Array.isArray(session.items) && session.items.length > 0) {
          setSelectedWorkItems(session.items);
        }
      }
    } catch { /* ignore parse errors */ }
  }, []);

  // Initialise itemStates whenever selectedWorkItems changes
  useEffect(() => {
    const initialStates: Record<string, ItemState> = {};
    selectedWorkItems.forEach(item => {
      const questions = item.questions.length > 0 ? item.questions : [FALLBACK_QUESTION];
      initialStates[item.key] = {
        reviewed: false,
        messages: [{ role: 'system', content: questions[0].text }],
        answers: [],
      };
    });
    setItemStates(initialStates);
    setCurrentIndex(0);
    setInput('');
  }, [selectedWorkItems]);

  const currentItem = selectedWorkItems[currentIndex];
  const isComplete = currentIndex >= selectedWorkItems.length;

  useEffect(() => {
    if (!isComplete) {
      inputRef.current?.focus();
    }
  }, [currentIndex, isComplete]);

  const handleSend = () => {
    if (!input.trim() || isComplete || !currentItem) return;

    const currentState = itemStates[currentItem.key];
    if (!currentState) return;

    const questions = currentItem.questions.length > 0 ? currentItem.questions : [FALLBACK_QUESTION];
    const answeredCount = currentState.answers.length;
    const currentQuestion = questions[answeredCount];
    if (!currentQuestion) return;

    const newAnswer = { question_id: currentQuestion.id, answer: input.trim() };
    const newAnswers = [...currentState.answers, newAnswer];
    const newMessages: Message[] = [
      ...currentState.messages,
      { role: 'user', content: input.trim() },
    ];

    const nextQuestionIndex = answeredCount + 1;

    if (nextQuestionIndex < questions.length) {
      // More questions for this item — prompt the next one
      newMessages.push({ role: 'system', content: questions[nextQuestionIndex].text });
      setItemStates(prev => ({
        ...prev,
        [currentItem.key]: { reviewed: false, messages: newMessages, answers: newAnswers },
      }));
    } else {
      // All questions answered — mark reviewed and advance to next item
      setItemStates(prev => ({
        ...prev,
        [currentItem.key]: { reviewed: true, messages: newMessages, answers: newAnswers },
      }));
      setCurrentIndex(prev => prev + 1);
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await Promise.all(
        selectedWorkItems.map(async item => {
          const state = itemStates[item.key];
          if (!state?.reviewed) return;

          await fetch(`${EXPRESS_URL}/api/work-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'jira',
              project_key: item.projectKey,
              issue_key: item.key,
              title: item.title,
              description: item.intent ?? '',
            }),
          });

          await fetch(`${EXPRESS_URL}/api/work-items/${encodeURIComponent(item.key)}/updates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'jira',
              project_key: item.projectKey,
              answers: state.answers,
              review_date: new Date().toISOString(),
            }),
          });
        })
      );
      sessionStorage.removeItem('workstream_review_session');
    } catch (e) {
      console.error('[WorkReview] Failed to save review:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen overflow-hidden flex gap-4 lg:ml-64 px-4 py-4 pb-20 lg:pb-4">
      {/* Left Column - Chat */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 xl:p-4 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden flex-1">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daily Review Update Session
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Provide updates for each selected work item
            </p>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4">
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
                  disabled={submitting}
                  className="px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Finish'}
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
                              <p className="text-sm text-gray-900 dark:text-white">{message.content}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1" />
                          <div className="flex-1">
                            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-2 items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder=""
                    className="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex-shrink-0 p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Work Item Checklist */}
      <aside className="hidden xl:flex w-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Work Items</h2>
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
                const questions = item.questions.length > 0 ? item.questions : [FALLBACK_QUESTION];
                return (
                  <li
                    key={item.key}
                    className={`p-4 transition-colors ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                          {item.key}
                        </span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                          {item.title}
                        </p>
                        {isCurrent && !isReviewed && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {state?.answers.length ?? 0} / {questions.length} questions
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isReviewed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {isReviewed ? 'Reviewed' : 'Pending'}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>
    </main>
  );
}
