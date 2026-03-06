import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../models/dashboard_metrics.dart';
import '../models/plant_model.dart';
import '../models/device_model.dart';
import '../models/alert_model.dart';
import '../models/voice_model.dart';

class ApiService {
  final ApiClient _apiClient = ApiClient();
  Dio get _dio => _apiClient.dio;

  // --- Dashboard ---
  Future<DashboardMetrics> getDashboardMetrics() async {
    final response = await _dio.get('/api/dashboard/metrics');
    return DashboardMetrics.fromJson(response.data);
  }

  // --- Plants ---
  Future<List<PlantSummary>> getPlants() async {
    final response = await _dio.get('/api/plants');
    final List<dynamic> data = response.data;
    return data.map((json) => PlantSummary.fromJson(json)).toList();
  }

  Future<PlantDetail> getPlant(String id) async {
    final response = await _dio.get('/api/plants/$id');
    return PlantDetail.fromJson(response.data);
  }

  // --- Devices ---
  Future<List<DeviceSummary>> getDevices() async {
    final response = await _dio.get('/api/devices');
    final List<dynamic> data = response.data;
    return data.map((json) => DeviceSummary.fromJson(json)).toList();
  }

  Future<DeviceSummary> getDevice(String id) async {
    final response = await _dio.get('/api/devices/$id');
    return DeviceSummary.fromJson(response.data);
  }

  Future<List<TelemetryReading>> getDeviceTelemetry(String id) async {
    final response = await _dio.get('/api/devices/$id/telemetry');
    final List<dynamic> data = response.data;
    return data.map((json) => TelemetryReading.fromJson(json)).toList();
  }

  Future<List<CTAnalysisData>> getCTAnalysis(String id) async {
    final response = await _dio.get('/api/devices/$id/ct-analysis');
    final List<dynamic> data = response.data;
    return data.map((json) => CTAnalysisData.fromJson(json)).toList();
  }

  Future<VoltageGridData> getVoltageGrid(String id) async {
    final response = await _dio.get('/api/devices/$id/voltage-grid');
    return VoltageGridData.fromJson(response.data);
  }

  // --- Alerts ---
  Future<List<AlertOut>> getAlerts() async {
    final response = await _dio.get('/api/alerts');
    final List<dynamic> data = response.data;
    return data.map((json) => AlertOut.fromJson(json)).toList();
  }

  Future<void> acknowledgeAlert(int id) async {
    await _dio.post('/api/alerts/$id/acknowledge');
  }

  // --- AI Diagnosis ---
  Future<DiagnoseResponse> diagnoseDevice(String deviceId, {int? alertId}) async {
    final response = await _dio.post(
      '/api/ai/diagnose',
      data: {
        'device_id': deviceId,
        if (alertId != null) 'alert_id': alertId,
      },
    );
    return DiagnoseResponse.fromJson(response.data);
  }

  // --- Voice Navigation ---
  Future<VoiceCommandResponse> sendVoiceCommand({
    String? audioB64,
    String? textInput,
    String? sessionId,
    required String currentView,
  }) async {
    final response = await _dio.post(
      '/api/voice/command',
      data: {
        if (audioB64 != null) 'audio_b64': audioB64,
        if (textInput != null) 'text_input': textInput,
        if (sessionId != null) 'session_id': sessionId,
        'current_view': currentView,
      },
    );
    return VoiceCommandResponse.fromJson(response.data);
  }
}
