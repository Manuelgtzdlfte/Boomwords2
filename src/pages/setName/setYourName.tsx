import { useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import './setYourName.css';
import { userService } from '../../components/userService/userService';

export const SetYourName = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ username: '', email: '', accessKey: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  
  const validateForm = () => {
    const newErrors = { username: '', email: '', accessKey: '' };
    let isValid = true;

    if (!username.trim() && !showForgotPassword) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3 && !showForgotPassword) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Email validation for registration and recovery
    if ((!isLogin || showForgotPassword) && !email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if ((!isLogin || showForgotPassword) && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!accessKey.trim() && !showForgotPassword) {
      newErrors.accessKey = 'Access key is required';
      isValid = false;
    } else if (accessKey.length < 6 && !showForgotPassword) {
      newErrors.accessKey = 'Access key must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (showForgotPassword) {
      handlePasswordRecovery();
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (isLogin) {
        const user = userService.loginUser(username, accessKey);
        if (user) {
          userService.setCurrentUser(user);
          goToChooseDif();
        } else {
          setErrors({ 
            username: 'Invalid credentials', 
            email: '',
            accessKey: 'Invalid credentials' 
          });
        }
      } else {
        // Register with email
        const success = userService.registerUser(username, email, accessKey);
        if (success) {
          const user = userService.loginUser(username, accessKey);
          if (user) {
            userService.setCurrentUser(user);
            goToChooseDif();
          }
        } else {
          // Check if username or email is taken
          const users = userService.getUsers();
          if (users.find(u => u.username === username)) {
            setErrors({ 
              username: 'Username already taken', 
              email: '',
              accessKey: '' 
            });
          } else if (users.find(u => u.email === email)) {
            setErrors({ 
              username: '', 
              email: 'Email already registered',
              accessKey: '' 
            });
          }
        }
      }
      setIsSubmitting(false);
    }, 1000);
  }

  const handlePasswordRecovery = () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const accessKey = userService.recoverPassword(email);
      
      if (accessKey) {
        // place the email logic 
        setRecoveryMessage(`Password recovery instructions have been sent to ${email}`);
      } else {
        setRecoveryMessage('Email not found. Please check your email address.');
      }
      
      setIsSubmitting(false);
    }, 1000);
  }

  const resetPasswordFlow = () => {
    setShowForgotPassword(true);
    setUsername('');
    setAccessKey('');
    setRecoveryMessage('');
    setErrors({ username: '', email: '', accessKey: '' });
  }

  const cancelRecovery = () => {
    setShowForgotPassword(false);
    setRecoveryMessage('');
    setErrors({ username: '', email: '', accessKey: '' });
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    setRecoveryMessage('');
    setErrors({ username: '', email: '', accessKey: '' });
  };
  
  const goToChooseDif = () => {
    navigate('/chooseDif');
  }
  
  return (
    <div className='setYourName-body'>
      <div className="glitch-form-wrapper">
        <div className="glitch-card">
          <div className="card-header">
            <div className="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"/>
              </svg>
              <span>
                {showForgotPassword ? 'Password Recovery' : (isLogin ? 'Access System' : 'Create Account')}
              </span>
            </div>
            <div className="card-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Username field - hidden during password recovery */}
              {!showForgotPassword && (
                <div className="form-group">
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors({...errors, username: ''});
                    }}
                    required 
                    placeholder=" "
                    disabled={isSubmitting}
                    className={errors.username ? 'input-error' : ''}
                  />
                  <label htmlFor="username" className="form-label" data-text="USERNAME">
                    USERNAME
                  </label>
                  {errors.username && <span className="error-message">{errors.username}</span>}
                </div>
              )}

              {/* Email field - shown during registration and password recovery */}
              {(!isLogin || showForgotPassword) && (
                <div className="form-group">
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({...errors, email: ''});
                      setRecoveryMessage('');
                    }}
                    required 
                    placeholder=" "
                    disabled={isSubmitting}
                    className={errors.email ? 'input-error' : ''}
                  />
                  <label htmlFor="email" className="form-label" data-text="EMAIL">
                    EMAIL
                  </label>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              )}

              {/* Password field - hidden during password recovery */}
              {!showForgotPassword && (
                <div className="form-group">
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={accessKey}
                    onChange={(e) => {
                      setAccessKey(e.target.value);
                      if (errors.accessKey) setErrors({...errors, accessKey: ''});
                    }}
                    required 
                    placeholder=" "
                    disabled={isSubmitting}
                    className={errors.accessKey ? 'input-error' : ''}
                  />
                  <label htmlFor="password" className="form-label" data-text="ACCESS_KEY">
                    ACCESS_KEY
                  </label>
                  {errors.accessKey && <span className="error-message">{errors.accessKey}</span>}
                </div>
              )}

              {/* Recovery message */}
              {showForgotPassword && (
                <div className="recovery-message">
                  {recoveryMessage && (
                    <div className={`recovery-alert ${recoveryMessage.includes('not found') ? 'error' : 'success'}`}>
                      {recoveryMessage}
                    </div>
                  )}
                </div>
              )}
              
              <button 
                data-text={
                  showForgotPassword ? 'SEND_RECOVERY_EMAIL' : 
                  (isLogin ? 'ACCESS_SYSTEM' : 'CREATE_ACCOUNT')
                } 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
                onKeyPress={handleKeyPress}
              >
                <span className="btn-text">
                  {isSubmitting ? 'PROCESSING...' : 
                   (showForgotPassword ? 'SEND_RECOVERY_EMAIL' : 
                    (isLogin ? 'ACCESS_SYSTEM' : 'CREATE_ACCOUNT'))
                  }
                </span>
                {isSubmitting && <div className="loading-spinner"></div>}
              </button>
              
              <div className="form-actions">
                {isLogin && !showForgotPassword && (
                  <button type="button" onClick={resetPasswordFlow} className="forgot-btn">
                    Forgot your access key?
                  </button>
                )}
                
                {showForgotPassword && (
                  <button type="button" onClick={cancelRecovery} className="forgot-btn">
                    Back to login
                  </button>
                )}
                
                <button type="button" onClick={toggleMode} className="toggle-btn">
                  {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}