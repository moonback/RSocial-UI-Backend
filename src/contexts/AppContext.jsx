import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockPosts, mockGroups, mockEvents, mockClassifieds, mockUsers } from '../data/mockData';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [classifieds, setClassifieds] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    // Charger les données mockées
    setPosts(mockPosts);
    setGroups(mockGroups);
    setEvents(mockEvents);
    setClassifieds(mockClassifieds);
    setUsers(mockUsers);
  }, []);

  // Gestion des posts
  const addPost = (post) => {
    const newPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      likedBy: [],
    };
    setPosts([newPost, ...posts]);
    
    // Créer une notification pour les utilisateurs à proximité
    addNotification({
      type: 'new_post',
      message: `Nouveau post: ${post.content.substring(0, 50)}...`,
      postId: newPost.id,
    });
    
    return newPost;
  };

  const deletePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const likePost = (postId, userId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(userId);
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked 
            ? post.likedBy.filter(id => id !== userId)
            : [...post.likedBy, userId],
        };
      }
      return post;
    }));
  };

  const addComment = (postId, comment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now().toString(),
            ...comment,
            createdAt: new Date().toISOString(),
          }],
        };
      }
      return post;
    }));
  };

  // Gestion des groupes
  const addGroup = (group) => {
    const newGroup = {
      ...group,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      members: [group.createdBy],
    };
    setGroups([...groups, newGroup]);
    return newGroup;
  };

  const joinGroup = (groupId, userId) => {
    setGroups(groups.map(group => {
      if (group.id === groupId && !group.members.includes(userId)) {
        return {
          ...group,
          members: [...group.members, userId],
        };
      }
      return group;
    }));
  };

  const leaveGroup = (groupId, userId) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter(id => id !== userId),
        };
      }
      return group;
    }));
  };

  // Gestion des événements
  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      attendees: [event.createdBy],
    };
    setEvents([...events, newEvent]);
    
    addNotification({
      type: 'new_event',
      message: `Nouvel événement: ${event.title}`,
      eventId: newEvent.id,
    });
    
    return newEvent;
  };

  const rsvpEvent = (eventId, userId) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const isAttending = event.attendees.includes(userId);
        return {
          ...event,
          attendees: isAttending
            ? event.attendees.filter(id => id !== userId)
            : [...event.attendees, userId],
        };
      }
      return event;
    }));
  };

  // Gestion des petites annonces
  const addClassified = (classified) => {
    const newClassified = {
      ...classified,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setClassifieds([...classifieds, newClassified]);
    return newClassified;
  };

  const deleteClassified = (classifiedId) => {
    setClassifieds(classifieds.filter(c => c.id !== classifiedId));
  };

  // Gestion des messages
  const sendMessage = (message) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages([...messages, newMessage]);
    
    addNotification({
      type: 'new_message',
      message: `Nouveau message de ${message.senderName}`,
      messageId: newMessage.id,
    });
    
    return newMessage;
  };

  const markMessageAsRead = (messageId) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  // Gestion des notifications
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  // Gestion de la modération
  const reportContent = (report) => {
    const newReport = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setReports([...reports, newReport]);
    
    addNotification({
      type: 'report_submitted',
      message: 'Votre signalement a été soumis',
    });
  };

  const blockUser = (userId) => {
    if (!blockedUsers.includes(userId)) {
      setBlockedUsers([...blockedUsers, userId]);
    }
  };

  const unblockUser = (userId) => {
    setBlockedUsers(blockedUsers.filter(id => id !== userId));
  };

  const value = {
    // State
    posts,
    groups,
    events,
    classifieds,
    users,
    messages,
    notifications,
    reports,
    blockedUsers,
    
    // Posts
    addPost,
    deletePost,
    likePost,
    addComment,
    
    // Groups
    addGroup,
    joinGroup,
    leaveGroup,
    
    // Events
    addEvent,
    rsvpEvent,
    
    // Classifieds
    addClassified,
    deleteClassified,
    
    // Messages
    sendMessage,
    markMessageAsRead,
    
    // Notifications
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    
    // Moderation
    reportContent,
    blockUser,
    unblockUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

