from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import random
import string


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, name, password=None, **extra_fields):
        """Create and return a regular user with email and password"""
        if not email:
            raise ValueError('Email address is required')
        if not name:
            raise ValueError('Name is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, name, password=None, **extra_fields):
        """Create and return a superuser with admin privileges"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model using email as the username field"""
    
    email = models.EmailField(
        max_length=255,
        unique=True,
        db_index=True,
        verbose_name='Email Address'
    )
    name = models.CharField(max_length=255, verbose_name='Full Name')
    phone_number = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        unique=True,
        db_index=True,
        verbose_name='Phone Number',
        help_text='Phone number with country code (e.g., +1234567890)'
    )
    
    # Authentication fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # OAuth fields (for future Google/Apple/Microsoft login)
    oauth_provider = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        choices=[
            ('google', 'Google'),
            ('apple', 'Apple'),
            ('microsoft', 'Microsoft'),
        ]
    )
    oauth_id = models.CharField(max_length=255, null=True, blank=True)
    
    # Profile customization
    avatar_color = models.CharField(
        max_length=7,
        null=True,
        blank=True,
        help_text='Hex color code for avatar background (e.g., #10b981)'
    )
    profile_image = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text='URL or path to profile image'
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.name.split()[0] if self.name else self.email


class PendingRegistration(models.Model):
    """Model to store pending user registrations awaiting OTP verification"""
    
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)  # Hashed password
    avatar_color = models.CharField(max_length=7, null=True, blank=True)
    profile_image = models.TextField(null=True, blank=True)  # Base64 encoded image
    
    otp = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    otp_attempts = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pending_registrations'
        verbose_name = 'Pending Registration'
        verbose_name_plural = 'Pending Registrations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} - OTP: {self.otp}"
    
    @staticmethod
    def generate_otp():
        """Generate a random 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    def is_otp_valid(self):
        """Check if OTP is still valid (within 10 minutes)"""
        from datetime import timedelta
        expiry_time = self.otp_created_at + timedelta(minutes=10)
        return timezone.now() < expiry_time
    
    def is_locked(self):
        """Check if account is locked due to too many attempts"""
        return self.otp_attempts >= 5
    
    def verify_otp(self, otp):
        """Verify the provided OTP"""
        if self.is_locked():
            return False, "Too many failed attempts. Please request a new OTP."
        
        if not self.is_otp_valid():
            return False, "OTP has expired. Please request a new one."
        
        if self.otp == otp:
            return True, "OTP verified successfully"
        
        self.otp_attempts += 1
        self.save()
        
        remaining = 5 - self.otp_attempts
        if remaining > 0:
            return False, f"Invalid OTP. {remaining} attempts remaining."
        else:
            return False, "Invalid OTP. Account locked. Please request a new OTP."


class PhoneOTP(models.Model):
    """Model to store phone OTP codes for registration/login"""
    
    phone_number = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    password = models.CharField(max_length=255, null=True, blank=True)  # Hashed, for registration
    avatar_color = models.CharField(max_length=7, null=True, blank=True)
    
    otp = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    otp_attempts = models.IntegerField(default=0)
    
    purpose = models.CharField(
        max_length=20,
        choices=[
            ('registration', 'Registration'),
            ('login', 'Login'),
        ],
        default='login'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'phone_otps'
        verbose_name = 'Phone OTP'
        verbose_name_plural = 'Phone OTPs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.phone_number} - {self.purpose} - OTP: {self.otp}"
    
    @staticmethod
    def generate_otp():
        """Generate a random 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    def is_otp_valid(self):
        """Check if OTP is still valid (within 10 minutes)"""
        from datetime import timedelta
        expiry_time = self.otp_created_at + timedelta(minutes=10)
        return timezone.now() < expiry_time
    
    def is_locked(self):
        """Check if account is locked due to too many attempts"""
        return self.otp_attempts >= 5
    
    def verify_otp(self, otp):
        """Verify the provided OTP"""
        if self.is_locked():
            return False, "Too many failed attempts. Please request a new OTP."
        
        if not self.is_otp_valid():
            return False, "OTP has expired. Please request a new one."
        
        if self.otp == otp:
            return True, "OTP verified successfully"
        
        self.otp_attempts += 1
        self.save()
        
        remaining = 5 - self.otp_attempts
        if remaining > 0:
            return False, f"Invalid OTP. {remaining} attempts remaining."
        else:
            return False, "Invalid OTP. Account locked. Please request a new OTP."
