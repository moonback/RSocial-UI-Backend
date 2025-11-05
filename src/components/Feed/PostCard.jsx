import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import postService from '../../services/postService';
import { formatRelativeTime } from '../../utils/dateUtils';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import './Feed.css';

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const { reportContent } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(user.id) || post.isLiked || false);
  const [isDisliked, setIsDisliked] = useState(post.dislikedBy?.includes(user.id) || post.isDisliked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [dislikesCount, setDislikesCount] = useState(post.dislikes || 0);
  const [comments, setComments] = useState(post.comments || []);

  const distance = calculateDistance(
    user.location.lat,
    user.location.lng,
    post.location.lat,
    post.location.lng
  );

  const isMyPost = post.user_id === user.id || post.userId === user.id;

  const handleLike = async () => {
    try {
      const wasDisliked = isDisliked;
      const result = await postService.likePost(post.id);
      
      setIsLiked(result.liked);
      setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
      
      // Si on like et qu'il y avait un dislike, le backend l'a retiré
      if (result.liked && wasDisliked) {
        setIsDisliked(false);
        setDislikesCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const handleDislike = async () => {
    try {
      const wasLiked = isLiked;
      const result = await postService.dislikePost(post.id);
      
      setIsDisliked(result.disliked);
      setDislikesCount(prev => result.disliked ? prev + 1 : prev - 1);
      
      // Si on dislike et qu'il y avait un like, le backend l'a retiré
      if (result.disliked && wasLiked) {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur dislike:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      try {
        const newComment = await postService.addComment(post.id, commentText);
        setComments([...comments, newComment]);
        setCommentText('');
      } catch (error) {
        console.error('Erreur commentaire:', error);
        alert('Erreur lors de l\'ajout du commentaire');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      try {
        await postService.deletePost(post.id);
        if (onPostDeleted) {
          onPostDeleted();
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression du post');
      }
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

  const formatPostContent = (content) => {
    if (!content) return '';

    // Diviser le contenu en lignes
    return content.split('\n').map((line, lineIndex) => (
      <span key={lineIndex}>
        {line.split(/(\s+)/).map((part, partIndex) => {
          // Hashtags
          if (part.startsWith('#')) {
            const hashtag = part.slice(1);
            return (
              <span
                key={partIndex}
                className="hashtag"
                onClick={() => {
                  // Ici on pourrait déclencher une recherche par hashtag
                  console.log('Recherche hashtag:', hashtag);
                }}
              >
                {part}
              </span>
            );
          }
          // Mentions
          else if (part.startsWith('@')) {
            const mention = part.slice(1);
            return (
              <span
                key={partIndex}
                className="mention"
                onClick={() => {
                  // Ici on pourrait naviguer vers le profil
                  console.log('Mention utilisateur:', mention);
                }}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
        {lineIndex < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-user-info">
          <img src={post.users?.avatar || post.userAvatar} alt={post.users?.name || post.userName} className="post-avatar" />
          <div>
            <div className="post-user-name">{post.users?.name || post.userName}</div>
            <div className="post-meta">
              {formatRelativeTime(post.created_at || post.createdAt)} • {formatDistance(distance)}
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
        <div className="post-text">
          {formatPostContent(post.content)}
        </div>
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((image, index) => (
              <div key={index} className="post-image-container">
                <img src={image} alt="" className="post-image" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="post-stats">
        <span>{likesCount} J'aime</span>
        {dislikesCount > 0 && <span>{dislikesCount} J'aime pas</span>}
        <span>{comments.length} Commentaires</span>
      </div>

      <div className="post-footer">
        <button
          className={`post-action-btn like-btn ${isLiked ? 'post-action-active' : ''}`}
          onClick={handleLike}
        >
          <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span className="action-text">J'aime</span>
          {likesCount > 0 && <span className="action-count">{likesCount}</span>}
        </button>
        <button
          className={`post-action-btn dislike-btn ${isDisliked ? 'post-action-dislike-active' : ''}`}
          onClick={handleDislike}
        >
          <span className="action-icon">{isDisliked ? '👎' : '👍'}</span>
          <span className="action-text">J'aime pas</span>
          {dislikesCount > 0 && <span className="action-count">{dislikesCount}</span>}
        </button>
        <button
          className={`post-action-btn comment-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          <span className="action-icon">💬</span>
          <span className="action-text">Commenter</span>
          {comments.length > 0 && <span className="action-count">{comments.length}</span>}
        </button>
        <button
          className="post-action-btn share-btn"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Publication de ${post.users?.name || post.userName}`,
                text: post.content,
                url: window.location.href,
              });
            } else {
              // Fallback: copier le lien
              navigator.clipboard.writeText(window.location.href);
              alert('Lien copié dans le presse-papiers !');
            }
          }}
        >
          <span className="action-icon">📤</span>
          <span className="action-text">Partager</span>
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
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <img src={comment.user?.avatar || comment.userAvatar} alt={comment.user?.name || comment.userName} className="comment-avatar" />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-user">{comment.user?.name || comment.userName}</span>
                    <span className="comment-time">
                      {formatRelativeTime(comment.created_at || comment.createdAt)}
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

