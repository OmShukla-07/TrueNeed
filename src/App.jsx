import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingDown, CheckCircle, XCircle, Zap, Brain, IndianRupee, MessageSquare, Moon, Sun, Send, ChevronDown, Menu, X, ChevronLeft, ChevronRight, ArrowUpRight, Lock, Download, Trash2 } from 'lucide-react';
import './App.css';
import './ChatInterface.css';
import logoWithName from './assets/logo with name.png';
import logo from './assets/logo.png';
import phoneIcon from './assets/mobile.png';
import laptopIcon from './assets/laptop.png';
import headphonesIcon from './assets/headphoes.png';
import cameraIcon from './assets/cammera.png';
import watchIcon from './assets/smartwatch.png';
import controllerIcon from './assets/controller.png';
import earpodsIcon from './assets/earpods.png';
import tabletIcon from './assets/tab.png';
import { useState, useEffect } from 'react';
import { authAPI } from './api';

function TypingText() {
  const words = ['Need.', 'Sell.'];
  
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('Need.');
  const [isDeleting, setIsDeleting] = useState(true);
  const [isRetyping, setIsRetyping] = useState(false);
  const [isPausedAfter, setIsPausedAfter] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Pause after retyping before transitioning
    if (isPausedAfter) {
      const pauseTimeout = setTimeout(() => {
        setIsPausedAfter(false);
        setIsTransitioning(true);
      }, 3000);
      return () => clearTimeout(pauseTimeout);
    }

    // Transition between words (cursor hidden)
    if (isTransitioning) {
      const transitionTimeout = setTimeout(() => {
        setIsTransitioning(false);
        const nextIndex = (wordIndex + 1) % words.length;
        setWordIndex(nextIndex);
        setDisplayText(words[nextIndex]);
        setIsDeleting(true);
      }, 500);
      return () => clearTimeout(transitionTimeout);
    }

    const fullWord = words[wordIndex];

    const typingTimeout = setTimeout(() => {
      if (isDeleting) {
        // Deleting the word
        if (displayText.length > 0) {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        } else {
          // Finished deleting, start retyping
          setIsDeleting(false);
          setIsRetyping(true);
        }
      } else if (isRetyping) {
        // Retyping the word
        if (displayText.length < fullWord.length) {
          setDisplayText(fullWord.substring(0, displayText.length + 1));
        } else {
          // Finished retyping
          setIsRetyping(false);
          setIsPausedAfter(true);
        }
      }
    }, isDeleting ? 80 : 150);

    return () => clearTimeout(typingTimeout);
  }, [displayText, isDeleting, isRetyping, isPausedAfter, isTransitioning, wordIndex, words]);

  return { displayText, wordIndex, showCursor: !isTransitioning };
}

function TypingTextWrapper() {
  const { displayText, wordIndex, showCursor } = TypingText();
  
  return (
    <h1 
      key={wordIndex}
      className="hero-title"
    >
      <span style={{ whiteSpace: 'nowrap' }}>
        Buy What You {wordIndex === 0 ? (
          <span className="typing-word">{displayText}{showCursor && <span className="typing-cursor">|</span>}</span>
        ) : (
          <span className="typing-word">Need.</span>
        )}
      </span>
      <br />
      <span className="hero-accent">
        Not What They {wordIndex === 1 ? (
          <span className="typing-word">{displayText}{showCursor && <span className="typing-cursor">|</span>}</span>
        ) : (
          'Sell.'
        )}
      </span>
    </h1>
  );
}

function App() {
  const [theme, setTheme] = useState('dark');
  const [isChatMode, setIsChatMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      type: 'user', 
      message: 'I need a laptop for coding and video editing under ₹80,000' 
    },
    { 
      type: 'ai', 
      message: 'Great! I\'ve analyzed your requirements and found some excellent options for you. Based on your needs for coding and video editing under ₹80,000, here are my top recommendations:',
      products: [
        {
          id: 'macbook-air-m1',
          name: 'MacBook Air M1',
          price: '₹72,990',
          verdict: 'Perfect Match',
          verdictColor: '#dcfce7',
          verdictText: '#166534',
          specs: 'M1 Chip, 8GB RAM, 256GB SSD, 13.3" Retina Display',
          features: ['15-18h Battery', 'Fanless Design', 'Fast Performance', 'Excellent for Video Editing'],
          description: 'The MacBook Air M1 is perfect for your coding and video editing needs. The M1 chip provides exceptional performance while maintaining excellent battery life.',
          pros: ['Outstanding battery life (15-18 hours)', 'Silent fanless design', 'Excellent performance for video editing', 'Premium build quality', 'Great display'],
          cons: ['Limited to 8GB RAM', 'Only 256GB storage', 'macOS only', 'Limited ports (2x USB-C)'],
          ratings: {
            performance: 92,
            battery: 95,
            build: 90,
            value: 88
          }
        },
        {
          id: 'dell-xps-13',
          name: 'Dell XPS 13',
          price: '₹79,990',
          verdict: 'Good Value',
          verdictColor: '#dbeafe',
          verdictText: '#1e40af',
          specs: 'Intel i7-1165G7, 16GB RAM, 512GB SSD, 13.4" FHD+',
          features: ['Windows Compatible', 'More RAM', 'Larger SSD', 'Great Build Quality'],
          description: 'The Dell XPS 13 offers excellent Windows compatibility with more RAM and storage, perfect for development work.',
          pros: ['More RAM (16GB)', 'Larger storage (512GB)', 'Windows ecosystem', 'Good performance', 'Premium build'],
          cons: ['Lower battery life (10-12 hours)', 'Gets warm under load', 'More expensive', 'Webcam placement'],
          ratings: {
            performance: 88,
            battery: 82,
            build: 90,
            value: 85
          }
        },
        {
          id: 'lenovo-ideapad',
          name: 'Lenovo IdeaPad Slim 5',
          price: '₹65,990',
          verdict: 'Budget Pick',
          verdictColor: '#fef3c7',
          verdictText: '#92400e',
          specs: 'AMD Ryzen 7 5700U, 16GB RAM, 512GB SSD, 14" FHD',
          features: ['Best Value', 'Good Performance', 'Decent Battery', 'Affordable'],
          description: 'Great budget option with solid specs. Best value for money if you want to save some cash.',
          pros: ['Most affordable', 'Good specs for price', '16GB RAM', '512GB storage', 'Decent performance'],
          cons: ['Build quality not premium', 'Average display', 'Battery life not as good', 'Heavier'],
          ratings: {
            performance: 82,
            battery: 78,
            build: 75,
            value: 92
          }
        }
      ]
    },
    { 
      type: 'user', 
      message: 'Which one has better battery life?' 
    },
    { 
      type: 'ai', 
      message: 'The MacBook Air M1 has superior battery life, lasting up to 15-18 hours on a single charge. The M1 chip is incredibly power-efficient, making it perfect for long coding sessions without needing to plug in.',
      products: [
        {
          id: 'macbook-air-m1',
          name: 'MacBook Air M1',
          price: '₹72,990',
          verdict: 'Perfect Match',
          verdictColor: '#dcfce7',
          verdictText: '#166534',
          specs: 'M1 Chip, 8GB RAM, 256GB SSD, 13.3" Retina Display',
          features: ['15-18h Battery', 'Fanless Design', 'Fast Performance', 'Excellent for Video Editing'],
          description: 'The MacBook Air M1 is perfect for your coding and video editing needs. The M1 chip provides exceptional performance while maintaining excellent battery life.',
          pros: ['Outstanding battery life (15-18 hours)', 'Silent fanless design', 'Excellent performance for video editing', 'Premium build quality', 'Great display'],
          cons: ['Limited to 8GB RAM', 'Only 256GB storage', 'macOS only', 'Limited ports (2x USB-C)'],
          ratings: {
            performance: 92,
            battery: 95,
            build: 90,
            value: 88
          }
        }
      ]
    }
  ]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Handle product card click
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsAnalysisPanelOpen(true);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  
  // Auth form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userAvatarColor, setUserAvatarColor] = useState('');
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTermsAgreed, setDeleteTermsAgreed] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info'); // 'success', 'error', 'info'
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  const [isOTPVerificationOpen, setIsOTPVerificationOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Panel states for grid layout
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false); // Closed by default on mobile
  const [isAnalysisPanelOpen, setIsAnalysisPanelOpen] = useState(true);
  const [historyPanelWidth, setHistoryPanelWidth] = useState(280);
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(320);
  const [isResizingHistory, setIsResizingHistory] = useState(false);
  const [isResizingAnalysis, setIsResizingAnalysis] = useState(false);

  // Generate soothing random color for avatar
  const generateSoothingColor = (name) => {
    const colors = [
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#06b6d4', // cyan
      '#14b8a6', // teal
      '#f97316', // orange
      '#a855f7', // purple
      '#22c55e', // green
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Check if user is logged in with valid tokens
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (savedUser && (accessToken || refreshToken)) {
      const user = JSON.parse(savedUser);
      console.log('Loading user from localStorage:', user);
      console.log('Profile image from localStorage:', user.profile_image);
      setCurrentUser(user);
      setUserAvatarColor(user.avatar_color || generateSoothingColor(user.name));
      if (user.profile_image) {
        setProfileImage(user.profile_image);
        console.log('Setting profile image:', user.profile_image);
      }
    } else if (savedUser && !accessToken && !refreshToken) {
      // User data exists but no tokens - clear stale data
      console.log('⚠️ Stale user data found without tokens - clearing');
      localStorage.removeItem('user');
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const access = urlParams.get('access');
    const refresh = urlParams.get('refresh');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const avatar_color = urlParams.get('avatar_color');
    const profile_image = urlParams.get('profile_image');
    const error = urlParams.get('error');

    if (window.location.pathname === '/oauth/callback') {
      if (error) {
        setAuthError(`OAuth failed: ${error}`);
        // Redirect back to home
        window.history.replaceState({}, '', '/');
      } else if (access && refresh && email) {
        // Save tokens and user data
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        const user = { name: name || email.split('@')[0], email, avatar_color, profile_image: profile_image || null };
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setUserAvatarColor(avatar_color || generateSoothingColor(user.name));
        if (profile_image) {
          setProfileImage(profile_image);
        }
        setIsLoginOpen(false);
        setIsSignupOpen(false);
        // Redirect back to home
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  useEffect(() => {
    // Close user menu when clicking outside
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSendClick = () => {
    if (searchQuery.trim()) {
      initiateChat();
    }
  };

  const handleDirectChat = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsChatMode(true);
    }, 50);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2700);
  };

  const handleExamplePromptClick = (promptText) => {
    setSearchQuery(promptText);
    setTimeout(() => {
      initiateChat();
    }, 100);
  };

  const handleLearnMoreClick = () => {
    const problemSection = document.getElementById('problem');
    if (problemSection) {
      problemSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const initiateChat = () => {
    setIsTransitioning(true);
    const startTime = Date.now();
    const maxOverlayTime = 3500;
    let responseReceived = false;
    
    const fallbackTimer = setTimeout(() => {
      if (!responseReceived) {
        setIsTransitioning(false);
      }
    }, maxOverlayTime);
    
    setTimeout(() => {
      setIsChatMode(true);
      setChatHistory([{ type: 'user', message: searchQuery }]);
      setSearchQuery('');
      
      setIsLoading(true);
      setTimeout(() => {
        responseReceived = true;
        setIsLoading(false);
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          message: 'I understand you need help with that. Let me analyze your requirements...' 
        }]);
        
        const elapsedTime = Date.now() - startTime;
        const minDisplayTime = 1800;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
        
        setTimeout(() => {
          setIsTransitioning(false);
          clearTimeout(fallbackTimer);
        }, remainingTime);
      }, 1500);
    }, 50);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      initiateChat();
    }
  };

  const handleLogoClick = () => {
    setIsChatMode(false);
    setChatHistory([]);
    setSearchQuery('');
    setIsAnalysisPanelOpen(false);
  };

  const handleNewChat = () => {
    if (chatHistory.length > 0) {
      const newConv = {
        id: Date.now(),
        title: chatHistory[0].message.substring(0, 30) + '...',
        messages: chatHistory
      };
      setConversations(prev => [newConv, ...prev]);
    }
    setChatHistory([]);
    setIsAnalysisPanelOpen(false);
  };

  // Panel resize handlers
  const handleHistoryResizeStart = (e) => {
    e.preventDefault();
    setIsResizingHistory(true);
  };

  const handleAnalysisResizeStart = (e) => {
    e.preventDefault();
    setIsResizingAnalysis(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingHistory) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 400) {
          setHistoryPanelWidth(newWidth);
        }
      }
      if (isResizingAnalysis) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 250 && newWidth <= 500) {
          setAnalysisPanelWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingHistory(false);
      setIsResizingAnalysis(false);
    };

    if (isResizingHistory || isResizingAnalysis) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingHistory, isResizingAnalysis]);

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const handleSignupClick = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const handleCloseAuth = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    setAuthError('');
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    // Clear signup profile image if user is not logged in
    if (!currentUser) {
      setProfileImage(null);
    }
  };

  const switchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
    setAuthError('');
  };

  const switchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
    setAuthError('');
  };
  
  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setIsLoginOpen(false);
    setIsForgotPasswordOpen(true);
    setAuthError('');
    setForgotPasswordEmail(loginEmail);
  };
  
  const handleCloseForgotPassword = () => {
    setIsForgotPasswordOpen(false);
    setForgotPasswordEmail('');
    setResetPasswordSent(false);
    setAuthError('');
  };
  
  const handleBackToLogin = () => {
    setIsForgotPasswordOpen(false);
    setIsLoginOpen(true);
    setAuthError('');
  };
  
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      await authAPI.forgotPassword(forgotPasswordEmail);
      setResetPasswordSent(true);
    } catch (error) {
      setAuthError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleOAuthLogin = async (provider) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const response = await authAPI.oauthLogin(provider);
      // Redirect to OAuth provider
      window.location.href = response.auth_url;
    } catch (error) {
      setAuthError(error.message || `Failed to connect with ${provider}`);
      setAuthLoading(false);
    }
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      const response = await authAPI.login(loginEmail, loginPassword);
      setCurrentUser(response.user);
      // Use saved avatar color or generate new one
      const color = response.user.avatar_color || generateSoothingColor(response.user.name);
      setUserAvatarColor(color);
      // Load profile image if exists
      if (response.user.profile_image) {
        setProfileImage(response.user.profile_image);
      }
      // If no saved color, update it in backend
      if (!response.user.avatar_color) {
        authAPI.updateProfile({ avatar_color: color });
      }
      handleCloseAuth();
      // Optionally show success message
    } catch (error) {
      setAuthError(error.message || 'Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    // Password validation
    if (signupPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(signupPassword)) {
      setAuthError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(signupPassword)) {
      setAuthError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/\d/.test(signupPassword)) {
      setAuthError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(signupPassword)) {
      setAuthError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).');
      return;
    }
    
    setAuthLoading(true);
    
    try {
      // Generate avatar color before signup
      const avatarColor = generateSoothingColor(signupName);
      const response = await authAPI.register(signupName, signupEmail, signupPassword, avatarColor);
      
      // OTP sent successfully, show verification modal
      setOtpEmail(signupEmail);
      setIsSignupOpen(false);
      setIsOTPVerificationOpen(true);
      setAuthError('');
    } catch (error) {
      setAuthError(error.message || 'Signup failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    
    const otp = otpCode.join('');
    
    if (otp.length !== 6) {
      setOtpError('Please enter all 6 digits');
      setOtpLoading(false);
      return;
    }
    
    try {
      const response = await authAPI.verifyOTP(otpEmail, otp);
      setCurrentUser(response.user);
      const color = response.user.avatar_color || generateSoothingColor(response.user.name);
      setUserAvatarColor(color);
      if (response.user.profile_image) {
        setProfileImage(response.user.profile_image);
      }
      handleCloseOTPVerification();
      // Optionally show success message
    } catch (error) {
      setOtpError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    setOtpError('');
    setOtpLoading(true);
    
    try {
      await authAPI.resendOTP(otpEmail);
      setOtpCode(['', '', '', '', '', '']);
      setOtpError('');
      // Show success message
      showToast('New OTP sent to your email', 'success');
    } catch (error) {
      setOtpError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };
  
  const handleCloseOTPVerification = () => {
    setIsOTPVerificationOpen(false);
    setOtpEmail('');
    setOtpCode(['', '', '', '', '', '']);
    setOtpError('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
  };
  
  const handleOTPInputChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleOTPKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtpCode = pastedData.split('');
      setOtpCode(newOtpCode);
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };
  
  const handleLogout = async () => {
    await authAPI.logout();
    setCurrentUser(null);
    setProfileImage(null);
    if (isChatMode) {
      setIsChatMode(false);
      setChatHistory([]);
      setConversations([]);
    }
  };
  
  const handleDeleteAccount = async () => {
    // Verify we have authentication before proceeding
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken && !refreshToken) {
      console.error('❌ No authentication tokens found!');
      setIsDeleteModalOpen(false);
      setIsSettingsOpen(false);
      setDeleteTermsAgreed(false);
      setCurrentUser(null);
      setProfileImage(null);
      localStorage.removeItem('user');
      showToast('Session expired. Please log in again.', 'error');
      return;
    }
    
    if (!deleteTermsAgreed) {
      showToast('Please agree to the terms before deleting your account', 'error');
      return;
    }
    
    console.log('🗑️ Attempting to delete account...');
    console.log('🔑 Current tokens in localStorage:', {
      hasAccess: !!accessToken,
      hasRefresh: !!refreshToken,
      access: accessToken ? accessToken.substring(0, 30) + '...' : 'NONE'
    });
    
    try {
      await authAPI.deleteAccount();
      setCurrentUser(null);
      setProfileImage(null);
      setIsDeleteModalOpen(false);
      setIsSettingsOpen(false);
      setDeleteTermsAgreed(false);
      if (isChatMode) {
        setIsChatMode(false);
        setChatHistory([]);
        setConversations([]);
      }
      showToast('Your account has been deleted successfully', 'success');
    } catch (error) {
      // Close modal first
      setIsDeleteModalOpen(false);
      setIsSettingsOpen(false);
      setDeleteTermsAgreed(false);
      
      if (error.message.includes('Session expired') || error.message.includes('Authentication credentials') || error.message.includes('not provided')) {
        // Force logout
        setCurrentUser(null);
        setProfileImage(null);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsUserMenuOpen(false);
        // Show error after clearing state
        setTimeout(() => {
          showToast('Session expired. Please log in again to continue.', 'error');
        }, 100);
      } else {
        showToast(`Failed to delete account: ${error.message}`, 'error');
      }
    }
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAuthError('Please upload an image file.');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAuthError('Image size must be less than 2MB.');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      console.log('Uploading profile image, size:', base64String.length);
      setProfileImage(base64String);
      
      try {
        const response = await authAPI.updateProfile({ profile_image: base64String });
        console.log('Profile image upload response:', response);
        if (response.user) {
          setCurrentUser(response.user);
          console.log('Updated user with profile image');
        }
      } catch (error) {
        console.error('Failed to upload profile image:', error);
        setAuthError('Failed to upload image. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };
  
  const removeProfileImage = async () => {
    setProfileImage(null);
    try {
      const response = await authAPI.updateProfile({ profile_image: null });
      if (response.user) {
        setCurrentUser(response.user);
      }
    } catch (error) {
      console.error('Failed to remove profile image:', error);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="transition-overlay">
          <img src={logo} alt="TrueNeed" className="transition-logo" />
        </div>
      )}

      {/* Fixed Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="nav-left" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="TrueNeed" className="nav-logo" />
            <div className="nav-tagline">
              <span className="brand-true">TRUE</span><span className="brand-need">NEED</span>
            </div>
          </div>
          <div className="nav-right">
            {currentUser ? (
              <div className="user-menu-container">
                <button 
                  className="user-profile-btn" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User menu"
                >
                  <span className="user-greeting">Hi, {currentUser.name.split(' ')[0]}</span>
                  <div 
                    className="user-avatar" 
                    style={{ 
                      background: profileImage ? 'transparent' : userAvatarColor,
                      backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!profileImage && currentUser.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {isUserMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div 
                        className="user-dropdown-avatar" 
                        style={{ 
                          background: profileImage ? 'transparent' : userAvatarColor,
                          backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {!profileImage && currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-dropdown-info">
                        <div className="user-dropdown-name">{currentUser.name}</div>
                        <div className="user-dropdown-email">{currentUser.email}</div>
                      </div>
                    </div>
                    
                    <div className="user-dropdown-divider"></div>
                    
                    <button className="user-dropdown-item" onClick={() => { setIsPersonalizationOpen(true); setIsUserMenuOpen(false); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                      <span>Personalization</span>
                    </button>
                    
                    <button className="user-dropdown-item" onClick={() => { setIsSettingsOpen(true); setIsUserMenuOpen(false); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                      </svg>
                      <span>Settings</span>
                    </button>
                    
                    <div className="user-dropdown-divider"></div>
                    
                    <button className="user-dropdown-item" onClick={() => { toggleTheme(); setIsUserMenuOpen(false); }}>
                      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                      <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                    
                    <button className="user-dropdown-item user-dropdown-item-with-arrow" onClick={() => { setIsHelpOpen(true); setIsUserMenuOpen(false); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span>Help</span>
                      <svg className="arrow-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                    
                    <div className="user-dropdown-divider"></div>
                    
                    <button className="user-dropdown-item logout-item" onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                {/* Desktop: Separate buttons */}
                <button className="nav-btn login-btn desktop-only-btn" onClick={handleLoginClick}>Login</button>
                <button className="nav-btn signup-btn desktop-only-btn" onClick={handleSignupClick}>Sign Up</button>
                {/* Mobile: Unified account button */}
                <button className="nav-btn signup-btn mobile-only-btn" onClick={handleLoginClick}>Account</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Landing Page */}
      {!isChatMode && (
        <>
          {/* Background Effects */}
          <div className="grid-background" />

          {/* Hero Section */}
          <section className="hero-section">
            {/* Floating Product Icons - Mobile Only */}
            <div className="floating-products">
              <div className="products-track">
                <img src={phoneIcon} alt="" className="product-icon" />
                <img src={laptopIcon} alt="" className="product-icon" />
                <img src={headphonesIcon} alt="" className="product-icon" />
                <img src={cameraIcon} alt="" className="product-icon" />
                <img src={watchIcon} alt="" className="product-icon" />
                <img src={controllerIcon} alt="" className="product-icon" />
                <img src={earpodsIcon} alt="" className="product-icon" />
                <img src={tabletIcon} alt="" className="product-icon" />
                {/* Duplicate for seamless loop */}
                <img src={phoneIcon} alt="" className="product-icon" />
                <img src={laptopIcon} alt="" className="product-icon" />
                <img src={headphonesIcon} alt="" className="product-icon" />
                <img src={cameraIcon} alt="" className="product-icon" />
                <img src={watchIcon} alt="" className="product-icon" />
                <img src={controllerIcon} alt="" className="product-icon" />
                <img src={earpodsIcon} alt="" className="product-icon" />
                <img src={tabletIcon} alt="" className="product-icon" />
              </div>
            </div>
            
            <div className="hero-content">
              <div className="hero-left">
                <TypingTextWrapper />
                
                <motion.p 
                  className="hero-subtitle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  India's first <span className="highlight-text">Intent-to-Spec Translation Engine</span> that stops you from overbuying expensive specs you'll never use—or underbuying products that fail in 6 months.
                </motion.p>

                <motion.div 
                  className="hero-search"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="search-container">
                    <button className="search-message-btn" onClick={handleDirectChat}>
                      <MessageSquare className="search-icon" size={20} />
                    </button>
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder='Describe what you need...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchSubmit}
                    />
                    <button 
                      className="search-send-btn" 
                      onClick={handleSendClick}
                      disabled={!searchQuery.trim()}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  
                  {/* Example Prompts - Mobile Only */}
                  <div className="example-prompts-mobile">
                    <div 
                      className="example-prompt fade-animation" 
                      onClick={() => handleExamplePromptClick("Need a laptop for video editing under ₹90k")}
                    >
                      Need a laptop for video editing under ₹90k
                    </div>
                    <div 
                      className="example-prompt fade-animation"
                      onClick={() => handleExamplePromptClick("Should I buy iPhone 15 or wait for 16?")}
                    >
                      Should I buy iPhone 15 or wait for 16?
                    </div>
                    <div 
                      className="example-prompt fade-animation"
                      onClick={() => handleExamplePromptClick("Best wireless earbuds with ANC under ₹5k")}
                    >
                      Best wireless earbuds with ANC under ₹5k
                    </div>
                    <div 
                      className="example-prompt fade-animation"
                      onClick={() => handleExamplePromptClick("Gaming laptop vs desktop for ₹1.5L budget")}
                    >
                      Gaming laptop vs desktop for ₹1.5L budget
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="hero-right"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="hero-visual">
                  <div className="logo-container">
                    <div className="logo-aura"></div>
                    <img src={logo} alt="TrueNeed" className="logo-showcase" />
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Learn More - Mobile Only */}
            <div className="learn-more-mobile" onClick={handleLearnMoreClick}>
              <span>Learn More</span>
              <ChevronDown className="learn-more-arrow" size={20} />
            </div>
          </section>
        </>
      )}

        {/* Chat Interface */}
      {isChatMode && (
        <div className="chat-interface">
          {/* Backdrop overlay for mobile when history panel is open */}
          {isHistoryPanelOpen && (
            <div 
              className="mobile-sidebar-backdrop"
              onClick={() => setIsHistoryPanelOpen(false)}
            />
          )}

          {/* Left History Panel Toggle Bump */}
          <div 
            className={`panel-toggle-bump left ${isHistoryPanelOpen ? 'panel-open' : ''}`}
            onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          >
            <div className="bump-arrow">
              {isHistoryPanelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </div>
          </div>

          {/* History Panel */}
          <div 
            className={`chat-sidebar history-panel ${isHistoryPanelOpen ? 'open' : ''}`}
            style={{ width: `${historyPanelWidth}px` }}
          >
            <div className="panel-header">
              <h3 className="panel-title">History</h3>
              <button className="panel-toggle-btn" onClick={() => setIsHistoryPanelOpen(false)}>
                <ChevronLeft size={18} />
              </button>
            </div>
            <button className="new-chat-btn" onClick={handleNewChat}>
              <MessageSquare size={18} />
              <span>New Chat</span>
            </button>
            <div className="chat-history">
              {conversations.map(conv => (
                <div key={conv.id} className="history-item">
                  <MessageSquare size={16} />
                  <span>{conv.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* History Panel Resize Handle - only on desktop */}
          {isHistoryPanelOpen && (
            <div 
              className="resize-handle left"
              onMouseDown={handleHistoryResizeStart}
            />
          )}

          {/* Main Chat Area */}
          <div className="chat-main">
            <div className="chat-messages">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.type}`}>
                  <div className="message-content">
                    {msg.type === 'ai' && (
                      <div className="message-avatar">
                        <img src={logo} alt="AI" className="avatar-img" />
                      </div>
                    )}
                    <div className="message-text">
                      {msg.message}
                      
                      {/* Product Cards */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="product-cards-container">
                          {msg.products.map((product) => (
                            <div
                              key={product.id}
                              className={`product-card ${selectedProduct?.id === product.id ? 'active' : ''}`}
                              onClick={() => handleProductClick(product)}
                            >
                              <span className="product-card-name">{product.name}</span>
                              <ArrowUpRight size={16} className="product-card-arrow" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message ai">
                  <div className="message-content">
                    <div className="message-avatar">
                      <img src={logo} alt="AI" className="avatar-img" />
                    </div>
                    <div className="message-text">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Message TrueNeed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setChatHistory(prev => [...prev, { type: 'user', message: searchQuery }]);
                      setSearchQuery('');
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        setChatHistory(prev => [...prev, { 
                          type: 'ai', 
                          message: 'Let me help you find the perfect product for your needs.' 
                        }]);
                      }, 1500);
                    }
                  }}
                />
                <Send className="chat-input-icon" size={20} />
              </div>
            </div>
          </div>

          {/* Analysis Panel Resize Handle - only on desktop */}
          {isAnalysisPanelOpen && (
            <div 
              className="resize-handle right"
              onMouseDown={handleAnalysisResizeStart}
            />
          )}

          {/* Analysis Panel */}
          <div 
            className={`analyze-panel ${isAnalysisPanelOpen ? 'open' : ''}`}
            style={{ width: `${analysisPanelWidth}px` }}
          >
            <div className="panel-header">
              <h3 className="panel-title">Analysis</h3>
              <button className="panel-toggle-btn" onClick={() => setIsAnalysisPanelOpen(false)}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="analyze-content">
              {!selectedProduct ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: '0.3' }}>
                    <Brain size={48} style={{ margin: '0 auto', display: 'block' }} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Product Selected</h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>Select a product from the chat to see detailed analysis</p>
                </div>
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                  {/* Product Header */}
                  <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0', color: 'var(--text-primary)' }}>{selectedProduct.name}</h3>
                      <span style={{ background: selectedProduct.verdictColor, color: selectedProduct.verdictText, padding: '0.375rem 0.75rem', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: '600' }}>{selectedProduct.verdict}</span>
                    </div>
                    <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#14b8a6', margin: '0.5rem 0' }}>{selectedProduct.price}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.75rem 0' }}>{selectedProduct.specs}</p>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.5rem' }}>Overview</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedProduct.description}</p>
                  </div>

                  {/* Key Features */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.75rem' }}>Key Features</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {selectedProduct.features.map((feature, idx) => (
                        <span key={idx} style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', padding: '0.375rem 0.625rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: '500' }}>{feature}</span>
                      ))}
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.5rem', color: '#22c55e' }}>Pros</h4>
                      <ul style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        {selectedProduct.pros.map((pro, idx) => (
                          <li key={idx}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.5rem', color: '#ef4444' }}>Cons</h4>
                      <ul style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        {selectedProduct.cons.map((con, idx) => (
                          <li key={idx}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.75rem' }}>Ratings</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Performance</span>
                          <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: '600' }}>{selectedProduct.ratings.performance}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${selectedProduct.ratings.performance}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0d9488)', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Battery Life</span>
                          <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: '600' }}>{selectedProduct.ratings.battery}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${selectedProduct.ratings.battery}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0d9488)', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Build Quality</span>
                          <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: '600' }}>{selectedProduct.ratings.build}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${selectedProduct.ratings.build}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0d9488)', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Value for Money</span>
                          <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: '600' }}>{selectedProduct.ratings.value}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${selectedProduct.ratings.value}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0d9488)', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Analysis Panel Toggle Bump */}
          <div 
            className={`panel-toggle-bump right ${isAnalysisPanelOpen ? 'panel-open' : ''}`}
            onClick={() => setIsAnalysisPanelOpen(!isAnalysisPanelOpen)}
          >
            <div className="bump-arrow">
              {isAnalysisPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </div>
          </div>
        </div>
      )}

        {/* Mobile Analysis Popup Modal */}
      {isChatMode && selectedProduct && (
        <div className="mobile-analysis-modal" onClick={() => setSelectedProduct(null)}>
          <div className="mobile-analysis-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="mobile-analysis-header">
              <h3>Product Analysis</h3>
              <button className="mobile-analysis-close" onClick={() => setSelectedProduct(null)}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Same content as desktop analysis panel */}
            <div className="mobile-analysis-body">
              {/* Product Header */}
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0', color: 'var(--text-primary)' }}>{selectedProduct.name}</h3>
                  <span style={{ background: selectedProduct.verdictColor, color: selectedProduct.verdictText, padding: '0.375rem 0.75rem', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: '600' }}>{selectedProduct.verdict}</span>
                </div>
                <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#14b8a6', margin: '0.5rem 0' }}>{selectedProduct.price}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.75rem 0' }}>{selectedProduct.specs}</p>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.5rem' }}>Overview</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedProduct.description}</p>
              </div>

              {/* Key Features */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.75rem' }}>Key Features</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedProduct.features.map((feature, idx) => (
                    <span key={idx} style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', padding: '0.375rem 0.625rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: '500' }}>{feature}</span>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.5rem', color: '#22c55e' }}>Pros</h4>
                  <ul style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    {selectedProduct.pros.map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.5rem', color: '#ef4444' }}>Cons</h4>
                  <ul style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    {selectedProduct.cons.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ratings */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', marginBottom: '0.75rem' }}>Ratings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Performance</span>
                      <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: '600' }}>{selectedProduct.ratings.performance}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${selectedProduct.ratings.performance}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0d9488)', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Battery Life</span>
                      <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: '600' }}>{selectedProduct.ratings.battery}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${selectedProduct.ratings.battery}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0d9488)', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Build Quality</span>
                      <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: '600' }}>{selectedProduct.ratings.build}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${selectedProduct.ratings.build}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0d9488)', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Value for Money</span>
                      <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: '600' }}>{selectedProduct.ratings.value}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${selectedProduct.ratings.value}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0d9488)', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Impact Section - Only show on landing page */}
      {!isChatMode && (
        <>
          {/* Problem & Solution Section */}
          <section id="problem" className="section problem-solution-section">
            <motion.div
              className="section-content"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="problem-header">
                <h2 className="section-title">
                  The Problem with Tech Shopping Today
                </h2>
                <p className="section-subtitle">
                  Everyone's trying to sell you something. Nobody's trying to save you money.
                </p>
              </div>

              <div className="problem-stats-grid">
                {/* Problem Cards */}
                <motion.div 
                  className="problem-stat-card problem-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="card-icon danger">🎯</div>
                  <h3 className="card-title">Sponsored Reviews</h3>
                  <p className="card-description">Influencers get paid ₹50K-₹2L per video to push expensive products</p>
                  <div className="card-stat">95% biased</div>
                </motion.div>

                <motion.div 
                  className="problem-stat-card problem-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="card-icon danger">🤖</div>
                  <h3 className="card-title">AI Hallucinations</h3>
                  <p className="card-description">ChatGPT makes up specs and prices when it doesn't know</p>
                  <div className="card-stat">67% wrong</div>
                </motion.div>

                <motion.div 
                  className="problem-stat-card problem-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="card-icon danger">💰</div>
                  <h3 className="card-title">Friend Recommendations</h3>
                  <p className="card-description">They spent ₹1.5L on gaming laptop. You need one for Excel.</p>
                  <div className="card-stat">Wrong fit</div>
                </motion.div>

                {/* Impact Stats */}
                <motion.div 
                  className="problem-stat-card stat-card-highlight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="card-icon primary">💸</div>
                  <div className="big-stat">₹12,800</div>
                  <h3 className="card-title">Avg. Money Wasted</h3>
                  <p className="card-description">Per person annually on wrong tech purchases</p>
                </motion.div>

                <motion.div 
                  className="problem-stat-card stat-card-highlight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="card-icon primary">📊</div>
                  <div className="big-stat">73%</div>
                  <h3 className="card-title">Buyer's Remorse</h3>
                  <p className="card-description">Experience regret within 3 months</p>
                </motion.div>

                <motion.div 
                  className="problem-stat-card stat-card-highlight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="card-icon primary">⚡</div>
                  <div className="big-stat">500+</div>
                  <h3 className="card-title">Products Tracked</h3>
                  <p className="card-description">Real-time analysis & price monitoring</p>
                </motion.div>
              </div>

              {/* CTA */}
              <motion.div 
                className="solution-cta"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <h3 className="cta-title">We Stop the Bleeding</h3>
                <p className="cta-subtitle">TrueNeed uses deterministic logic—not marketing hype—to match your actual needs to the right specs.</p>
                <button className="cta-button" onClick={() => setIsChatMode(true)}>
                  Analyze Your Need
                  <ArrowUpRight size={20} />
                </button>
              </motion.div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section id="features" className="section features-section">
            <motion.div
              className="section-content"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
          <h2 className="section-title">Why TrueNeed Works</h2>
          <p className="section-subtitle">
            Powered by AI that actually understands what you need
          </p>

          <div className="features-grid">
            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Smart AI</h3>
              <p className="feature-description">
                Understands your actual needs, not just keywords
              </p>
            </motion.div>

            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Save Money</h3>
              <p className="feature-description">
                Buy what you truly need, not overpriced specs
              </p>
            </motion.div>

            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Instant Results</h3>
              <p className="feature-description">
                Real-time recommendations in seconds, not hours
              </p>
            </motion.div>

            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">Unbiased</h3>
              <p className="feature-description">
                No sponsored results, just honest recommendations
              </p>
            </motion.div>

            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Private</h3>
              <p className="feature-description">
                Your data stays secure and never sold to third parties
              </p>
            </motion.div>

            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">🎓</div>
              <h3 className="feature-title">Learn</h3>
              <p className="feature-description">
                Understand exactly why we recommend each product
              </p>
            </motion.div>
          </div>
        </motion.div>
        </section>

        {/* Comparison Table */}
        <section id="compare" className="section compare-section">
        <motion.div
          className="section-content"
          initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
          <h2 className="section-title">The Trust Gap</h2>
          <p className="section-subtitle">
            Why TrueNeed is different from Amazon and generic AI
          </p>

          <div className="comparison-table">
            <div className="compare-row header">
              <div className="compare-cell">Feature</div>
              <div className="compare-cell">🛒 Amazon/Flipkart</div>
              <div className="compare-cell">🤖 Generic AI</div>
              <div className="compare-cell highlight">✅ TrueNeed</div>
            </div>

            <div className="compare-row">
              <div className="compare-cell">Goal</div>
              <div className="compare-cell">Sell most expensive</div>
              <div className="compare-cell">Engagement</div>
              <div className="compare-cell highlight">Protect Wealth</div>
            </div>

            <div className="compare-row">
              <div className="compare-cell">Method</div>
              <div className="compare-cell">Keywords & Ads</div>
              <div className="compare-cell">Hallucinated Text</div>
              <div className="compare-cell highlight">Logic & Math</div>
            </div>

            <div className="compare-row">
              <div className="compare-cell">Financial Safety</div>
              <div className="compare-cell"><XCircle size={20} color="#ef4444" /></div>
              <div className="compare-cell"><XCircle size={20} color="#ef4444" /></div>
              <div className="compare-cell highlight"><CheckCircle size={20} color="#00d2be" /></div>
            </div>

            <div className="compare-row">
              <div className="compare-cell">Overbuy Alerts</div>
              <div className="compare-cell"><XCircle size={20} color="#ef4444" /></div>
              <div className="compare-cell"><XCircle size={20} color="#ef4444" /></div>
              <div className="compare-cell highlight"><CheckCircle size={20} color="#00d2be" /></div>
            </div>
          </div>
        </motion.div>
        </section>

        {/* Anti-Marketing Manifesto */}
        <section className="manifesto-section">
        <motion.div
          className="manifesto-content"
          initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
          <h2 className="manifesto-title">Built by Students. Bought by No One.</h2>
          <p className="manifesto-intro">
            The internet is broken. Tech reviews are sponsored, "Top 10" lists are ads, and AI hallucinates specs. 
            We built TrueNeed because we were tired of getting ripped off.
          </p>

          <div className="manifesto-grid">
            <motion.div 
              className="manifesto-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="manifesto-icon">🚫</div>
              <h3 className="manifesto-card-title">0% Sponsorships</h3>
              <p className="manifesto-card-text">
                We reject all brand money. If we recommend a Dell, it's because the math says so, not because Dell paid us.
              </p>
            </motion.div>

            <motion.div 
              className="manifesto-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="manifesto-icon">🛡️</div>
              <h3 className="manifesto-card-title">100% Deterministic</h3>
              <p className="manifesto-card-text">
                We don't "guess" specs. We use hard data to protect your wallet from marketing gimmicks.
              </p>
            </motion.div>

            <motion.div 
              className="manifesto-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="manifesto-icon">💸</div>
              <h3 className="manifesto-card-title">Financial Safety First</h3>
              <p className="manifesto-card-text">
                Our only goal is to stop you from "Overbuying" (wasting money) or "Underbuying" (buying e-waste).
              </p>
            </motion.div>
          </div>
        </motion.div>
        </section>

        {/* How It Works - Logic Visualization */}
        <section className="logic-section">
        <motion.div
          className="logic-content"
          initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
          <h2 className="logic-title">How It Works</h2>
          
          <div className="logic-cards">
            <motion.div 
              className="logic-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="logic-card-icon">🗣️</div>
              <h3 className="logic-card-title">The Input</h3>
              <div className="logic-card-label">You Say:</div>
              <p className="logic-card-quote">
                "I need a laptop for Python coding and video editing, but my budget is tight."
              </p>
            </motion.div>

            <div className="logic-arrow">→</div>

            <motion.div 
              className="logic-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="logic-card-icon">🧠</div>
              <h3 className="logic-card-title">The Logic</h3>
              <div className="logic-card-label">We Translate:</div>
              <div className="logic-code">
                <div className="code-line">Intent: Coding → Min 16GB RAM</div>
                <div className="code-line">Intent: Video → Min 4GB VRAM</div>
                <div className="code-line">Status: Broke → Value Focus</div>
              </div>
            </motion.div>

            <div className="logic-arrow">→</div>

            <motion.div 
              className="logic-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="logic-card-icon">✅</div>
              <h3 className="logic-card-title">The Verdict</h3>
              <div className="logic-card-label">We Protect:</div>
              <p className="logic-card-result">
                We filter 500+ laptops and block the ones with Heating Issues or Bad Hinges. 
                You get the single safest choice.
              </p>
            </motion.div>
          </div>
        </motion.div>
        </section>

        {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-columns">
            <div className="footer-column">
              <img src={logoWithName} alt="TrueNeed" className="footer-logo" />
              <p className="footer-tagline">The Financial Guardrail for E-Commerce.</p>
              <p className="footer-email">
                <a href="mailto:founders@trueneed.in">founders@trueneed.in</a>
              </p>
              <p className="footer-status">🟢 Systems Operational</p>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">The Logic</h4>
              <ul className="footer-links">
                <li><a href="#how-it-works">How We Score</a></li>
                <li><a href="#manifesto">Our "Anti-Ad" Policy</a></li>
                <li><a href="#compare">Price Tracking Accuracy</a></li>
                <li><a href="mailto:founders@trueneed.in">Report a Bug</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Legal</h4>
              <ul className="footer-links">
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li className="footer-disclaimer-link">
                  <strong>Affiliate Disclaimer:</strong> TrueNeed participates in the Amazon Associates Program. 
                  We earn a commission if you buy via our links, at no extra cost to you. 
                  This funds our servers, not our opinions.
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-legal-shield">
              <strong>Disclaimer:</strong> TrueNeed scores are algorithmically generated based on hardware specifications 
              and aggregated third-party data. They are opinions intended for educational purposes, not statements of fact. 
              Always verify specs on the seller's page before purchasing.
            </p>
            <p className="footer-copyright">
              © 2026 TrueNeed. Built by Team SPARTANS.
            </p>
          </div>
        </div>
      </footer>
        </>
      )}

        {/* Auth Backdrop */}
      {(isLoginOpen || isSignupOpen) && (
        <div className="auth-backdrop" onClick={handleCloseAuth}></div>
      )}

        {/* Login Panel */}
      {isLoginOpen && (
        <div className="auth-panel">
          <button className="auth-close" onClick={handleCloseAuth}>×</button>
          <div className="auth-header">
            <img src={logo} alt="TrueNeed" className="auth-logo" />
            <h2>Welcome Back</h2>
            <p>Your AI Financial Guardrail</p>
          </div>
          
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            {authError && <div className="auth-error">{authError}</div>}
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={authLoading}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                disabled={authLoading}
                autoComplete="current-password"
              />
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link" onClick={handleForgotPasswordClick}>Forgot Password?</a>
            </div>
            <button type="submit" className="auth-submit-btn" disabled={authLoading}>
              {authLoading ? 'Logging in...' : 'Login'}
            </button>
            <p className="auth-switch">
              Don't have an account? <button type="button" onClick={switchToSignup}>Sign up</button>
            </p>
            <div className="auth-divider">
              <span>or continue with</span>
            </div>
            <button 
              type="button" 
              className="social-btn google-btn"
              onClick={() => handleOAuthLogin('google')}
              disabled={authLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button 
              type="button" 
              className="social-btn apple-btn"
              onClick={() => handleOAuthLogin('apple')}
              disabled={authLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
            <button 
              type="button" 
              className="social-btn microsoft-btn"
              onClick={() => handleOAuthLogin('microsoft')}
              disabled={authLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f25022" d="M1 1h10v10H1z"/>
                <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                <path fill="#7fba00" d="M1 13h10v10H1z"/>
                <path fill="#ffb900" d="M13 13h10v10H13z"/>
              </svg>
              Continue with Microsoft
            </button>
          </form>
        </div>
      )}

        {/* Signup Panel */}
      {isSignupOpen && (
        <div className="auth-panel">
          <button className="auth-close" onClick={handleCloseAuth}>×</button>
          <div className="auth-header">
            <img src={logo} alt="TrueNeed" className="auth-logo" />
            <h2>Create Account</h2>
            <p>Join 10,000+ smart shoppers</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            {authError && <div className="auth-error">{authError}</div>}
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                placeholder="John Doe"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
                disabled={authLoading}
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                type="email"
                id="signup-email"
                placeholder="your@email.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                disabled={authLoading}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                placeholder="Create a strong password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                disabled={authLoading}
                autoComplete="new-password"
              />
              <p className="password-requirements">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>
            <label className="checkbox-label terms-check">
              <input type="checkbox" required />
              <span>I agree to the Terms & Privacy Policy</span>
            </label>
            <button type="submit" className="auth-submit-btn" disabled={authLoading}>
              {authLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <p className="auth-switch">
              Already have an account? <button type="button" onClick={switchToLogin}>Login</button>
            </p>
            <div className="auth-divider">
              <span>or continue with</span>
            </div>
            <button 
              type="button" 
              className="social-btn google-btn"
              onClick={() => handleOAuthLogin('google')}
              disabled={authLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button 
              type="button" 
              className="social-btn apple-btn"
              onClick={() => handleOAuthLogin('apple')}
              disabled={authLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
            <button 
              type="button" 
              className="social-btn microsoft-btn"
              onClick={() => handleOAuthLogin('microsoft')}
              disabled={authLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f25022" d="M1 1h10v10H1z"/>
                <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                <path fill="#7fba00" d="M1 13h10v10H1z"/>
                <path fill="#ffb900" d="M13 13h10v10H13z"/>
              </svg>
              Continue with Microsoft
            </button>
          </form>
        </div>
      )}

        {/* Forgot Password Panel */}
      {isForgotPasswordOpen && (
        <div className="auth-panel">
          <button className="auth-close" onClick={handleCloseForgotPassword}>×</button>
          <div className="auth-header">
            <img src={logo} alt="TrueNeed" className="auth-logo" />
            <h2>Reset Password</h2>
            <p>We'll send you a reset link</p>
          </div>
          
          {!resetPasswordSent ? (
            <form className="auth-form" onSubmit={handleForgotPasswordSubmit}>
              {authError && <div className="auth-error">{authError}</div>}
              <div className="form-group">
                <label htmlFor="forgot-email">Email Address</label>
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="your@email.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={authLoading}
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                {authLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="auth-switch">
                Remember your password? <button type="button" onClick={handleBackToLogin}>Back to Login</button>
              </p>
            </form>
          ) : (
            <div className="auth-form">
              <div className="auth-success">
                <CheckCircle size={48} color="#10b981" />
                <h3>Check Your Email</h3>
                <p>
                  We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                </p>
                <p className="email-note">
                  Please check your inbox and spam folder. The link will expire in 1 hour.
                </p>
              </div>
              <button 
                type="button" 
                className="auth-submit-btn" 
                onClick={handleBackToLogin}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      )}

        {/* OTP Verification Panel */}
      {isOTPVerificationOpen && (
        <div className="auth-panel">
          <button className="auth-close" onClick={handleCloseOTPVerification}>×</button>
          <div className="auth-header">
            <img src={logo} alt="TrueNeed" className="auth-logo" />
            <h2>Verify Your Email</h2>
            <p>Enter the 6-digit code sent to</p>
            <p style={{ fontWeight: 600, color: '#14b8a6' }}>{otpEmail}</p>
          </div>
          
          <form className="auth-form" onSubmit={handleOTPSubmit}>
            {otpError && <div className="auth-error">{otpError}</div>}
            
            <div className="otp-input-container">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOTPInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={index === 0 ? handleOTPPaste : undefined}
                  disabled={otpLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <button type="submit" className="auth-submit-btn" disabled={otpLoading}>
              {otpLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            
            <div className="otp-resend">
              <p>Didn't receive the code?</p>
              <button 
                type="button" 
                className="resend-btn"
                onClick={handleResendOTP}
                disabled={otpLoading}
              >
                Resend OTP
              </button>
            </div>
            
            <p className="otp-timer-note">
              Code expires in 10 minutes
            </p>
          </form>
        </div>
      )}

        {/* Personalization Modal */}
      {isPersonalizationOpen && (
        <div className="modal-backdrop" onClick={() => setIsPersonalizationOpen(false)}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Personalization</h2>
              <button className="modal-close" onClick={() => setIsPersonalizationOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="settings-section">
                <h3>Profile Picture</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div 
                    className="user-dropdown-avatar" 
                    style={{ 
                      background: profileImage ? 'transparent' : userAvatarColor,
                      backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!profileImage && currentUser?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <label className="upload-btn">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      Upload Image
                    </label>
                    {profileImage && (
                      <button className="remove-btn" onClick={removeProfileImage}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="settings-hint">Upload a profile picture (max 2MB)</p>
              </div>
              <div className="settings-section">
                <h3>Avatar Color</h3>
                <div className="color-picker-grid">
                  {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#6366f1'].map((color) => (
                    <button
                      key={color}
                      className={`color-option ${userAvatarColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={async () => {
                        setUserAvatarColor(color);
                        try {
                          await authAPI.updateProfile({ avatar_color: color });
                        } catch (error) {
                          console.error('Failed to update avatar color:', error);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="settings-section">
                <h3>Display Name</h3>
                <input 
                  type="text" 
                  className="modal-input" 
                  value={currentUser?.name || ''} 
                  placeholder="Your name"
                  readOnly
                />
                <p className="settings-hint">Change your display name from settings</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

        {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="modal-close" onClick={() => setIsSettingsOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="settings-section">
                <h3>Account Information</h3>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{currentUser?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{currentUser?.name}</span>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Security</h3>
                <button 
                  className="settings-button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsForgotPasswordOpen(true);
                  }}
                >
                  <Lock size={18} />
                  <span>Change Password</span>
                </button>
              </div>
              
              <div className="settings-section">
                <h3>Appearance</h3>
                <button 
                  className="settings-button"
                  onClick={() => { toggleTheme(); }}
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                </button>
              </div>
              
              <div className="settings-section">
                <h3>Preferences</h3>
                <div className="toggle-option">
                  <span>Show product suggestions</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="toggle-option">
                  <span>Enable notifications</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="toggle-option">
                  <span>Save search history</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Data & Privacy</h3>
                <button 
                  className="settings-button"
                  onClick={() => showToast('Export feature coming soon', 'info')}
                >
                  <Download size={18} />
                  <span>Export My Data</span>
                </button>
                <button 
                  className="settings-button"
                  onClick={() => showToast('Clear history feature coming soon', 'info')}
                >
                  <Trash2 size={18} />
                  <span>Clear Search History</span>
                </button>
              </div>
              
              <div className="settings-section">
                <h3>Danger Zone</h3>
                <button 
                  className="settings-button danger-button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  }}
                >
                  <XCircle size={18} />
                  <span>Delete Account</span>
                </button>
                <p className="settings-hint" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  ⚠️ This action is permanent and cannot be undone
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

        {/* Help Modal */}
      {isHelpOpen && (
        <div className="modal-backdrop" onClick={() => setIsHelpOpen(false)}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Help & Support</h2>
              <button className="modal-close" onClick={() => setIsHelpOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="help-section">
                <h3>Getting Started</h3>
                <p>Describe what you need in the chat, and TrueNeed will analyze products and provide honest recommendations.</p>
              </div>
              <div className="help-section">
                <h3>How It Works</h3>
                <ul className="help-list">
                  <li>Share your requirements in natural language</li>
                  <li>Get AI-powered product analysis</li>
                  <li>View honest recommendations based on your needs</li>
                  <li>Make informed purchasing decisions</li>
                </ul>
              </div>
              <div className="help-section">
                <h3>Contact Support</h3>
                <p>Need help? Reach out to us at <a href="mailto:support@trueneed.com">support@trueneed.com</a></p>
              </div>
              <div className="help-section">
                <h3>FAQs</h3>
                <details className="faq-item">
                  <summary>How accurate are the recommendations?</summary>
                  <p>Our AI analyzes thousands of products and reviews to provide data-driven recommendations tailored to your specific needs.</p>
                </details>
                <details className="faq-item">
                  <summary>Is TrueNeed free to use?</summary>
                  <p>Yes! TrueNeed is completely free. We help you make better purchasing decisions without any cost.</p>
                </details>
                <details className="faq-item">
                  <summary>How do you make money?</summary>
                  <p>We may earn affiliate commissions when you purchase through our links, but this never affects our recommendations.</p>
                </details>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            <div className="modal-header">
              <h2 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={24} />
                Delete Account
              </h2>
              <button className="modal-close" onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteTermsAgreed(false);
              }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                  Are you sure you want to permanently delete your account? This action cannot be undone.
                </p>
                <div style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  border: '1px solid #fecaca'
                }}>
                  <h4 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    What will be deleted:
                  </h4>
                  <ul style={{ 
                    margin: '0', 
                    paddingLeft: '1.5rem', 
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <li>Your profile and personal information</li>
                    <li>All your chat history and conversations</li>
                    <li>Your preferences and settings</li>
                    <li>Access to your account permanently</li>
                  </ul>
                </div>
              </div>
              
              <div style={{ 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  <input 
                    type="checkbox" 
                    checked={deleteTermsAgreed}
                    onChange={(e) => setDeleteTermsAgreed(e.target.checked)}
                    style={{ 
                      marginTop: '0.2rem',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span>
                    I understand that this action is permanent and irreversible. I want to delete my account and all associated data.
                  </span>
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  className="auth-button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteTermsAgreed(false);
                  }}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="auth-button"
                  onClick={handleDeleteAccount}
                  disabled={!deleteTermsAgreed}
                  style={{
                    backgroundColor: deleteTermsAgreed ? '#dc2626' : '#991b1b',
                    color: 'white',
                    opacity: deleteTermsAgreed ? 1 : 0.5,
                    cursor: deleteTermsAgreed ? 'pointer' : 'not-allowed'
                  }}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: toastType === 'success' ? '#10b981' : toastType === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            zIndex: 10000,
            maxWidth: '400px',
            fontSize: '0.95rem'
          }}
        >
          {toastType === 'success' && <CheckCircle size={20} />}
          {toastType === 'error' && <XCircle size={20} />}
          {toastType === 'info' && <AlertTriangle size={20} />}
          <span>{toastMessage}</span>
        </motion.div>
      )}
    </div>
  );
}

export default App;
