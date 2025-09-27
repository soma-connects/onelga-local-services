class AppConstants {
  // App Information
  static const String appName = 'Onelga Local Services';
  static const String appVersion = '1.0.0';
  static const String organizationName = 'Onelga Local Government Area';
  
  // API Configuration
  static const String baseUrl = 'http://localhost:3000/api';
  static const String socketUrl = 'ws://localhost:3000';
  static const int connectTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds
  
  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String settingsKey = 'app_settings';
  static const String notificationsKey = 'notifications';
  static const String serviceHistoryKey = 'service_history';
  
  // Service Categories
  static const List<String> serviceCategories = [
    'Health Services',
    'Education Services',
    'Housing Services',
    'Business Services',
    'Transport Services',
    'Legal Services',
    'Environmental Services',
    'Social Services',
    'Birth Certificate',
    'Tax Services'
  ];
  
  // Service Icons Map
  static const Map<String, String> serviceCategoryIcons = {
    'Health Services': 'assets/icons/health.svg',
    'Education Services': 'assets/icons/education.svg',
    'Housing Services': 'assets/icons/housing.svg',
    'Business Services': 'assets/icons/business.svg',
    'Transport Services': 'assets/icons/transport.svg',
    'Legal Services': 'assets/icons/legal.svg',
    'Environmental Services': 'assets/icons/environment.svg',
    'Social Services': 'assets/icons/social.svg',
    'Birth Certificate': 'assets/icons/certificate.svg',
    'Tax Services': 'assets/icons/tax.svg',
  };
  
  // Application Status
  static const List<String> applicationStatuses = [
    'Draft',
    'Submitted',
    'Under Review',
    'Approved',
    'Rejected',
    'Completed',
    'Cancelled'
  ];
  
  // Priority Levels
  static const List<String> priorityLevels = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];
  
  // Payment Methods
  static const List<String> paymentMethods = [
    'Paystack',
    'Flutterwave',
    'Bank Transfer',
    'Cash',
    'POS'
  ];
  
  // File Extensions
  static const List<String> allowedImageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp'
  ];
  
  static const List<String> allowedDocumentExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.jpg',
    '.jpeg',
    '.png'
  ];
  
  // File Size Limits (in bytes)
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int maxDocumentSize = 10 * 1024 * 1024; // 10MB
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Cache Duration (in seconds)
  static const int shortCacheDuration = 300; // 5 minutes
  static const int mediumCacheDuration = 1800; // 30 minutes
  static const int longCacheDuration = 86400; // 24 hours
  
  // Notification Settings
  static const String defaultNotificationChannel = 'onelga_services';
  static const String highPriorityNotificationChannel = 'onelga_urgent';
  
  // Contact Information
  static const String supportEmail = 'support@onelga.gov.ng';
  static const String supportPhone = '+234-803-123-4567';
  static const String officialWebsite = 'https://onelga.gov.ng';
  static const String facebookPage = 'https://facebook.com/onelgalga';
  static const String twitterHandle = '@OnelgaLGA';
  
  // Office Locations
  static const Map<String, Map<String, dynamic>> officeLocations = {
    'main_office': {
      'name': 'Onelga LGA Secretariat',
      'address': 'LGA Secretariat Complex, Ndoni, Rivers State',
      'coordinates': {'lat': 5.2356, 'lng': 6.4167},
      'phone': '+234-803-123-4567',
      'email': 'info@onelga.gov.ng',
      'hours': 'Monday - Friday: 8:00 AM - 4:00 PM'
    },
    'registry_office': {
      'name': 'Birth & Death Registry',
      'address': 'Registry Building, Ndoni, Rivers State',
      'coordinates': {'lat': 5.2366, 'lng': 6.4177},
      'phone': '+234-803-123-4568',
      'email': 'registry@onelga.gov.ng',
      'hours': 'Monday - Friday: 8:00 AM - 3:00 PM'
    }
  };
  
  // Emergency Contacts
  static const Map<String, String> emergencyContacts = {
    'Police': '199',
    'Fire Service': '199',
    'Medical Emergency': '199',
    'LGA Emergency': '+234-803-123-4567'
  };
  
  // Validation Rules
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 32;
  static const int minUsernameLength = 3;
  static const int maxUsernameLength = 20;
  static const int maxNameLength = 50;
  static const int maxAddressLength = 200;
  static const int maxDescriptionLength = 500;
  
  // Regular Expressions
  static const String emailRegex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  static const String phoneRegex = r'^\+?[0-9]{10,15}$';
  static const String ninRegex = r'^[0-9]{11}$';
  static const String bvnRegex = r'^[0-9]{11}$';
  
  // Date Formats
  static const String dateFormat = 'yyyy-MM-dd';
  static const String dateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
  static const String displayDateFormat = 'MMM dd, yyyy';
  static const String displayDateTimeFormat = 'MMM dd, yyyy HH:mm';
  
  // Languages
  static const List<Map<String, String>> supportedLanguages = [
    {'code': 'en', 'name': 'English', 'localName': 'English'},
    {'code': 'ig', 'name': 'Igbo', 'localName': 'Igbo'},
    {'code': 'ha', 'name': 'Hausa', 'localName': 'Hausa'},
    {'code': 'yo', 'name': 'Yoruba', 'localName': 'Yorùbá'},
  ];
  
  // Default Values
  static const String defaultCountry = 'Nigeria';
  static const String defaultState = 'Rivers State';
  static const String defaultLGA = 'Onelga';
  static const String defaultCurrency = 'NGN';
  static const String currencySymbol = '₦';
  
  // Feature Flags
  static const bool enableBiometricAuth = true;
  static const bool enablePushNotifications = true;
  static const bool enableLocationServices = true;
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;
  static const bool enableOfflineMode = true;
  
  // URLs
  static const String privacyPolicyUrl = 'https://onelga.gov.ng/privacy';
  static const String termsOfServiceUrl = 'https://onelga.gov.ng/terms';
  static const String helpUrl = 'https://onelga.gov.ng/help';
  static const String aboutUrl = 'https://onelga.gov.ng/about';
  
  // Government Information
  static const String lgaChairman = 'Hon. Erastus Awortu';
  static const String lgaSecretary = 'Mr. Chukwuemeka Okonkwo';
  static const String lgaCode = 'RIV/ONG/001';
  static const String stateCode = 'RIV';
  
  // Service Operating Hours
  static const Map<String, String> serviceHours = {
    'general_services': '8:00 AM - 4:00 PM (Mon-Fri)',
    'emergency_services': '24/7',
    'registry_services': '8:00 AM - 3:00 PM (Mon-Fri)',
    'tax_services': '8:00 AM - 4:00 PM (Mon-Fri)',
    'health_services': '8:00 AM - 6:00 PM (Mon-Fri), 9:00 AM - 2:00 PM (Sat)',
  };
}

// Route Names
class AppRoutes {
  static const String splash = '/splash';
  static const String home = '/home';
  static const String login = '/login';
  static const String register = '/register';
  static const String dashboard = '/dashboard';
  static const String services = '/services';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String notifications = '/notifications';
  static const String applications = '/applications';
  static const String applicationDetail = '/application-detail';
  static const String serviceDetail = '/service-detail';
  static const String serviceApplication = '/service-application';
  static const String help = '/help';
  static const String about = '/about';
  static const String contact = '/contact';
  static const String locations = '/locations';
  static const String emergencyContacts = '/emergency-contacts';
  static const String biometricSetup = '/biometric-setup';
  static const String changePassword = '/change-password';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';
  static const String verifyOtp = '/verify-otp';
}

// Error Messages
class ErrorMessages {
  static const String networkError = 'Network connection error. Please check your internet connection.';
  static const String serverError = 'Server error. Please try again later.';
  static const String unknownError = 'An unknown error occurred. Please try again.';
  static const String authenticationError = 'Authentication failed. Please login again.';
  static const String authorizationError = 'You are not authorized to perform this action.';
  static const String validationError = 'Please check your input and try again.';
  static const String fileUploadError = 'File upload failed. Please try again.';
  static const String locationError = 'Unable to get your location. Please check location permissions.';
  static const String biometricError = 'Biometric authentication failed. Please try again.';
  static const String cameraError = 'Unable to access camera. Please check camera permissions.';
  static const String storageError = 'Unable to access storage. Please check storage permissions.';
}

// Success Messages
class SuccessMessages {
  static const String loginSuccess = 'Login successful!';
  static const String registrationSuccess = 'Registration successful!';
  static const String applicationSubmitted = 'Application submitted successfully!';
  static const String profileUpdated = 'Profile updated successfully!';
  static const String passwordChanged = 'Password changed successfully!';
  static const String notificationSettingsUpdated = 'Notification settings updated!';
  static const String fileUploadSuccess = 'File uploaded successfully!';
  static const String biometricSetupSuccess = 'Biometric authentication setup successful!';
}

// Loading Messages
class LoadingMessages {
  static const String loading = 'Loading...';
  static const String submitting = 'Submitting...';
  static const String uploading = 'Uploading...';
  static const String processing = 'Processing...';
  static const String authenticating = 'Authenticating...';
  static const String fetchingData = 'Fetching data...';
  static const String savingData = 'Saving data...';
}
