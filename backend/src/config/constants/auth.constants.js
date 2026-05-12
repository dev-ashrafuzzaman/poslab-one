export const AUTH = Object.freeze({
  TOKEN_TYPE: "JWT",
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 16,
  OTP_EXPIRE_MINUTES: 5
});

export const LOGIN_SECURITY = Object.freeze({
  MAX_ATTEMPTS: 5,              
  LOCK_MINUTES: 15,             
  RATE_LIMIT_WINDOW_SEC: 60,    
  RATE_LIMIT_MAX: 10            
});
