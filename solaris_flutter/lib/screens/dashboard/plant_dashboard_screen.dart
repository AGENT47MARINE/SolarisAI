import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/providers/plant_provider.dart';
import '../../models/plant_model.dart';
import '../../widgets/charts/production_gauge.dart';
import '../../widgets/charts/energy_flow_diagram.dart';
import '../../widgets/charts/string_heatmap.dart';
import '../../widgets/tables/sensors_grid.dart';
import '../../models/device_model.dart';

class PlantDashboardScreen extends ConsumerWidget {
  final String plantId;

  const PlantDashboardScreen({super.key, required this.plantId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final plantAsync = ref.watch(plantDetailProvider(plantId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Tailind slate-50
      appBar: AppBar(
        title: const Text('Plant Dashboard'),
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
      body: plantAsync.when(
        data: (plant) => _buildDashboardLayout(context, plant),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildDashboardLayout(BuildContext context, PlantDetail plant) {
    return LayoutBuilder(
      builder: (context, constraints) {
        bool isDesktop = constraints.maxWidth > 1024;
        
        return SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                plant.name,
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Color(0xFF64748B)),
                  const SizedBox(width: 4),
                  Text(plant.location, style: const TextStyle(color: Color(0xFF64748B))),
                  const SizedBox(width: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: plant.status.toLowerCase() == 'active' ? Colors.green.shade50 : Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      plant.status.toUpperCase(),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: plant.status.toLowerCase() == 'active' ? Colors.green.shade700 : Colors.red.shade700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Top row: Gauges and Flow Diagram
              if (isDesktop)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 2,
                      child: Row(
                        children: [
                          Expanded(
                            child: ProductionGauge(
                              title: 'Performance Ratio (PR)',
                              value: 78.5, // Mock derived value, typically 70-80%
                              max: 100,
                              unit: '%',
                              color: Colors.blue.shade500,
                            ),
                          ),
                          const SizedBox(width: 24),
                          Expanded(
                            child: ProductionGauge(
                              title: 'Capacity Utilization (CUF)',
                              value: 19.2, // Mock derived value, typically 15-20%
                              max: 30,
                              unit: '%',
                              color: Colors.purple.shade500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 24),
                    Expanded(
                      flex: 3,
                      child: EnergyFlowDiagram(
                        pvPower: plant.todayGen * 0.8, // Mock live kW based on Gen
                        gridPower: (plant.todayGen * 0.8) - 100, // Exporting
                        loadPower: 100, // Local load
                      ),
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    Row(
                      children: [
                         Expanded(
                            child: ProductionGauge(
                              title: 'PR',
                              value: 78.5,
                              max: 100,
                              unit: '%',
                              color: Colors.blue.shade500,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: ProductionGauge(
                              title: 'CUF',
                              value: 19.2,
                              max: 30,
                              unit: '%',
                              color: Colors.purple.shade500,
                            ),
                          ),
                      ]
                    ),
                    const SizedBox(height: 24),
                    EnergyFlowDiagram(
                      pvPower: plant.todayGen * 0.8,
                      gridPower: (plant.todayGen * 0.8) - 100,
                      loadPower: 100,
                    ),
                  ],
                ),
              
              const SizedBox(height: 32),
              
              // Middle row: Heatmap
              StringHeatmapWidget(
                // Mock grid data [5 rows, 20 columns]
                gridData: List.generate(5, (r) => List.generate(20, (c) {
                  // Simulate an anomaly on row 2, col 5
                  if (r == 2 && c >= 4 && c <= 6) return 3.2; // Low string current
                  return 9.8 + (r % 2 == 0 ? 0.3 : 0.0); // Normal string current ~10A
                })),
                maxCurrent: 12.0,
              ),

              const SizedBox(height: 32),

              // Bottom Section: Asset Data Grid
              const Text(
                'Plant Assets & Live Metrics',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 16),
              
              SizedBox(
                height: 400, // Constrain height for grid
                child: SensorsDataGrid(
                  devices: plant.devices,
                  latestTelemetry: const [], // TODO: We would fetch from a `latestTelemetryProvider`
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
