import React, { createContext, useState, useContext, useEffect } from 'react';

const GoalContext = createContext();

export const GoalProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(() => {
    // Initialize fresh state (clear any corrupted localStorage)
    const today = new Date().toDateString();
    const savedGoal = localStorage.getItem('dailyGoal');
    const savedDate = localStorage.getItem('dailyGoalDate');
    
    // Reset if it's a new day or corrupted data
    if (!savedGoal || savedDate !== today || !savedGoal.includes('completed')) {
      const freshGoal = {
        description: 'Journal & Chat & Emotion',
        completed: {
          chat: false,
          journal: false,
          emotion: false,
        },
        total: 3,
        date: today,
      };
      localStorage.setItem('dailyGoal', JSON.stringify(freshGoal));
      localStorage.setItem('dailyGoalDate', today);
      return freshGoal;
    }
    
    try {
      const parsed = JSON.parse(savedGoal);
      // Ensure the completed property is an object
      if (typeof parsed.completed !== 'object' || parsed.completed === null) {
        parsed.completed = {
          chat: false,
          journal: false,
          emotion: false,
        };
      }
      return parsed;
    } catch (error) {
      // If parsing fails, return fresh state
      const freshGoal = {
        description: 'Journal & Chat & Emotion',
        completed: {
          chat: false,
          journal: false,
          emotion: false,
        },
        total: 3,
        date: today,
      };
      localStorage.setItem('dailyGoal', JSON.stringify(freshGoal));
      localStorage.setItem('dailyGoalDate', today);
      return freshGoal;
    }
  });

  useEffect(() => {
    localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal));
    localStorage.setItem('dailyGoalDate', new Date().toDateString());
  }, [dailyGoal]);

  const calculateCompletedCount = () => {
    let count = 0;
    if (dailyGoal.completed?.chat) count++;
    if (dailyGoal.completed?.journal) count++;
    if (dailyGoal.completed?.emotion) count++;
    return count;
  };

  const updateBackendGoalProgress = async (category, activityType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Find or create a daily goal for this category
      const response = await fetch('http://localhost:5002/api/goals/update-daily-progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          activityType,
          date: new Date().toDateString()
        })
      });

      if (!response.ok) {
        console.error('Failed to update backend goal progress');
      }
    } catch (error) {
      console.error('Error updating backend goal:', error);
    }
  };

  const markChatCompleted = () => {
    setDailyGoal(prev => {
      const updated = {
        ...prev,
        completed: { ...prev.completed, chat: true },
      };
      return updated;
    });
    // Update backend for social/communication goals
    updateBackendGoalProgress('social', 'chat');
  };

  const markJournalCompleted = () => {
    setDailyGoal(prev => {
      const updated = {
        ...prev,
        completed: { ...prev.completed, journal: true },
      };
      return updated;
    });
    // Update backend for mindfulness/habits goals
    updateBackendGoalProgress('mindfulness', 'journal');
  };

  const markEmotionCompleted = () => {
    setDailyGoal(prev => {
      const updated = {
        ...prev,
        completed: { ...prev.completed, emotion: true },
      };
      return updated;
    });
    // Update backend for mood tracking goals
    updateBackendGoalProgress('mood', 'emotion');
  };

  const resetDailyGoal = () => {
    const today = new Date().toDateString();
    const freshGoal = {
      description: 'Journal & Chat & Emotion',
      completed: {
        chat: false,
        journal: false,
        emotion: false,
      },
      total: 3,
      date: today,
    };
    setDailyGoal(freshGoal);
    localStorage.setItem('dailyGoal', JSON.stringify(freshGoal));
    localStorage.setItem('dailyGoalDate', today);
  };

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:5002/api/goals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      } else {
        console.error('Failed to fetch goals:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const logProgress = async (goalId, progressData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to log progress');
        return;
      }

      const response = await fetch(`http://localhost:5002/api/goals/${goalId}/log`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(goals.map(goal =>
          goal._id === goalId ? updatedGoal : goal
        ));
        fetchGoals();
        return updatedGoal;
      } else {
        const error = await response.json();
        alert(`Failed to log progress: ${error.message}`);
      }
    } catch (error) {
      console.error('Error logging progress:', error);
      alert('Failed to log progress. Please try again.');
    }
  };

  const checkIn = async (goalId, responses) => {
    try {
      setAiLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5002/api/goals/${goalId}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ responses })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Check-in completed:', result.message);
        fetchGoals();
      }
    } catch (error) {
      console.error('Error during check-in:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const currentCompletedCount = calculateCompletedCount();

  return (
    <GoalContext.Provider value={{
      dailyGoal: {
        ...dailyGoal,
        completed: currentCompletedCount,
        completionState: dailyGoal.completed
      },
      goals,
      aiLoading,
      fetchGoals,
      markChatCompleted,
      markJournalCompleted,
      markEmotionCompleted,
      resetDailyGoal,
      logProgress,
      checkIn,
    }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoal = () => useContext(GoalContext);
