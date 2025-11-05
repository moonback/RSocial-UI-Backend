// Utilitaires de validation

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^(\+33|0)[1-9](\d{2}){4}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.length <= maxLength;
};

export const validatePrice = (price) => {
  return !isNaN(price) && price >= 0;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

