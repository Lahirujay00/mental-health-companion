import React, { useState } from 'react';

// Progress Log Modal Component
export const ProgressLogModal = ({ goal, onClose, onSubmit }) => {
  const [logData, setLogData] = useState({
    completed: false,
    value: '',
    mood: 5,
    challenges: [],
    notes: '',
    reflection: ''
  });

  const challengeOptions = [
    'time', 'motivation', 'energy', 'stress', 'circumstances', 'health', 'other'
  ];

  const handleSubmit = () => {
    onSubmit(logData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-calm-900">Track Today's Progress</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Record your daily progress and reflections</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-4">
            {/* Completion Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={logData.completed}
                  onChange={(e) => setLogData({...logData, completed: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm font-medium">I completed my goal today</span>
              </label>
            </div>

            {/* Value Input */}
            {goal.targetValue && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value ({goal.targetUnit || 'units'})
                </label>
                <input
                  type="number"
                  value={logData.value}
                  onChange={(e) => setLogData({...logData, value: e.target.value})}
                  placeholder={`Target: ${goal.targetValue}`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How's your mood? (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={logData.mood}
                onChange={(e) => setLogData({...logData, mood: Number(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 (Poor)</span>
                <span className="font-medium">{logData.mood}</span>
                <span>10 (Excellent)</span>
              </div>
            </div>

            {/* Challenges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenges faced (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {challengeOptions.map(challenge => (
                  <label key={challenge} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={logData.challenges.includes(challenge)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLogData({
                            ...logData, 
                            challenges: [...logData.challenges, challenge]
                          });
                        } else {
                          setLogData({
                            ...logData,
                            challenges: logData.challenges.filter(c => c !== challenge)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{challenge}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={logData.notes}
                onChange={(e) => setLogData({...logData, notes: e.target.value})}
                placeholder="How did it go? Any observations?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows="3"
              />
            </div>

            {/* Reflection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reflection
              </label>
              <textarea
                value={logData.reflection}
                onChange={(e) => setLogData({...logData, reflection: e.target.value})}
                placeholder="What did you learn? How do you feel?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-6 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            Save Today's Progress
          </button>
        </div>
      </div>
    </div>
  );
};

// Check-in Modal Component
export const CheckInModal = ({ goal, onClose, onSubmit, isLoading }) => {
  const [responses, setResponses] = useState({
    feeling: '',
    progress: '',
    challenges: '',
    support: '',
    tomorrow: ''
  });

  const questions = [
    { key: 'feeling', text: 'How are you feeling about your progress today?', options: ['great', 'good', 'okay', 'struggling'] },
    { key: 'progress', text: 'How is your progress overall?', options: ['ahead', 'on-track', 'behind', 'stuck'] },
    { key: 'challenges', text: 'What\'s been your biggest challenge?', type: 'text' },
    { key: 'support', text: 'How can I support you better?', type: 'text' },
    { key: 'tomorrow', text: 'What\'s your plan for tomorrow?', type: 'text' }
  ];

  const handleSubmit = () => {
    onSubmit(responses);
    onClose(); // Close modal immediately after submitting
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-calm-900">Quick Mental Health Check</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Get personalized AI guidance and reflection</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {index + 1}. {question.text}
                </label>
                
                {question.options ? (
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map(option => (
                      <button
                        key={option}
                        onClick={() => setResponses({...responses, [question.key]: option})}
                        className={`p-2 text-sm rounded-lg border ${
                          responses[question.key] === option
                            ? 'bg-primary-100 border-primary-500 text-primary-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={responses[question.key]}
                    onChange={(e) => setResponses({...responses, [question.key]: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows="2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 p-6 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Getting AI Guidance...</span>
              </div>
            ) : (
              'Get AI Guidance'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
