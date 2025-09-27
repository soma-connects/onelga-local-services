# Onelga Local Services Mobile App

Flutter-based mobile application for the Onelga Comprehensive Local Services platform.

## Overview

This mobile app provides citizens with convenient access to local government services in Onelga, including:

- Local identification letters
- Birth certificates
- Health services booking
- Business registrations
- Vehicle registrations
- Complaint submissions
- Education services
- Housing applications

## Requirements

- **Flutter SDK** 3.0.0 or higher
- **Dart SDK** 3.0.0 or higher
- **Android Studio** / **Xcode** for device testing
- **Android API Level** 21+ (Android 5.0+)
- **iOS** 12.0+

## Getting Started

### 1. Install Flutter

Follow the official Flutter installation guide:
- [Flutter Installation Guide](https://docs.flutter.dev/get-started/install)

### 2. Verify Installation

```bash
flutter doctor
```

### 3. Install Dependencies

```bash
cd mobile
flutter pub get
```

### 4. Run Code Generation

```bash
flutter packages pub run build_runner build
```

### 5. Run the App

```bash
# Debug mode
flutter run

# Release mode
flutter run --release

# Specific device
flutter run -d device_id
```

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── models/                      # Data models
│   ├── user.dart
│   ├── service.dart
│   └── application.dart
├── providers/                   # State management
│   ├── auth_provider.dart
│   └── services_provider.dart
├── screens/                     # UI screens
│   ├── splash_screen.dart
│   ├── home_screen.dart
│   ├── login_screen.dart
│   └── services/
├── widgets/                     # Reusable widgets
│   ├── common/
│   └── forms/
├── services/                    # API and business logic
│   ├── api_service.dart
│   └── storage_service.dart
├── utils/                       # Utilities and constants
│   ├── theme.dart
│   ├── constants.dart
│   └── validators.dart
└── l10n/                       # Internationalization
    ├── app_en.arb
    └── app_ig.arb
```

## Features

### Core Features

- [x] User authentication (login/register)
- [x] Dashboard with service overview
- [x] Service applications
- [x] Document management
- [x] Push notifications
- [ ] Offline mode support
- [ ] Biometric authentication
- [ ] Multi-language support

### Services Integration

- [ ] Identification letters
- [ ] Birth certificates  
- [ ] Health appointments
- [ ] Business registrations
- [ ] Vehicle registrations
- [ ] Complaint system
- [ ] Education applications
- [ ] Housing services

## Development

### Code Generation

This project uses code generation for:
- JSON serialization
- API clients (Retrofit)
- Hive type adapters

Run generation:
```bash
flutter packages pub run build_runner build --delete-conflicting-outputs
```

### Testing

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run integration tests
flutter drive --target=test_driver/app.dart
```

### Linting

```bash
# Analyze code
flutter analyze

# Fix linting issues
dart fix --apply
```

## Build & Release

### Android

```bash
# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release
```

### iOS

```bash
# Build iOS app
flutter build ios --release
```

### Configuration Files

- **Android**: `android/app/build.gradle`
- **iOS**: `ios/Runner.xcworkspace`

## Environment Configuration

Create environment-specific configuration files:

### `lib/config/env_dev.dart`
```dart
class Environment {
  static const String apiUrl = 'http://localhost:5000/api';
  static const String environment = 'development';
}
```

### `lib/config/env_prod.dart`
```dart
class Environment {
  static const String apiUrl = 'https://api.onelga-services.gov.ng/api';
  static const String environment = 'production';
}
```

## API Integration

The app communicates with the backend API at:
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.onelga-services.gov.ng/api`

### Authentication

JWT tokens are used for authentication and stored securely using:
- **Android**: EncryptedSharedPreferences
- **iOS**: Keychain Services

## Permissions

### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### iOS (`ios/Runner/Info.plist`)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to find nearby health centers</string>
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to capture documents</string>
```

## Troubleshooting

### Common Issues

1. **Flutter doctor issues**
   ```bash
   flutter doctor --android-licenses
   ```

2. **Build issues**
   ```bash
   flutter clean
   flutter pub get
   ```

3. **iOS build issues**
   ```bash
   cd ios
   rm Podfile.lock
   pod install
   ```

## Contributing

1. Follow the Flutter style guide
2. Write tests for new features
3. Update documentation
4. Use conventional commit messages

## Deployment

### Google Play Store
1. Build app bundle: `flutter build appbundle --release`
2. Upload to Play Console
3. Fill out store listing
4. Submit for review

### Apple App Store
1. Build iOS app: `flutter build ios --release`
2. Archive in Xcode
3. Upload to App Store Connect
4. Submit for review

## Support

For mobile app support:
- **Technical Issues**: mobile-support@onelga-services.gov.ng
- **User Guide**: Available in the app settings

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
