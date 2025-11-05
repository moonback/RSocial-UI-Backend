import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import './Feed.css';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const { likePost, addComment, deletePost, reportContent } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const distance = calculateDistance(
    user.location.lat,
    user.location.lng,
    post.location.lat,
    post.location.lng
  );

  const isLiked = post.likedBy.includes(user.id);
  const isMyPost = post.userId === user.id;

  const handleLike = () => {
    likePost(post.id, user.id);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(post.id, {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: commentText,
      });
      setCommentText('');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      deletePost(post.id);
    }
  };

  const handleReport = () => {
    const reason = prompt('Raison du signalement :');
    if (reason) {
      reportContent({
        type: 'post',
        contentId: post.id,
        reason,
        reportedBy: user.id,
      });
      alert('Signalement envoyé. Merci de votre contribution.');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Annonce': '#3b82f6',
      'Événement': '#8b5cf6',
      'Aide': '#10b981',
      'Perdu/Trouvé': '#f59e0b',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-user-info">
          <img src={post.userAvatar} alt={post.userName} className="post-avatar" />
          <div>
            <div className="post-user-name">{post.userName}</div>
            <div className="post-meta">
              {formatRelativeTime(post.createdAt)} • {formatDistance(distance)}
            </div>
          </div>
        </div>
        <div className="post-actions">
          <span 
            className="post-type-badge" 
            style={{ backgroundColor: getTypeColor(post.type) }}
          >
            {post.type}
          </span>
          <button className="post-menu-button" onClick={() => setShowMenu(!showMenu)}>
            ⋮
          </button>
          {showMenu && (
            <div className="post-menu">
              {isMyPost ? (
                <button onClick={handleDelete}>🗑️ Supprimer</button>
              ) : (
                <button onClick={handleReport}>⚠️ Signaler</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((image, index) => (
              <img key={index} src={image} alt="" className="post-image" />
            ))}
          </div>
        )}
      </div>

      <div className="post-stats">
        <span>{post.likes} J'aime</span>
        <span>{post.comments.length} Commentaires</span>
      </div>

      <div className="post-footer">
        <button 
          className={`post-action-btn ${isLiked ? 'post-action-active' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? '❤️' : '🤍'} J'aime
        </button>
        <button 
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Commenter
        </button>
      </div>

      {showComments && (
        <div className="post-comments-section">
          <form onSubmit={handleComment} className="comment-form">
            <img src={user.avatar} alt={user.name} className="comment-avatar" />
            <input
              type="text"
              placeholder="Écrivez un commentaire..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="comment-submit">
              ➤
            </button>
          </form>

          <div className="comments-list">
            {post.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <img src={comment.userAvatar} alt={comment.userName} className="comment-avatar" />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-user">{comment.userName}</span>
                    <span className="comment-time">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;

