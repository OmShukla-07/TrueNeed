"""
SMS utilities using Twilio for phone OTP
Twilio is recommended over Firebase for sending SMS
"""
from django.conf import settings
import os

# Try to import Twilio (optional dependency)
try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    print("⚠️  Twilio not installed. Run: pip install twilio")


def send_sms_otp(phone_number, otp):
    """
    Send SMS OTP using Twilio
    
    Args:
        phone_number: Phone number with country code (e.g., +1234567890)
        otp: The OTP code to send
        
    Returns:
        tuple: (success: bool, message: str)
    """
    # Check if Twilio is configured
    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
    auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
    from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
    
    if not TWILIO_AVAILABLE:
        return False, f"Twilio not installed. OTP: {otp}"
    
    if not all([account_sid, auth_token, from_number]):
        return False, f"Twilio not configured. OTP: {otp}"
    
    try:
        client = Client(account_sid, auth_token)
        
        message_body = f"""
🛡️ TrueNeed Verification

Your verification code is: {otp}

This code will expire in 10 minutes.

If you didn't request this, please ignore.
""".strip()
        
        message = client.messages.create(
            body=message_body,
            from_=from_number,
            to=phone_number
        )
        
        return True, f"SMS sent successfully (SID: {message.sid})"
        
    except Exception as e:
        return False, f"SMS sending failed: {str(e)}. OTP: {otp}"


def verify_phone_number(phone_number, otp):
    """
    Verify phone OTP code
    
    Args:
        phone_number: Phone number to verify
        otp: OTP code entered by user
        
    Returns:
        tuple: (success: bool, message: str)
    """
    # This is handled by PhoneOTP model's verify_otp method
    # This function is for future Twilio Verify API integration
    pass
