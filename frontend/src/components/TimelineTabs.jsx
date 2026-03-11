import React from 'react';

const TimelineTabs = ({ activeTimeline, onTimelineChange }) => {
  return (
    <div className="timeline-tabs">
      <button
        className={activeTimeline === 'home' ? 'active' : ''}
        onClick={() => onTimelineChange('home')}
      >
        Following
      </button>
      <button
        className={activeTimeline === 'local' ? 'active' : ''}
        onClick={() => onTimelineChange('local')}
      >
        Public
      </button>
    </div>
  );
};

export default TimelineTabs;