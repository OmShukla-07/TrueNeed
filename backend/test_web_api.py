import requests
import json

url = 'http://localhost:8000/api/auth/register/'
data = {
    'email': 'testwebapi@gmail.com',
    'password': 'TestPass123!',
    'password2': 'TestPass123!',
    'name': 'Web Api'
}

print("🚀 Testing registration via web API...")
print(f"📧 Email: {data['email']}")

response = requests.post(url, json=data)

print(f"\n✅ Status Code: {response.status_code}")
print(f"📝 Response: {response.text}")

response_data = response.json()
print(f"\n📦 JSON Response:")
print(json.dumps(response_data, indent=2))

if 'otp' in response_data:
    print(f"\n⚠️  WARNING: OTP in response means email sending FAILED!")
    print(f"🔢 OTP: {response_data['otp']}")
else:
    print(f"\n✅ SUCCESS: No OTP in response means email was sent!")
