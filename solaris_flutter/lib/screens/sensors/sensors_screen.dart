import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/providers/device_provider.dart';
import '../../models/device_model.dart';
import '../../widgets/tables/sensors_grid.dart';

class SensorsScreen extends ConsumerWidget {
  const SensorsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final devicesAsync = ref.watch(devicesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Global Sensor Management'),
      ),
      body: devicesAsync.when(
        data: (devices) {
          final allDevices = devices;
          
          if (allDevices.isEmpty) {
            return const Center(child: Text("No devices found in the system."));
          }

          return DefaultTabController(
            length: 4,
            child: Column(
              children: [
                const TabBar(
                  labelColor: Color(0xFF2196F3),
                  unselectedLabelColor: Color(0xFF64748B),
                  indicatorColor: Color(0xFF2196F3),
                  tabs: [
                    Tab(text: 'All Assets'),
                    Tab(text: 'Inverters'),
                    Tab(text: 'MFM Meters'),
                    Tab(text: 'Weather Stations'),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    children: [
                      _buildAssetGrid(allDevices),
                      _buildAssetGrid(allDevices.where((d) => d.category.toLowerCase().contains('inverter')).toList()),
                      _buildAssetGrid(allDevices.where((d) => d.category.toLowerCase().contains('mfm')).toList()),
                      _buildAssetGrid(allDevices.where((d) => d.category.toLowerCase().contains('wms') || d.category.toLowerCase().contains('weather') || d.category.toLowerCase().contains('slms')).toList()),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildAssetGrid(List<dynamic> devices) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: SensorsDataGrid(
        // Casting generic list to assumed DeviceSummary for the grid
        devices: devices.cast(),
        latestTelemetry: const [], // Placeholder for live telemetry stream
      ),
    );
  }
}
