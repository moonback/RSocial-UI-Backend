import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius, className = '' }) => {
  const style = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: borderRadius || 'var(--radius-sm)',
  };

  return <div className={`skeleton ${className}`} style={style} />;
};

export const PostCardSkeleton = () => {
  return (
    <div className="post-card-skeleton">
      <div className="skeleton-header">
        <Skeleton width="48px" height="48px" borderRadius="var(--radius-full)" />
        <div className="skeleton-text-group">
          <Skeleton width="120px" height="16px" />
          <Skeleton width="80px" height="14px" />
        </div>
      </div>
      <Skeleton width="100%" height="16px" className="skeleton-line" />
      <Skeleton width="90%" height="16px" className="skeleton-line short" />
      <Skeleton width="70%" height="16px" className="skeleton-line short" />
      <div className="skeleton-actions">
        <Skeleton width="80px" height="32px" />
        <Skeleton width="80px" height="32px" />
        <Skeleton width="80px" height="32px" />
      </div>
    </div>
  );
};

export const EventCardSkeleton = () => {
  return (
    <div className="event-card-skeleton">
      <Skeleton width="100%" height="200px" borderRadius="0" />
      <div className="skeleton-content">
        <Skeleton width="100px" height="24px" />
        <Skeleton width="80%" height="20px" className="skeleton-line" />
        <Skeleton width="100%" height="16px" className="skeleton-line" />
        <Skeleton width="90%" height="16px" className="skeleton-line short" />
        <Skeleton width="100%" height="44px" />
      </div>
    </div>
  );
};

export const ClassifiedCardSkeleton = () => {
  return (
    <div className="classified-card-skeleton">
      <Skeleton width="100%" height="200px" borderRadius="0" />
      <div className="skeleton-content">
        <Skeleton width="80px" height="24px" />
        <Skeleton width="85%" height="18px" className="skeleton-line" />
        <Skeleton width="100%" height="14px" className="skeleton-line" />
        <Skeleton width="90%" height="14px" className="skeleton-line short" />
        <Skeleton width="100%" height="40px" />
      </div>
    </div>
  );
};

export const GroupCardSkeleton = () => {
  return (
    <div className="group-card-skeleton">
      <Skeleton width="100%" height="150px" borderRadius="0" />
      <div className="skeleton-content">
        <Skeleton width="70%" height="20px" className="skeleton-line" />
        <Skeleton width="100%" height="14px" className="skeleton-line" />
        <Skeleton width="85%" height="14px" className="skeleton-line short" />
        <Skeleton width="100%" height="40px" />
      </div>
    </div>
  );
};

export default Skeleton;

