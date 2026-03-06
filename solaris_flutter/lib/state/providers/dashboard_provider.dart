import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/dashboard_metrics.dart';
import 'api_provider.dart';

final dashboardMetricsProvider = FutureProvider<DashboardMetrics>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getDashboardMetrics();
});
