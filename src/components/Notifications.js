// src/components/Notifications.js

import React from 'react';

const Notifications = ({ notifications }) => {
  return (
    <div className="notifications">
      {notifications.map((notif, index) => (
        <div key={index} className="notification">
          <strong>{notif.message}</strong>
          <br />
          <small>{formatTimeAgo(notif.time)}</small>
        </div>
      ))}
    </div>
  );
};

const formatTimeAgo = (time) => {
  const diff = Math.floor((new Date() - time) / 60000); // difference in minutes
  if (diff < 1) return 'Just now';
  if (diff === 1) return '1 minute ago';
  if (diff < 60) return `${diff} minutes ago`;
  const hours = Math.floor(diff / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

export default Notifications;
