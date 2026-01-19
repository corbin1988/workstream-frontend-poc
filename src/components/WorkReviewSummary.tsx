import React, { useState } from 'react';
import { Badge } from 'flowbite-react';

interface SignOff {
  name: string;
  team: string;
  approved: boolean;
  timestamp?: string;
  comment?: string;
}

interface TeamSummary {
  team: string;
  completed: string[];
  inProgress: string[];
  blockers: string[];
  decisions: string[];
  evidence: {
    prs: number;
    tickets: number;
    decisions: number;
  };
}

interface Comment {
  id: string;
  author: string;
  team: string;
  timestamp: string;
  content: string;
}

interface WorkReviewSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: {
    start: string;
    end: string;
  };
  scope: string;
  executiveOverview: string;
  teamSummaries: TeamSummary[];
  crossTeamProgress: string[];
  risks: string[];
  signOffs: SignOff[];
  comments: Comment[];
}

export default function WorkReviewSummary({
  isOpen,
  onClose,
  dateRange,
  scope,
  executiveOverview,
  teamSummaries,
  crossTeamProgress,
  risks,
  signOffs,
  comments,
}: WorkReviewSummaryProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  const approvedCount = signOffs.filter(s => s.approved).length;
  const totalCount = signOffs.length;
  const pendingSignOffs = signOffs.filter(s => !s.approved);

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Handle comment submission
      setNewComment('');
    }
  };

  const handleSignOff = () => {
    // Handle sign-off action
  };

  const handleExportPDF = () => {
    // Handle PDF export
  };

  const handleCopyText = () => {
    // Handle copy summary text
  };

  const handleShareLink = () => {
    // Handle share read-only link
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[80] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Summary Panel */}
      <div
        className={`fixed top-0 right-0 z-[90] w-full max-w-4xl h-screen overflow-y-auto transition-transform bg-gray-900 text-white ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-6 sm:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Work Review Summary
              </h2>
              <p className="text-gray-400 text-sm">
                {new Date(dateRange.start).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} – {new Date(dateRange.end).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-gray-400 text-sm">{scope}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-6 space-y-8">
          {/* Pending Sign-offs Alert */}
          {pendingSignOffs.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-yellow-300">Pending team sign-offs</h3>
                  </div>
                  <p className="text-sm text-yellow-200 mb-2">
                    <span className="font-semibold">{approvedCount} of {totalCount} approved</span>
                  </p>
                  <p className="text-sm text-yellow-200">
                    Waiting on: {pendingSignOffs.map(s => s.name).join(', ')}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(approvedCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>
                <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Sign off summary
                </button>
              </div>
            </div>
          )}

          {/* Executive Overview */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Executive Overview</h3>
            <p className="text-gray-300 leading-relaxed">
              {executiveOverview}
            </p>
          </section>

          {/* Team Summaries */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Team Summaries</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Team</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Completed</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">In Progress</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Blockers</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Decisions</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {teamSummaries.map((team, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-4 align-top">
                        <span className="font-semibold text-white">{team.team}</span>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <ul className="text-sm text-gray-300 space-y-1">
                          {team.completed.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <ul className="text-sm text-gray-300 space-y-1">
                          {team.inProgress.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <ul className="text-sm text-gray-300 space-y-1">
                          {team.blockers.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <ul className="text-sm text-gray-300 space-y-1">
                          {team.decisions.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="text-sm text-gray-400 font-mono space-y-1">
                          <div>{team.evidence.prs} PRs merged</div>
                          <div>{team.evidence.tickets} tickets closed</div>
                          <div>{team.evidence.decisions} decision logs</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cross-Team Progress */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Cross-Team Progress</h3>
            <ul className="space-y-2">
              {crossTeamProgress.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <span className="text-gray-600 mt-1.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Risks & Unknowns */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Risks & Unknowns</h3>
            <ul className="space-y-2">
              {risks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-500 mt-1.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Evidence Appendix */}
          <section>
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="flex items-center gap-2 text-xl font-bold text-white hover:text-gray-300 transition-colors"
            >
              <span>Evidence Appendix</span>
              <svg
                className={`w-5 h-5 transition-transform ${showEvidence ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showEvidence && (
              <div className="mt-4 text-gray-400 text-sm">
                {/* Evidence content would go here */}
                <p>Detailed evidence and supporting documents...</p>
              </div>
            )}
          </section>

          {/* Comments */}
          <section>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-xl font-bold text-white hover:text-gray-300 transition-colors mb-4"
            >
              <span>Comments</span>
              <svg
                className={`w-5 h-5 transition-transform ${showComments ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showComments && (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="pl-4 border-l-2 border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-400">
                        {comment.author} ({comment.team})
                      </span>
                      <span className="text-sm text-gray-600">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                ))}
                
                {/* Add Comment */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-400">Add Comment</span>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter your comment here..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    className="mt-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Sign-off Section */}
          <section className="border-t border-gray-700 pt-8">
            <h3 className="text-xl font-bold text-white mb-4">Sign-off</h3>
            <div className="space-y-3">
              {signOffs.map((signOff, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {signOff.approved ? (
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${signOff.approved ? 'text-green-400' : 'text-red-400'}`}>
                        {signOff.name} ({signOff.team})
                      </span>
                      {signOff.timestamp && (
                        <>
                          <span className="text-gray-600">·</span>
                          <span className="text-sm text-gray-500">{signOff.timestamp}</span>
                        </>
                      )}
                    </div>
                    {signOff.comment && (
                      <p className="text-sm text-gray-400 mt-1">{signOff.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleSignOff}
              className="mt-6 px-6 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Sign Off
            </button>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pb-8 pt-4 border-t border-gray-700">
            <button
              onClick={handleExportPDF}
              className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export as PDF
            </button>
            <button
              onClick={handleCopyText}
              className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy summary text
            </button>
            <button
              onClick={handleShareLink}
              className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share link (read-only)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
