import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/providers/device_provider.dart';
import '../../widgets/charts/telemetry_line_chart.dart';
import '../../models/device_model.dart';
import 'package:intl/intl.dart';

class InverterDetailScreen extends ConsumerWidget {
  final String deviceId;

  const InverterDetailScreen({super.key, required this.deviceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deviceAsync = ref.watch(deviceDetailProvider(deviceId));
    final telemetryAsync = ref.watch(deviceTelemetryProvider(deviceId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Device Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/');
            }
          },
        ),
      ),
      body: deviceAsync.when(
        data: (device) => SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              _buildHeader(device),
              const SizedBox(height: 32),
              
              // Telemetry Charts
              telemetryAsync.when(
                data: (telemetry) {
                  if (telemetry.isEmpty) {
                    return const Center(child: Text("No telemetry data yet."));
                  }
                  
                  return LayoutBuilder(
                    builder: (context, constraints) {
                      bool isDesktop = constraints.maxWidth > 800;
                      
                      return Column(
                        children: [
                          if (isDesktop)
                            Row(
                              children: [
                                Expanded(
                                  child: SizedBox(
                                    height: 300,
                                    child: TelemetryLineChart(
                                      telemetry: telemetry,
                                      metricKey: 'active_power',
                                      title: 'Active Power Trend',
                                      unit: 'kW',
                                      color: Colors.blue,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 24),
                                Expanded(
                                  child: SizedBox(
                                    height: 300,
                                    child: TelemetryLineChart(
                                      telemetry: telemetry,
                                      metricKey: 'temperature',
                                      title: 'Device Temperature',
                                      unit: '°C',
                                      color: Colors.orange,
                                    ),
                                  ),
                                ),
                              ],
                            )
                          else
                            Column(
                              children: [
                                SizedBox(
                                  height: 300,
                                  child: TelemetryLineChart(
                                    telemetry: telemetry,
                                    metricKey: 'active_power',
                                    title: 'Active Power Trend',
                                    unit: 'kW',
                                    color: Colors.blue,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  height: 300,
                                  child: TelemetryLineChart(
                                    telemetry: telemetry,
                                    metricKey: 'temperature',
                                    title: 'Device Temperature',
                                    unit: '°C',
                                    color: Colors.orange,
                                  ),
                                ),
                              ],
                            ),
                            
                          const SizedBox(height: 24),
                          
                          // AC Voltages (Combined Phase A, B, C)
                          // For simplicity in the generic TelemetryLineChart, we just plot Voltage AB, 
                          // but a MultiLineChart would be better here for Phases.
                          SizedBox(
                            height: 300,
                            child: TelemetryLineChart(
                              telemetry: telemetry,
                              metricKey: 'voltage_ab',
                              title: 'AC Voltage (Phase A-B)',
                              unit: 'V',
                              color: Colors.purple,
                            ),
                          ),
                        ],
                      );
                    }
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Error: $err')),
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading device details: $err')),
      ),
    );
  }

  Widget _buildHeader(DeviceSummary device) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              device.deviceName,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.category, size: 16, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Text('${device.category} - ${device.manufacturer}', style: const TextStyle(color: Color(0xFF64748B))),
              ],
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: device.status.toLowerCase() == 'active' ? Colors.green.shade50 : Colors.red.shade50,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            device.status.toUpperCase(),
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: device.status.toLowerCase() == 'active' ? Colors.green.shade700 : Colors.red.shade700,
            ),
          ),
        ),
      ],
    );
  }
}
