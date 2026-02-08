import requests
import json

url = 'http://localhost:8000/api/auth/register/'
data = {
    'email': 'omshukla1661@gmail.com',
    'password': 'Beautiful@123',
    'password2': 'Beautiful@123',
    'name': 'Om Shukla'
}

print("📧 Sending beautiful OTP email to Om...")
print(f"✉️  Email: {data['email']}")
print("\n⏳ Processing...\n")

response = requests.post(url, json=data)

print(f"✅ Status: {response.status_code}")
response_data = response.json()

if 'otp' in response_data:
    print(f"⚠️  Email sending had an issue")
    print(f"🔢 OTP (for testing): {response_data['otp']}")
else:
    print(f"✅ Beautiful email sent successfully!")
    print(f"\n📬 CHECK YOUR INBOX: {data['email']}")
    print(f"\n✨ The new email features:")
    print(f"   🎨 Purple gradient header with TrueNeed shield")
    print(f"   📦 Large OTP code in highlighted box")
    print(f"   📱 Mobile-responsive design")
    print(f"   🎯 Professional styling with emojis")
    print(f"   ⚡ Clean, modern layout")
