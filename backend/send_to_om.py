import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("\n" + "="*60)
print("🔥 SENDING TEST EMAIL TO: omshukla1661@gmail.com")
print("="*60)

subject = "Your TrueNeed Verification Code - TEST"
message = """Hi Om,

Your verification code is:

185737

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
TrueNeed Team
"""

try:
    print("\n📧 Sending email...")
    print(f"   From: {settings.EMAIL_HOST_USER}")
    print(f"   To: omshukla1661@gmail.com")
    print(f"   Subject: {subject}")
    
    result = send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        ['omshukla1661@gmail.com'],
        fail_silently=False,
    )
    
    print(f"\n✅ SUCCESS! Email sent (result: {result})")
    print(f"\n📬 CHECK YOUR INBOX: omshukla1661@gmail.com")
    print(f"   - Check Primary tab")
    print(f"   - Check Promotions tab")
    print(f"   - Check Spam folder")
    print(f"\n🔢 OTP CODE: 185737")
    print("="*60 + "\n")
    
except Exception as e:
    print(f"\n❌ FAILED: {type(e).__name__}")
    print(f"   Error: {str(e)}")
    print("="*60 + "\n")
