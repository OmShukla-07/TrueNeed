import { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebase';
import { authAPI } from './api';

/**
 * Firebase Phone Authentication Component
 * 
 * Usage in App.jsx:
 * import PhoneAuth from './PhoneAuth';
 * <PhoneAuth onSuccess={(user) => setCurrentUser(user)} />
 */
export default function PhoneAuth({ onSuccess, onError, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [requiresRegistration, setRequiresRegistration] = useState(false);

  // Initialize reCAPTCHA verifier
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA solved');
        }
      });
    }
  };

  // Send OTP to phone number
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate phone number (must include country code)
      if (!phoneNumber.startsWith('+')) {
        setError('Phone number must include country code (e.g., +1234567890)');
        setLoading(false);
        return;
      }

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      setLoading(false);
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP');
      setLoading(false);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  // Verify OTP and authenticate
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const firebaseToken = await result.user.getIdToken();

      // Send token to backend
      try {
        const response = await authAPI.firebasePhoneAuth(firebaseToken, name);
        
        if (onSuccess) {
          onSuccess(response.user);
        }
      } catch (backendError) {
        // Check if registration is required
        if (backendError.message.includes('requires_registration')) {
          setRequiresRegistration(true);
          setStep('register');
          setLoading(false);
          return;
        }
        throw backendError;
      }

      setLoading(false);
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Invalid OTP code');
      setLoading(false);
    }
  };

  // Complete registration with name
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const firebaseToken = await auth.currentUser.getIdToken();
      const response = await authAPI.firebasePhoneAuth(firebaseToken, name);
      
      if (onSuccess) {
        onSuccess(response.user);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error registering:', err);
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="phone-auth-container">
      <div id="recaptcha-container"></div>
      
      {step === 'phone' && (
        <form onSubmit={handleSendOTP}>
          <h3>Phone Login</h3>
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="+919876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={loading}
            />
            <small>Enter your 10-digit mobile number</small>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP}>
          <h3>Enter OTP</h3>
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label>6-Digit OTP</label>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
              disabled={loading}
            />
            <small>Check your SMS for the verification code</small>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          <button 
            type="button" 
            onClick={() => setStep('phone')} 
            className="auth-back-btn"
            disabled={loading}
          >
            Change Number
          </button>
        </form>
      )}

      {step === 'register' && (
        <form onSubmit={handleRegister}>
          <h3>Complete Registration</h3>
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
      )}

      {onClose && (
        <button onClick={onClose} className="auth-close-modal">
          Back to Email Login
        </button>
      )}
    </div>
  );
}
