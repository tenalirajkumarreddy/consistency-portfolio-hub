
import { useState } from 'react';

const ConsistencyTracker = () => {
  // Placeholder data - will be replaced with real data
  const [currentStreak] = useState(5);
  const [maxStreak] = useState(12);
  const [activities] = useState(
    Array.from({ length: 365 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      hasActivity: Math.random() > 0.5,
    }))
  );

  return (
    <div className="glass-panel rounded-xl p-6 scale-enter">
      <h2 className="text-2xl font-semibold mb-4">My Consistency</h2>
      <div className="flex gap-8 mb-6">
        <div>
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-3xl font-bold">{currentStreak} days</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Longest Streak</p>
          <p className="text-3xl font-bold">{maxStreak} days</p>
        </div>
      </div>
      <div className="consistency-grid">
        {activities.map((activity, index) => (
          <div
            key={index}
            className={`consistency-cell ${
              activity.hasActivity
                ? 'bg-primary/80 hover:bg-primary'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title={activity.date.toLocaleDateString()}
          />
        ))}
      </div>
    </div>
  );
};

export default ConsistencyTracker;
