import React from 'react'

function Avatar({ user }) {
  if (user.avatar)
    return (
      <img
        src={user.avatar}
        alt={user.fullName}
        className="size-9 rounded-full object-cover shrink-0"
      />
    );
  return (
    <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
      {user.fullName?.charAt(0)}
    </div>
  );
}

export default Avatar