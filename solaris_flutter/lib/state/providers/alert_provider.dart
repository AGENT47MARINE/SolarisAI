import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/alert_model.dart';
import 'api_provider.dart';

final alertsProvider = FutureProvider<List<AlertOut>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getAlerts();
});

final diagnosisProvider = FutureProvider.family<DiagnoseResponse, Map<String, dynamic>>((ref, params) async {
  final apiService = ref.watch(apiServiceProvider);
  final String deviceId = params['device_id'];
  final int? alertId = params['alert_id'];
  return apiService.diagnoseDevice(deviceId, alertId: alertId);
});
