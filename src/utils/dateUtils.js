import { formatDistanceToNow, format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date relative (il y a X minutes/heures/jours)
 */
export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: fr,
  });
};

/**
 * Formate une date complète
 */
export const formatFullDate = (date) => {
  return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr });
};

/**
 * Formate une date courte
 */
export const formatShortDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
};

/**
 * Formate une heure
 */
export const formatTime = (date) => {
  return format(new Date(date), 'HH:mm', { locale: fr });
};

/**
 * Formate une date d'événement de manière contextuelle
 */
export const formatEventDate = (date) => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Aujourd'hui à ${formatTime(date)}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Demain à ${formatTime(date)}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Hier à ${formatTime(date)}`;
  }
  
  return format(dateObj, 'EEEE dd MMMM à HH:mm', { locale: fr });
};

