from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import redirect
from django.core.cache import cache
import secrets
import requests
import urllib.parse
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, 
    ForgotPasswordSerializer, ResetPasswordSerializer,
    VerifyOTPSerializer, ResendOTPSerializer
)
from .models import PendingRegistration, PhoneOTP
from .sms_utils import send_sms_otp
from .firebase_utils import verify_phone_token

User = get_user_model()


class RegisterView(APIView):
    """
    API endpoint to initiate user registration (sends OTP)
    POST /api/auth/register/
    """
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        name = serializer.validated_data['name']
        password = serializer.validated_data['password']
        avatar_color = serializer.validated_data.get('avatar_color', None)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete any existing pending registration
        PendingRegistration.objects.filter(email=email).delete()
        
        # Generate OTP
        otp = PendingRegistration.generate_otp()
        
        # Create pending registration
        from django.contrib.auth.hashers import make_password
        pending_reg = PendingRegistration.objects.create(
            email=email,
            name=name,
            password=make_password(password),
            avatar_color=avatar_color,
            otp=otp
        )
        
        # Send OTP via email
        try:
            subject = 'Verify Your TrueNeed Account'
            
            # Plain text version (fallback)
            message = f"""
Hi {name},

Welcome to TrueNeed! Your AI Financial Guardrail.

Your verification code is: {otp}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
TrueNeed Team
            """
            
            # HTML version (beautiful format)
            html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                🛡️ TrueNeed
                            </h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                                Your AI Financial Guardrail
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 16px 0; color: #1a202c; font-size: 24px; font-weight: 600;">
                                Welcome, {name}! 👋
                            </h2>
                            <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Thank you for joining TrueNeed! We're excited to help you take control of your financial future.
                            </p>
                            <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                To complete your registration, please verify your email address using the code below:
                            </p>
                            
                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; margin: 32px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; text-align: center;">
                                        <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                            Your Verification Code
                                        </p>
                                        <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            {otp}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Info Box -->
                            <table role="presentation" style="width: 100%; background-color: #f7fafc; border-left: 4px solid #667eea; border-radius: 4px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.6;">
                                            ⏱️ <strong>This code will expire in 10 minutes.</strong><br>
                                            🔒 For your security, never share this code with anyone.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                If you didn't request this verification code, you can safely ignore this email. Someone may have entered your email address by mistake.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px; font-weight: 600;">
                                TrueNeed Team
                            </p>
                            <p style="margin: 0 0 16px 0; color: #718096; font-size: 13px;">
                                Making financial decisions smarter with AI
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © 2026 TrueNeed. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
                html_message=html_message,
            )
            
            return Response({
                'message': 'OTP sent successfully to your email',
                'email': email
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
           # If email fails, still return success but log error
            import traceback
            import sys
            error_msg = f"❌ EMAIL SENDING FAILED: {str(e)}"
            traceback_str = traceback.format_exc()
            print(error_msg, file=sys.stderr, flush=True)
            print(traceback_str, file=sys.stderr, flush=True)
            return Response({
                'message': 'OTP sent successfully to your email',
                'email': email,
                'otp': otp,  # Only for development - remove in production
                'error': str(e)  # Add error to response for debugging
            }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    API endpoint to verify OTP and complete registration
    POST /api/auth/verify-otp/
    """
    permission_classes = (AllowAny,)
    serializer_class = VerifyOTPSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        try:
            pending_reg = PendingRegistration.objects.get(email=email)
        except PendingRegistration.DoesNotExist:
            return Response({
                'error': 'No pending registration found for this email'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify OTP
        success, message = pending_reg.verify_otp(otp)
        
        if not success:
            return Response({
                'error': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create actual user
        user = User.objects.create(
            email=pending_reg.email,
            name=pending_reg.name,
            password=pending_reg.password,  # Already hashed
            avatar_color=pending_reg.avatar_color
        )
        
        # Delete pending registration
        pending_reg.delete()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration completed successfully'
        }, status=status.HTTP_201_CREATED)


class ResendOTPView(APIView):
    """
    API endpoint to resend OTP
    POST /api/auth/resend-otp/
    """
    permission_classes = (AllowAny,)
    serializer_class = ResendOTPSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            pending_reg = PendingRegistration.objects.get(email=email)
        except PendingRegistration.DoesNotExist:
            return Response({
                'error': 'No pending registration found for this email'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Generate new OTP
        new_otp = PendingRegistration.generate_otp()
        pending_reg.otp = new_otp
        pending_reg.otp_attempts = 0  # Reset attempts
        from django.utils import timezone
        pending_reg.otp_created_at = timezone.now()  # Reset expiry
        pending_reg.save()
        
        # Send new OTP via email
        try:
            subject = 'Your New TrueNeed Verification Code'
            
            # Plain text version (fallback)
            message = f"""
Hi {pending_reg.name},

Your new verification code is: {new_otp}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
TrueNeed Team
            """
            
            # HTML version (beautiful format)
            html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                🛡️ TrueNeed
                            </h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                                Your AI Financial Guardrail
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 16px 0; color: #1a202c; font-size: 24px; font-weight: 600;">
                                New Verification Code 🔄
                            </h2>
                            <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hi {pending_reg.name}, you requested a new verification code. Here it is:
                            </p>
                            
                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; margin: 32px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; text-align: center;">
                                        <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                            Your New Verification Code
                                        </p>
                                        <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            {new_otp}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Info Box -->
                            <table role="presentation" style="width: 100%; background-color: #f7fafc; border-left: 4px solid #667eea; border-radius: 4px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.6;">
                                            ⏱️ <strong>This code will expire in 10 minutes.</strong><br>
                                            🔒 For your security, never share this code with anyone.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                If you didn't request this code, please secure your account immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px; font-weight: 600;">
                                TrueNeed Team
                            </p>
                            <p style="margin: 0 0 16px 0; color: #718096; font-size: 13px;">
                                Making financial decisions smarter with AI
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © 2026 TrueNeed. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
                html_message=html_message,
            )
            
            return Response({
                'message': 'New OTP sent successfully to your email'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Email sending failed: {str(e)}")
            return Response({
                'message': 'New OTP sent successfully to your email',
                'otp': new_otp  # Only for development - remove in production
            }, status=status.HTTP_200_OK)


class LoginView(APIView):
    """
    API endpoint for user login
    POST /api/auth/login/
    """
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        
        if user is None:
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    API endpoint for user logout
    POST /api/auth/logout/
    """
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            # Return success even if token is invalid/expired
            # The goal is to clear the session, which is handled client-side
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    """
    API endpoint to get current user details
    GET /api/auth/me/
    """
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    """
    API endpoint to update user profile (avatar color, profile image, name)
    PATCH /api/auth/profile/
    """
    permission_classes = (IsAuthenticated,)
    
    def patch(self, request):
        user = request.user
        
        # Update avatar color if provided
        if 'avatar_color' in request.data:
            user.avatar_color = request.data['avatar_color']
        
        # Update profile image if provided
        if 'profile_image' in request.data:
            user.profile_image = request.data['profile_image']
        
        # Update name if provided
        if 'name' in request.data:
            user.name = request.data['name']
        
        user.save()
        
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'message': 'Profile updated successfully'
        }, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """
    API endpoint to delete user account permanently
    DELETE /api/auth/account/
    """
    permission_classes = (IsAuthenticated,)
    
    def delete(self, request):
        print(f"🗑️ Delete account request received")
        print(f"User: {request.user}")
        print(f"Is authenticated: {request.user.is_authenticated}")
        print(f"Authorization header: {request.META.get('HTTP_AUTHORIZATION', 'NO AUTH HEADER')}")
        
        user = request.user
        email = user.email
        
        # Optionally require password confirmation for security
        password = request.data.get('password')
        if password and not user.check_password(password):
            return Response({
                'error': 'Incorrect password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete user account
        user.delete()
        print(f"✅ Account deleted: {email}")
        
        return Response({
            'message': 'Account deleted successfully'
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    API endpoint to request password reset
    POST /api/auth/forgot-password/
    """
    permission_classes = (AllowAny,)
    serializer_class = ForgotPasswordSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create reset link
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_link = f"{frontend_url}/reset-password?token={token}&uid={uid}"
            
            # Send email
            subject = 'Reset Your TrueNeed Password'
            message = f"""
Hi {user.name},

You requested to reset your password for TrueNeed.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
TrueNeed Team
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Password reset email sent successfully'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Don't reveal that the email doesn't exist
            return Response({
                'message': 'Password reset email sent successfully'
            }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    API endpoint to reset password with token
    POST /api/auth/reset-password/
    """
    permission_classes = (AllowAny,)
    serializer_class = ResetPasswordSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        uid = serializer.validated_data['uid']
        password = serializer.validated_data['password']
        
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response({
                    'error': 'Invalid or expired reset link'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(password)
            user.save()
            
            return Response({
                'message': 'Password reset successfully'
            }, status=status.HTTP_200_OK)
            
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)


class OAuthLoginView(APIView):
    """
    API endpoint to initiate OAuth login
    GET /api/auth/oauth/<provider>/
    """
    permission_classes = (AllowAny,)
    
    def get(self, request, provider):
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        redirect_uri = f"{request.scheme}://{request.get_host()}/api/auth/oauth/{provider}/callback/"
        
        # Generate state for CSRF protection
        state = secrets.token_urlsafe(32)
        # Store state in cache for 10 minutes
        cache.set(f'oauth_state_{state}', provider, 600)
        
        if provider == 'google':
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '')
            auth_url = (
                f"https://accounts.google.com/o/oauth2/v2/auth?"
                f"client_id={client_id}&"
                f"redirect_uri={redirect_uri}&"
                f"response_type=code&"
                f"scope=openid email profile&"
                f"state={state}"
            )
            return Response({'auth_url': auth_url}, status=status.HTTP_200_OK)
        
        elif provider == 'apple':
            client_id = getattr(settings, 'APPLE_CLIENT_ID', '')
            auth_url = (
                f"https://appleid.apple.com/auth/authorize?"
                f"client_id={client_id}&"
                f"redirect_uri={redirect_uri}&"
                f"response_type=code&"
                f"scope=name email&"
                f"response_mode=form_post&"
                f"state={state}"
            )
            return Response({'auth_url': auth_url}, status=status.HTTP_200_OK)
        
        elif provider == 'microsoft':
            client_id = getattr(settings, 'MICROSOFT_CLIENT_ID', '')
            tenant = getattr(settings, 'MICROSOFT_TENANT', 'common')
            auth_url = (
                f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?"
                f"client_id={client_id}&"
                f"redirect_uri={redirect_uri}&"
                f"response_type=code&"
                f"scope=openid email profile&"
                f"state={state}"
            )
            return Response({'auth_url': auth_url}, status=status.HTTP_200_OK)
        
        return Response({
            'error': f'Unsupported OAuth provider: {provider}'
        }, status=status.HTTP_400_BAD_REQUEST)


class OAuthCallbackView(APIView):
    """
    API endpoint to handle OAuth callback
    GET /api/auth/oauth/<provider>/callback/
    """
    permission_classes = (AllowAny,)
    
    def get(self, request, provider):
        code = request.GET.get('code')
        state = request.GET.get('state')
        
        # Verify state for CSRF protection
        saved_provider = cache.get(f'oauth_state_{state}')
        if not saved_provider or saved_provider != provider:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3003')
            return redirect(f"{frontend_url}/oauth/callback?error=Invalid+state+parameter")
        
        # Delete used state
        cache.delete(f'oauth_state_{state}')
        
        # Exchange code for access token and get user info
        try:
            if provider == 'google':
                user_info = self._google_get_user_info(code, request)
            elif provider == 'apple':
                user_info = self._apple_get_user_info(code, request)
            elif provider == 'microsoft':
                user_info = self._microsoft_get_user_info(code, request)
            else:
                return Response({
                    'error': f'Unsupported OAuth provider: {provider}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find or create user
            email = user_info['email']
            name = user_info.get('name', email.split('@')[0])
            profile_picture = user_info.get('picture', None)
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'name': name, 'profile_image': profile_picture}
            )
            
            if created:
                # Set a random password for OAuth users
                user.set_password(secrets.token_urlsafe(32))
                user.save()
            elif profile_picture:
                # Always update profile picture from OAuth if available
                user.profile_image = profile_picture
                user.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Redirect to frontend with tokens in URL parameters
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3003')
            tokens = {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
            profile_image = urllib.parse.quote(user.profile_image or '') if user.profile_image else ''
            redirect_url = f"{frontend_url}/oauth/callback?access={tokens['access']}&refresh={tokens['refresh']}&name={urllib.parse.quote(user.name)}&email={urllib.parse.quote(user.email)}&avatar_color={urllib.parse.quote(user.avatar_color or '')}&profile_image={profile_image}"
            return redirect(redirect_url)
            
        except Exception as e:
            # Redirect to frontend with error
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3003')
            error_msg = urllib.parse.quote(str(e))
            return redirect(f"{frontend_url}/oauth/callback?error={error_msg}")
    
    def _google_get_user_info(self, code, request):
        # Exchange code for access token
        redirect_uri = f"{request.scheme}://{request.get_host()}/api/auth/oauth/google/callback/"
        token_url = "https://oauth2.googleapis.com/token"
        
        token_data = {
            'code': code,
            'client_id': getattr(settings, 'GOOGLE_CLIENT_ID', ''),
            'client_secret': getattr(settings, 'GOOGLE_CLIENT_SECRET', ''),
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        access_token = token_response.json()['access_token']
        
        # Get user info
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_info_url, headers=headers)
        user_response.raise_for_status()
        
        return user_response.json()
    
    def _apple_get_user_info(self, code, request):
        # Apple OAuth is more complex and requires JWT signing
        # This is a placeholder - full implementation requires apple key configuration
        raise NotImplementedError("Apple OAuth requires additional configuration")
    
    def _microsoft_get_user_info(self, code, request):
        redirect_uri = f"{request.scheme}://{request.get_host()}/api/auth/oauth/microsoft/callback/"
        tenant = getattr(settings, 'MICROSOFT_TENANT', 'common')
        token_url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
        
        token_data = {
            'code': code,
            'client_id': getattr(settings, 'MICROSOFT_CLIENT_ID', ''),
            'client_secret': getattr(settings, 'MICROSOFT_CLIENT_SECRET', ''),
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        access_token = token_response.json()['access_token']
        
        # Get user info
        user_info_url = "https://graph.microsoft.com/v1.0/me"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_info_url, headers=headers)
        user_response.raise_for_status()
        
        user_data = user_response.json()
        return {
            'email': user_data.get('mail') or user_data.get('userPrincipalName'),
            'name': user_data.get('displayName', '')
        }


class PhoneRegisterView(APIView):
    """
    API endpoint to initiate phone registration (sends SMS OTP)
    POST /api/auth/phone/register/
    """
    permission_classes = (AllowAny,)
    
    def post(self, request):
        phone_number = request.data.get('phone_number', '').strip()
        name = request.data.get('name', '').strip()
        password = request.data.get('password', '')
        password2 = request.data.get('password2', '')
        avatar_color = request.data.get('avatar_color')
        
        # Validate inputs
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not name:
            return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if password != password2:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(phone_number=phone_number).exists():
            return Response({'error': 'Phone number already registered'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete any existing phone OTP for this number
        PhoneOTP.objects.filter(phone_number=phone_number).delete()
        
        # Generate OTP
        otp = PhoneOTP.generate_otp()
        
        # Store registration data
        from django.contrib.auth.hashers import make_password
        PhoneOTP.objects.create(
            phone_number=phone_number,
            name=name,
            password=make_password(password),
            avatar_color=avatar_color,
            otp=otp,
            purpose='registration'
        )
        
        # Send OTP via SMS
        success, message = send_sms_otp(phone_number, otp)
        
        response_data = {
            'message': 'OTP sent successfully to your phone',
            'phone_number': phone_number,
        }
        
        # If SMS failed, include OTP in response for testing
        if not success:
            response_data['otp'] = otp
            response_data['debug_message'] = message
        
        return Response(response_data, status=status.HTTP_200_OK)


class PhoneLoginView(APIView):
    """
    API endpoint to initiate phone login (sends SMS OTP)
    POST /api/auth/phone/login/
    """
    permission_classes = (AllowAny,)
    
    def post(self, request):
        phone_number = request.data.get('phone_number', '').strip()
        
        # Validate input
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response({'error': 'Phone number not registered'}, status=status.HTTP_404_NOT_FOUND)
        
        # Delete any existing phone OTP for this number
        PhoneOTP.objects.filter(phone_number=phone_number).delete()
        
        # Generate OTP
        otp = PhoneOTP.generate_otp()
        
        # Store OTP
        PhoneOTP.objects.create(
            phone_number=phone_number,
            otp=otp,
            purpose='login'
        )
        
        # Send OTP via SMS
        success, message = send_sms_otp(phone_number, otp)
        
        response_data = {
            'message': 'OTP sent successfully to your phone',
            'phone_number': phone_number,
        }
        
        # If SMS failed, include OTP in response for testing
        if not success:
            response_data['otp'] = otp
            response_data['debug_message'] = message
        
        return Response(response_data, status=status.HTTP_200_OK)


class PhoneVerifyOTPView(APIView):
    """
    API endpoint to verify phone OTP and complete registration/login
    POST /api/auth/phone/verify-otp/
    """
    permission_classes = (AllowAny,)
    
    def post(self, request):
        phone_number = request.data.get('phone_number', '').strip()
        otp = request.data.get('otp', '').strip()
        
        if not phone_number or not otp:
            return Response({'error': 'Phone number and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the most recent OTP for this phone number
        try:
            phone_otp = PhoneOTP.objects.filter(phone_number=phone_number).latest('created_at')
        except PhoneOTP.DoesNotExist:
            return Response({'error': 'No OTP found for this phone number'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify OTP
        is_valid, message = phone_otp.verify_otp(otp)
        
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle registration or login based on purpose
        if phone_otp.purpose == 'registration':
            # Create new user
            user = User.objects.create(
                phone_number=phone_number,
                name=phone_otp.name,
                password=phone_otp.password,
                avatar_color=phone_otp.avatar_color,
                is_active=True,
                email=f"{phone_number}@phone.trueneed.local"  # Generate email for phone users
            )
            
            # Delete phone OTP record
            phone_otp.delete()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            serializer = UserSerializer(user)
            return Response({
                'message': 'Registration successful',
                'user': serializer.data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
        
        else:  # login
            # Get existing user
            try:
                user = User.objects.get(phone_number=phone_number)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Delete phone OTP record
            phone_otp.delete()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            serializer = UserSerializer(user)
            return Response({
                'message': 'Login successful',
                'user': serializer.data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)


class FirebasePhoneAuthView(APIView):
    """
    API endpoint to authenticate with Firebase phone token
    POST /api/auth/firebase/phone/
    
    Accepts Firebase ID token from client-side Firebase Auth
    Creates or logs in user based on phone number from token
    """
    permission_classes = (AllowAny,)
    
    def post(self, request):
        firebase_token = request.data.get('firebase_token', '').strip()
        name = request.data.get('name', '').strip()
        password = request.data.get('password', '')
        
        if not firebase_token:
            return Response({'error': 'Firebase token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify Firebase token
        decoded_token = verify_phone_token(firebase_token)
        
        if not decoded_token:
            return Response({'error': 'Invalid Firebase token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get phone number from token
        phone_number = decoded_token.get('phone_number')
        uid = decoded_token.get('uid')
        
        if not phone_number:
            return Response({'error': 'Phone number not found in token'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists
        try:
            user = User.objects.get(phone_number=phone_number)
            # User exists - login
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)
            
            return Response({
                'message': 'Login successful',
                'user': serializer.data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # User doesn't exist - register
            if not name:
                return Response({
                    'error': 'Name is required for registration',
                    'requires_registration': True
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new user
            from django.contrib.auth.hashers import make_password
            user = User.objects.create(
                phone_number=phone_number,
                name=name,
                password=make_password(password) if password else make_password(uid),
                is_active=True,
                email=f"{phone_number}@phone.trueneed.local"
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)
            
            return Response({
                'message': 'Registration successful',
                'user': serializer.data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
