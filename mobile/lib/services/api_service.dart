import 'dart:io';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../utils/constants.dart';
import 'storage_service.dart';

part 'api_service.g.dart';

// Data Models
class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phoneNumber;
  final String? address;
  final String? profilePicture;
  final String role;
  final bool isVerified;
  final DateTime createdAt;
  final DateTime? updatedAt;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.phoneNumber,
    this.address,
    this.profilePicture,
    required this.role,
    required this.isVerified,
    required this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      phoneNumber: json['phoneNumber'],
      address: json['address'],
      profilePicture: json['profilePicture'],
      role: json['role'],
      isVerified: json['isVerified'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phoneNumber': phoneNumber,
      'address': address,
      'profilePicture': profilePicture,
      'role': role,
      'isVerified': isVerified,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

class Service {
  final String id;
  final String name;
  final String description;
  final String category;
  final List<String> requirements;
  final String processingTime;
  final double cost;
  final String status;
  final DateTime createdAt;

  Service({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.requirements,
    required this.processingTime,
    required this.cost,
    required this.status,
    required this.createdAt,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      category: json['category'],
      requirements: List<String>.from(json['requirements']),
      processingTime: json['processingTime'],
      cost: json['cost'].toDouble(),
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class ServiceApplication {
  final String id;
  final String serviceId;
  final String userId;
  final Map<String, dynamic> formData;
  final String status;
  final String? referenceNumber;
  final List<String> documents;
  final DateTime submittedAt;
  final DateTime? updatedAt;

  ServiceApplication({
    required this.id,
    required this.serviceId,
    required this.userId,
    required this.formData,
    required this.status,
    this.referenceNumber,
    required this.documents,
    required this.submittedAt,
    this.updatedAt,
  });

  factory ServiceApplication.fromJson(Map<String, dynamic> json) {
    return ServiceApplication(
      id: json['id'],
      serviceId: json['serviceId'],
      userId: json['userId'],
      formData: json['formData'],
      status: json['status'],
      referenceNumber: json['referenceNumber'],
      documents: List<String>.from(json['documents']),
      submittedAt: DateTime.parse(json['submittedAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }
}

// API Response Models
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.statusCode,
    this.errors,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? fromJsonT) {
    return ApiResponse(
      success: json['success'],
      data: fromJsonT != null && json['data'] != null ? fromJsonT(json['data']) : json['data'],
      message: json['message'],
      statusCode: json['statusCode'],
      errors: json['errors'],
    );
  }
}

class PaginatedResponse<T> {
  final List<T> items;
  final int total;
  final int page;
  final int limit;
  final bool hasMore;

  PaginatedResponse({
    required this.items,
    required this.total,
    required this.page,
    required this.limit,
    required this.hasMore,
  });

  factory PaginatedResponse.fromJson(Map<String, dynamic> json, T Function(dynamic) fromJsonT) {
    return PaginatedResponse(
      items: (json['items'] as List).map((item) => fromJsonT(item)).toList(),
      total: json['total'],
      page: json['page'],
      limit: json['limit'],
      hasMore: json['hasMore'],
    );
  }
}

// Custom Exceptions
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiException(this.message, [this.statusCode, this.errors]);

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

class NetworkException implements Exception {
  final String message;
  NetworkException(this.message);

  @override
  String toString() => 'NetworkException: $message';
}

// Retrofit API Interface
@RestApi()
abstract class ApiClient {
  factory ApiClient(Dio dio, {String baseUrl}) = _ApiClient;

  // Authentication endpoints
  @POST('/auth/login')
  Future<ApiResponse<Map<String, dynamic>>> login(@Body() Map<String, dynamic> credentials);

  @POST('/auth/register')
  Future<ApiResponse<User>> register(@Body() Map<String, dynamic> userData);

  @POST('/auth/refresh')
  Future<ApiResponse<Map<String, dynamic>>> refreshToken(@Body() Map<String, String> refreshData);

  @POST('/auth/logout')
  Future<ApiResponse<void>> logout();

  @POST('/auth/forgot-password')
  Future<ApiResponse<void>> forgotPassword(@Body() Map<String, String> emailData);

  @POST('/auth/reset-password')
  Future<ApiResponse<void>> resetPassword(@Body() Map<String, dynamic> resetData);

  // User endpoints
  @GET('/user/profile')
  Future<ApiResponse<User>> getProfile();

  @PUT('/user/profile')
  Future<ApiResponse<User>> updateProfile(@Body() Map<String, dynamic> userData);

  @POST('/user/change-password')
  Future<ApiResponse<void>> changePassword(@Body() Map<String, String> passwordData);

  @POST('/user/upload-avatar')
  @MultiPart()
  Future<ApiResponse<String>> uploadAvatar(@Part() File avatar);

  // Services endpoints
  @GET('/services')
  Future<ApiResponse<PaginatedResponse<Service>>> getServices(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('category') String? category,
    @Query('search') String? search,
  );

  @GET('/services/{id}')
  Future<ApiResponse<Service>> getService(@Path('id') String id);

  @GET('/services/categories')
  Future<ApiResponse<List<String>>> getServiceCategories();

  // Applications endpoints
  @GET('/applications')
  Future<ApiResponse<PaginatedResponse<ServiceApplication>>> getApplications(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('status') String? status,
  );

  @GET('/applications/{id}')
  Future<ApiResponse<ServiceApplication>> getApplication(@Path('id') String id);

  @POST('/applications')
  Future<ApiResponse<ServiceApplication>> submitApplication(@Body() Map<String, dynamic> applicationData);

  @PUT('/applications/{id}')
  Future<ApiResponse<ServiceApplication>> updateApplication(
    @Path('id') String id,
    @Body() Map<String, dynamic> applicationData,
  );

  @DELETE('/applications/{id}')
  Future<ApiResponse<void>> deleteApplication(@Path('id') String id);

  // Document upload
  @POST('/applications/{id}/documents')
  @MultiPart()
  Future<ApiResponse<String>> uploadDocument(
    @Path('id') String applicationId,
    @Part() File document,
    @Part() String documentType,
  );

  // Payments endpoints
  @POST('/payments/initialize')
  Future<ApiResponse<Map<String, dynamic>>> initializePayment(@Body() Map<String, dynamic> paymentData);

  @POST('/payments/verify')
  Future<ApiResponse<Map<String, dynamic>>> verifyPayment(@Body() Map<String, String> verificationData);

  @GET('/payments/history')
  Future<ApiResponse<PaginatedResponse<Map<String, dynamic>>>> getPaymentHistory(
    @Query('page') int page,
    @Query('limit') int limit,
  );

  // Notifications endpoints
  @GET('/notifications')
  Future<ApiResponse<PaginatedResponse<Map<String, dynamic>>>> getNotifications(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('read') bool? read,
  );

  @PUT('/notifications/{id}/read')
  Future<ApiResponse<void>> markNotificationAsRead(@Path('id') String id);

  @PUT('/notifications/read-all')
  Future<ApiResponse<void>> markAllNotificationsAsRead();
}

// Main API Service
class ApiService {
  static late Dio _dio;
  static late ApiClient _apiClient;
  static const Duration _cacheTimeout = Duration(minutes: 5);

  static void init() {
    _dio = Dio();
    _setupDio();
    _apiClient = ApiClient(_dio, baseUrl: AppConstants.baseUrl);
  }

  static void _setupDio() {
    _dio.options = BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: Duration(milliseconds: AppConstants.connectTimeout),
      receiveTimeout: Duration(milliseconds: AppConstants.receiveTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    // Request interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token if available
          final token = StorageService.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          // Add request timestamp for logging
          options.extra['request_time'] = DateTime.now().millisecondsSinceEpoch;
          
          handler.next(options);
        },
        onResponse: (response, handler) {
          // Log response time
          final requestTime = response.requestOptions.extra['request_time'] as int?;
          if (requestTime != null) {
            final responseTime = DateTime.now().millisecondsSinceEpoch - requestTime;
            print('API Response time: ${responseTime}ms for ${response.requestOptions.path}');
          }

          handler.next(response);
        },
        onError: (error, handler) async {
          // Handle token refresh
          if (error.response?.statusCode == 401) {
            try {
              await _refreshToken();
              // Retry the original request
              final clonedRequest = await _dio.request(
                error.requestOptions.path,
                options: Options(
                  method: error.requestOptions.method,
                  headers: error.requestOptions.headers,
                ),
                data: error.requestOptions.data,
                queryParameters: error.requestOptions.queryParameters,
              );
              handler.resolve(clonedRequest);
              return;
            } catch (e) {
              // Refresh failed, redirect to login
              await StorageService.clearTokens();
              await StorageService.clearUserData();
            }
          }

          handler.next(error);
        },
      ),
    );
  }

  static Future<void> _refreshToken() async {
    final refreshToken = StorageService.getRefreshToken();
    if (refreshToken == null) throw ApiException('No refresh token available');

    try {
      final response = await _apiClient.refreshToken({'refreshToken': refreshToken});
      if (response.success && response.data != null) {
        await StorageService.saveAccessToken(response.data!['accessToken']);
        await StorageService.saveRefreshToken(response.data!['refreshToken']);
      } else {
        throw ApiException('Token refresh failed');
      }
    } catch (e) {
      throw ApiException('Token refresh error: $e');
    }
  }

  // Authentication methods
  static Future<User> login(String email, String password) async {
    try {
      final response = await _apiClient.login({
        'email': email,
        'password': password,
      });

      if (response.success && response.data != null) {
        await StorageService.saveAccessToken(response.data!['accessToken']);
        await StorageService.saveRefreshToken(response.data!['refreshToken']);
        
        final user = User.fromJson(response.data!['user']);
        await StorageService.saveUserData(user.toJson());
        
        return user;
      } else {
        throw ApiException(response.message ?? 'Login failed');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<User> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiClient.register(userData);
      
      if (response.success && response.data != null) {
        return response.data!;
      } else {
        throw ApiException(response.message ?? 'Registration failed');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<void> logout() async {
    try {
      await _apiClient.logout();
    } catch (e) {
      // Continue with logout even if API call fails
    } finally {
      await StorageService.clearTokens();
      await StorageService.clearUserData();
    }
  }

  // User methods
  static Future<User> getProfile() async {
    try {
      // Check cache first
      final cachedUser = StorageService.getUserData();
      if (cachedUser != null) {
        return User.fromJson(cachedUser);
      }

      final response = await _apiClient.getProfile();
      if (response.success && response.data != null) {
        await StorageService.saveUserData(response.data!.toJson());
        return response.data!;
      } else {
        throw ApiException(response.message ?? 'Failed to get profile');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<User> updateProfile(Map<String, dynamic> userData) async {
    try {
      final response = await _apiClient.updateProfile(userData);
      if (response.success && response.data != null) {
        await StorageService.saveUserData(response.data!.toJson());
        return response.data!;
      } else {
        throw ApiException(response.message ?? 'Failed to update profile');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Services methods
  static Future<PaginatedResponse<Service>> getServices({
    int page = 1,
    int limit = AppConstants.defaultPageSize,
    String? category,
    String? search,
  }) async {
    try {
      // Check cache for first page
      if (page == 1 && category == null && search == null) {
        final cached = StorageService.getFromCache<Map<String, dynamic>>('services_page_1');
        if (cached != null) {
          return PaginatedResponse.fromJson(cached, (json) => Service.fromJson(json));
        }
      }

      final response = await _apiClient.getServices(page, limit, category, search);
      if (response.success && response.data != null) {
        // Cache first page
        if (page == 1 && category == null && search == null) {
          await StorageService.saveToCache(
            'services_page_1',
            response.data!.toJson((service) => (service as Service).toJson()),
            ttl: _cacheTimeout,
          );
        }
        return response.data!;
      } else {
        throw ApiException(response.message ?? 'Failed to get services');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<Service> getService(String id) async {
    try {
      final response = await _apiClient.getService(id);
      if (response.success && response.data != null) {
        return response.data!;
      } else {
        throw ApiException(response.message ?? 'Failed to get service');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Applications methods
  static Future<PaginatedResponse<ServiceApplication>> getApplications({
    int page = 1,
    int limit = AppConstants.defaultPageSize,
    String? status,
  }) async {
    try {
      final response = await _apiClient.getApplications(page, limit, status);
      if (response.success && response.data != null) {
        return response.data!;
      } else {
        throw ApiException(response.message ?? 'Failed to get applications');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<ServiceApplication> submitApplication(Map<String, dynamic> applicationData) async {
    try {
      final response = await _apiClient.submitApplication(applicationData);
      if (response.success && response.data != null) {
        return response.data!;
      } else {
        throw ApiException(response.message ?? 'Failed to submit application');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  // File upload methods
  static Future<String> uploadDocument(String applicationId, File document, String documentType) async {
    try {
      final response = await _apiClient.uploadDocument(applicationId, document, documentType);
      if (response.success && response.data != null) {
        return response.data!;
      } else {
        throw ApiException(response.message ?? 'Failed to upload document');
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Utility methods
  static Exception _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return NetworkException('Connection timeout. Please check your internet connection.');
        
        case DioExceptionType.connectionError:
          return NetworkException('Network connection error. Please check your internet connection.');
        
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final message = error.response?.data?['message'] ?? 'Server error occurred';
          return ApiException(message, statusCode);
        
        case DioExceptionType.cancel:
          return ApiException('Request was cancelled');
        
        default:
          return ApiException('Unknown error occurred');
      }
    }
    
    if (error is ApiException) {
      return error;
    }
    
    return ApiException('Unexpected error: $error');
  }

  // Health check
  static Future<bool> healthCheck() async {
    try {
      final response = await _dio.get('/health');
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // Clear all caches
  static Future<void> clearCache() async {
    await StorageService.clearCache();
  }
}

// Extension methods
extension PaginatedResponseExtension<T> on PaginatedResponse<T> {
  Map<String, dynamic> toJson(Map<String, dynamic> Function(T) toJsonT) {
    return {
      'items': items.map((item) => toJsonT(item)).toList(),
      'total': total,
      'page': page,
      'limit': limit,
      'hasMore': hasMore,
    };
  }
}

extension ServiceExtension on Service {
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'requirements': requirements,
      'processingTime': processingTime,
      'cost': cost,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
