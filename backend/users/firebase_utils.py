"""
Firebase utilities for phone authentication and SMS OTP
"""
import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
import os

# Initialize Firebase Admin SDK (only once)
_firebase_initialized = False

def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials"""
    global _firebase_initialized
    
    if _firebase_initialized:
        return
    
    try:
        cred_path = os.path.join(settings.BASE_DIR, 'firebase-credentials.json')
        
        if not os.path.exists(cred_path):
            print(f"⚠️  Firebase credentials not found at: {cred_path}")
            print("📝 Phone OTP will return code in response instead of sending SMS")
            return
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        print("✅ Firebase Admin SDK initialized successfully")
        
    except Exception as e:
        print(f"❌ Firebase initialization failed: {str(e)}")
        print("📝 Phone OTP will return code in response instead of sending SMS")


def send_sms_otp(phone_number, otp):
    """
    Send SMS OTP using Firebase (placeholder - Firebase Auth handles this automatically)
    
    Note: Firebase Authentication automatically sends SMS when you create a 
    custom token or use the client SDK. For custom SMS, use Twilio instead.
    
    Args:
        phone_number: Phone number with country code (e.g., +1234567890)
        otp: The OTP code to send
        
    Returns:
        tuple: (success: bool, message: str)
    """
    # Firebase Auth doesn't provide direct SMS sending through Admin SDK
    # You need to either:
    # 1. Use Firebase Auth client SDK on frontend
    # 2. Use Twilio/other SMS service
    # 3. Use Firebase Cloud Functions
    
    # For now, return OTP in response (testing mode)
    return False, f"Firebase SMS not configured. OTP: {otp}"


def verify_phone_token(id_token):
    """
    Verify Firebase ID token from client
    
    Args:
        id_token: Firebase ID token from client
        
    Returns:
        dict: Decoded token with user info
    """
    initialize_firebase()
    
    if not _firebase_initialized:
        return None
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {str(e)}")
        return None


def create_custom_token(uid):
    """
    Create a custom Firebase token for a user
    
    Args:
        uid: Unique user ID
        
    Returns:
        str: Custom token
    """
    initialize_firebase()
    
    if not _firebase_initialized:
        return None
    
    try:
        custom_token = auth.create_custom_token(uid)
        return custom_token.decode('utf-8')
    except Exception as e:
        print(f"Custom token creation failed: {str(e)}")
        return None


# Initialize on module import
initialize_firebase()
