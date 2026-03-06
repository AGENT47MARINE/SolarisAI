import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/device_model.dart';
import 'api_provider.dart';

final devicesProvider = FutureProvider<List<DeviceSummary>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getDevices();
});

final deviceDetailProvider = FutureProvider.family<DeviceSummary, String>((ref, id) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getDevice(id);
});

final deviceTelemetryProvider = FutureProvider.family<List<TelemetryReading>, String>((ref, id) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getDeviceTelemetry(id);
});

final ctAnalysisProvider = FutureProvider.family<List<CTAnalysisData>, String>((ref, id) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getCTAnalysis(id);
});

final voltageGridProvider = FutureProvider.family<VoltageGridData, String>((ref, id) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getVoltageGrid(id);
});
