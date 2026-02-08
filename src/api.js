// API configuration and authentication service for TrueNeed

const API_BASE_URL = 'http://localhost:8000/api';

// Token management
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');
const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// API request helper with JWT
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = getAccessToken();
  
  console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);
  console.log('🔑 Access token:', accessToken ? accessToken.substring(0, 20) + '...' : 'NO TOKEN');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle token expiration
    if (response.status === 401 && accessToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });
        return await handleResponse(retryResponse);
      } else {
        // Refresh failed, logout user
        clearTokens();
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }
    }
    
    return await handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle different error formats from Django
    let errorMessage = 'Request failed';
    
    if (data.error) {
      errorMessage = data.error;
    } else if (data.detail) {
      errorMessage = data.detail;
    } else if (data.message) {
      errorMessage = data.message;
    } else if (typeof data === 'object') {
      // Handle field-specific errors (like validation errors)
      const errors = Object.entries(data)
        .map(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages.join(', ') : messages;
          return `${field}: ${msg}`;
        })
        .join('; ');
      errorMessage = errors || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return data;
};

// Refresh access token using refresh token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Auth API calls
export const authAPI = {
  // Register new user (sends OTP)
  register: async (name, email, password, avatarColor = null) => {
    const data = await apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        password2: password,
        avatar_color: avatarColor,
      }),
    });
    
    return data;
  },
  
  // Verify OTP and complete registration
  verifyOTP: async (email, otp) => {
    const data = await apiRequest('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    
    if (data.tokens) {
      setTokens(data.tokens.access, data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },
  
  // Resend OTP
  resendOTP: async (email) => {
    return await apiRequest('/auth/resend-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  // Login user
  login: async (email, password) => {
    const data = await apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    console.log('📦 Login response received:', {
      hasTokens: !!data.tokens,
      hasUser: !!data.user,
      tokensData: data.tokens ? {
        hasAccess: !!data.tokens.access,
        hasRefresh: !!data.tokens.refresh
      } : 'NO TOKENS'
    });
    
    if (data.tokens) {
      console.log('🔑 Login successful - Saving tokens:', {
        access: data.tokens.access?.substring(0, 20) + '...',
        refresh: data.tokens.refresh?.substring(0, 20) + '...'
      });
      setTokens(data.tokens.access, data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Tokens saved to localStorage');
      
      // Verify tokens were saved
      const savedAccess = localStorage.getItem('access_token');
      const savedRefresh = localStorage.getItem('refresh_token');
      console.log('🔍 Verification - Tokens in localStorage:', {
        access: savedAccess ? savedAccess.substring(0, 20) + '...' : 'NOT FOUND',
        refresh: savedRefresh ? savedRefresh.substring(0, 20) + '...' : 'NOT FOUND'
      });
    } else {
      console.error('❌ No tokens in login response!');
    }
    
    return data;
  },
  
  // Logout user
  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await apiRequest('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        // Silently handle logout errors - token might already be invalid
        // This is not critical since we clear tokens locally anyway
      }
    }
    clearTokens();
  },
  
  // Get current user
  getCurrentUser: async () => {
    return await apiRequest('/auth/me/');
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    const data = await apiRequest('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },
  
  // Delete user account permanently
  deleteAccount: async (password = null) => {
    console.log('🗑️ Attempting to delete account...');
    const body = password ? JSON.stringify({ password }) : null;
    await apiRequest('/auth/account/', {
      method: 'DELETE',
      body,
    });
    console.log('✅ Account deletion API call successful');
    clearTokens();
  },
  
  // Forgot password - send reset email
  forgotPassword: async (email) => {
    return await apiRequest('/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  // Reset password with token
  resetPassword: async (token, newPassword) => {
    return await apiRequest('/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify({ 
        token,
        password: newPassword,
        password2: newPassword 
      }),
    });
  },
  
  // OAuth login - get authorization URL
  oauthLogin: async (provider) => {
    return await apiRequest(`/auth/oauth/${provider}/`, {
      method: 'GET',
    });
  },
  
  // OAuth callback - exchange code for tokens
  oauthCallback: async (provider, code, state) => {
    const data = await apiRequest(`/auth/oauth/${provider}/callback/`, {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
    
    if (data.tokens) {
      setTokens(data.tokens.access, data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },
  
  // Phone registration - send SMS OTP
  phoneRegister: async (phoneNumber, name, password, password2, avatarColor) => {
    return await apiRequest('/auth/phone/register/', {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber,
        name,
        password,
        password2,
        avatar_color: avatarColor,
      }),
    });
  },
  
  // Phone login - send SMS OTP
  phoneLogin: async (phoneNumber) => {
    return await apiRequest('/auth/phone/login/', {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber,
      }),
    });
  },
  
  // Phone OTP verification
  phoneVerifyOTP: async (phoneNumber, otp) => {
    const data = await apiRequest('/auth/phone/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber,
        otp,
      }),
    });
    
    if (data.access && data.refresh) {
      setTokens(data.access, data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },
  
  // Firebase phone authentication - verify Firebase token
  firebasePhoneAuth: async (firebaseToken, name = null, password = null) => {
    const data = await apiRequest('/auth/firebase/phone/', {
      method: 'POST',
      body: JSON.stringify({
        firebase_token: firebaseToken,
        name,
        password,
      }),
    });
    
    if (data.access && data.refresh) {
      setTokens(data.access, data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },
};

// Chat API (will integrate with n8n later)
export const chatAPI = {
  sendMessage: async (message, conversationId = null) => {
    // For now, return mock response
    // Will integrate with n8n webhook later
    return {
      message: "I'm TrueNeed AI. Backend integration coming soon!",
      timestamp: new Date().toISOString(),
    };
  },
};

// Product analysis API (will integrate with n8n later)
export const productAPI = {
  analyzeProduct: async (url) => {
    // Will integrate with n8n webhook later
    return {
      name: "Sample Product",
      price: "$99.99",
      analysis: "Analysis coming soon with n8n integration",
    };
  },
};

export default {
  authAPI,
  chatAPI,
  productAPI,
};
