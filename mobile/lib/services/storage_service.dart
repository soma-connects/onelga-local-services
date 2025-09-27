import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class StorageService {
  static late SharedPreferences _prefs;
  static late Box _secureBox;
  static late Box _cacheBox;
  static late Box _settingsBox;

  // Initialize storage services
  static Future<void> init() async {
    try {
      // Initialize SharedPreferences
      _prefs = await SharedPreferences.getInstance();

      // Initialize Hive boxes
      _secureBox = await Hive.openBox('secure');
      _cacheBox = await Hive.openBox('cache');
      _settingsBox = await Hive.openBox('settings');
    } catch (e) {
      throw StorageException('Failed to initialize storage: $e');
    }
  }

  // Token Management
  static Future<void> saveAccessToken(String token) async {
    await _secureBox.put(AppConstants.accessTokenKey, token);
  }

  static String? getAccessToken() {
    return _secureBox.get(AppConstants.accessTokenKey);
  }

  static Future<void> saveRefreshToken(String token) async {
    await _secureBox.put(AppConstants.refreshTokenKey, token);
  }

  static String? getRefreshToken() {
    return _secureBox.get(AppConstants.refreshTokenKey);
  }

  static Future<void> clearTokens() async {
    await _secureBox.delete(AppConstants.accessTokenKey);
    await _secureBox.delete(AppConstants.refreshTokenKey);
  }

  // User Data Management
  static Future<void> saveUserData(Map<String, dynamic> userData) async {
    await _secureBox.put(AppConstants.userDataKey, jsonEncode(userData));
  }

  static Map<String, dynamic>? getUserData() {
    final userDataString = _secureBox.get(AppConstants.userDataKey);
    if (userDataString != null) {
      return jsonDecode(userDataString);
    }
    return null;
  }

  static Future<void> clearUserData() async {
    await _secureBox.delete(AppConstants.userDataKey);
  }

  // Settings Management
  static Future<void> saveSetting(String key, dynamic value) async {
    await _settingsBox.put(key, value);
  }

  static T? getSetting<T>(String key, {T? defaultValue}) {
    return _settingsBox.get(key, defaultValue: defaultValue);
  }

  static Future<void> saveSettings(Map<String, dynamic> settings) async {
    for (final entry in settings.entries) {
      await _settingsBox.put(entry.key, entry.value);
    }
  }

  static Map<String, dynamic> getAllSettings() {
    return Map<String, dynamic>.from(_settingsBox.toMap());
  }

  static Future<void> clearSettings() async {
    await _settingsBox.clear();
  }

  // Cache Management
  static Future<void> saveToCache(String key, dynamic data, {Duration? ttl}) async {
    final cacheData = {
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'ttl': ttl?.inMilliseconds,
    };
    await _cacheBox.put(key, jsonEncode(cacheData));
  }

  static T? getFromCache<T>(String key) {
    final cacheString = _cacheBox.get(key);
    if (cacheString != null) {
      try {
        final cacheData = jsonDecode(cacheString);
        final timestamp = cacheData['timestamp'] as int;
        final ttl = cacheData['ttl'] as int?;
        
        // Check if cache has expired
        if (ttl != null) {
          final expirationTime = DateTime.fromMillisecondsSinceEpoch(timestamp + ttl);
          if (DateTime.now().isAfter(expirationTime)) {
            // Cache expired, remove it
            _cacheBox.delete(key);
            return null;
          }
        }
        
        return cacheData['data'] as T;
      } catch (e) {
        // Invalid cache data, remove it
        _cacheBox.delete(key);
        return null;
      }
    }
    return null;
  }

  static Future<void> clearCache() async {
    await _cacheBox.clear();
  }

  static Future<void> removeFromCache(String key) async {
    await _cacheBox.delete(key);
  }

  // Application History
  static Future<void> saveServiceHistory(List<Map<String, dynamic>> history) async {
    await _cacheBox.put(AppConstants.serviceHistoryKey, jsonEncode(history));
  }

  static List<Map<String, dynamic>> getServiceHistory() {
    final historyString = _cacheBox.get(AppConstants.serviceHistoryKey);
    if (historyString != null) {
      try {
        final historyList = jsonDecode(historyString) as List;
        return historyList.map((e) => Map<String, dynamic>.from(e)).toList();
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  static Future<void> addToServiceHistory(Map<String, dynamic> service) async {
    final history = getServiceHistory();
    
    // Remove duplicate if exists
    history.removeWhere((item) => item['id'] == service['id']);
    
    // Add to beginning of list
    history.insert(0, {
      ...service,
      'accessedAt': DateTime.now().toIso8601String(),
    });
    
    // Keep only last 50 items
    if (history.length > 50) {
      history.removeRange(50, history.length);
    }
    
    await saveServiceHistory(history);
  }

  // Notifications Management
  static Future<void> saveNotifications(List<Map<String, dynamic>> notifications) async {
    await _cacheBox.put(AppConstants.notificationsKey, jsonEncode(notifications));
  }

  static List<Map<String, dynamic>> getNotifications() {
    final notificationsString = _cacheBox.get(AppConstants.notificationsKey);
    if (notificationsString != null) {
      try {
        final notificationsList = jsonDecode(notificationsString) as List;
        return notificationsList.map((e) => Map<String, dynamic>.from(e)).toList();
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  static Future<void> addNotification(Map<String, dynamic> notification) async {
    final notifications = getNotifications();
    notifications.insert(0, {
      ...notification,
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'createdAt': DateTime.now().toIso8601String(),
      'isRead': false,
    });
    
    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.removeRange(100, notifications.length);
    }
    
    await saveNotifications(notifications);
  }

  static Future<void> markNotificationAsRead(String notificationId) async {
    final notifications = getNotifications();
    final index = notifications.indexWhere((n) => n['id'] == notificationId);
    if (index != -1) {
      notifications[index]['isRead'] = true;
      await saveNotifications(notifications);
    }
  }

  static Future<void> clearNotifications() async {
    await _cacheBox.delete(AppConstants.notificationsKey);
  }

  // Biometric Settings
  static Future<void> setBiometricEnabled(bool enabled) async {
    await _settingsBox.put('biometric_enabled', enabled);
  }

  static bool getBiometricEnabled() {
    return _settingsBox.get('biometric_enabled', defaultValue: false);
  }

  // App Preferences
  static Future<void> setLanguage(String languageCode) async {
    await _settingsBox.put('language', languageCode);
  }

  static String getLanguage() {
    return _settingsBox.get('language', defaultValue: 'en');
  }

  static Future<void> setThemeMode(String mode) async {
    await _settingsBox.put('theme_mode', mode);
  }

  static String getThemeMode() {
    return _settingsBox.get('theme_mode', defaultValue: 'system');
  }

  static Future<void> setNotificationsEnabled(bool enabled) async {
    await _settingsBox.put('notifications_enabled', enabled);
  }

  static bool getNotificationsEnabled() {
    return _settingsBox.get('notifications_enabled', defaultValue: true);
  }

  // First Time Setup
  static Future<void> setFirstTimeSetupComplete() async {
    await _settingsBox.put('first_time_setup_complete', true);
  }

  static bool isFirstTimeSetupComplete() {
    return _settingsBox.get('first_time_setup_complete', defaultValue: false);
  }

  // Onboarding
  static Future<void> setOnboardingComplete() async {
    await _settingsBox.put('onboarding_complete', true);
  }

  static bool isOnboardingComplete() {
    return _settingsBox.get('onboarding_complete', defaultValue: false);
  }

  // Location Permissions
  static Future<void> setLocationPermissionRequested() async {
    await _settingsBox.put('location_permission_requested', true);
  }

  static bool isLocationPermissionRequested() {
    return _settingsBox.get('location_permission_requested', defaultValue: false);
  }

  // Offline Data
  static Future<void> saveOfflineData(String key, Map<String, dynamic> data) async {
    await _cacheBox.put('offline_$key', jsonEncode({
      'data': data,
      'savedAt': DateTime.now().toIso8601String(),
    }));
  }

  static Map<String, dynamic>? getOfflineData(String key) {
    final offlineDataString = _cacheBox.get('offline_$key');
    if (offlineDataString != null) {
      try {
        final offlineData = jsonDecode(offlineDataString);
        return Map<String, dynamic>.from(offlineData['data']);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  static Future<void> clearOfflineData() async {
    final keys = _cacheBox.keys.where((key) => key.toString().startsWith('offline_'));
    for (final key in keys) {
      await _cacheBox.delete(key);
    }
  }

  // Generic Storage Operations
  static Future<void> put(String key, dynamic value) async {
    await _cacheBox.put(key, value);
  }

  static T? get<T>(String key, {T? defaultValue}) {
    return _cacheBox.get(key, defaultValue: defaultValue);
  }

  static Future<void> remove(String key) async {
    await _cacheBox.delete(key);
  }

  static List<String> getKeys() {
    return _cacheBox.keys.map((e) => e.toString()).toList();
  }

  // Clear All Data
  static Future<void> clearAllData() async {
    await _secureBox.clear();
    await _cacheBox.clear();
    await _settingsBox.clear();
    await _prefs.clear();
  }

  // Storage Info
  static int getCacheSize() {
    return _cacheBox.length;
  }

  static int getSettingsCount() {
    return _settingsBox.length;
  }

  static int getSecureItemsCount() {
    return _secureBox.length;
  }

  // Export/Import Settings (for backup)
  static Map<String, dynamic> exportSettings() {
    return {
      'settings': getAllSettings(),
      'exportedAt': DateTime.now().toIso8601String(),
      'version': AppConstants.appVersion,
    };
  }

  static Future<void> importSettings(Map<String, dynamic> settingsData) async {
    if (settingsData.containsKey('settings')) {
      final settings = settingsData['settings'] as Map<String, dynamic>;
      await saveSettings(settings);
    }
  }
}

// Custom exception for storage operations
class StorageException implements Exception {
  final String message;
  StorageException(this.message);

  @override
  String toString() => 'StorageException: $message';
}
