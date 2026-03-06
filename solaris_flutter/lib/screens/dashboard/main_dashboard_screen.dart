import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/providers/dashboard_provider.dart';
import '../../state/providers/plant_provider.dart';
import '../../models/dashboard_metrics.dart';
import '../../models/plant_model.dart';
import '../../widgets/cards/net_zero_card.dart';
import '../../widgets/cards/plant_card.dart';

class MainDashboardScreen extends ConsumerWidget {
  const MainDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metricsAsync = ref.watch(dashboardMetricsProvider);
    final plantsAsync = ref.watch(plantsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('SolarisAI Global Dashboard'),
      ),
      body: metricsAsync.when(
        data: (metrics) => SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Welcome back, Admin', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
              const SizedBox(height: 32),
              
              const Text('Eco Footprint (Net Zero Tracker)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
              const SizedBox(height: 16),
              _buildEcoGrid(context, metrics),
              
              const SizedBox(height: 32),
              const Text('Monitored Plants', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
              const SizedBox(height: 16),
              
              plantsAsync.when(
                data: (plants) => _buildPlantsGrid(context, plants),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Error loading plants: $err')),
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error tracking metrics: $err')),
      ),
    );
  }

  Widget _buildEcoGrid(BuildContext context, DashboardMetrics metrics) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = constraints.maxWidth > 1024 ? 4 : (constraints.maxWidth > 600 ? 2 : 1);
        return GridView.count(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 2.5,
          children: [
            NetZeroCard(
              title: 'CO₂ Reduced',
              value: '${metrics.co2ReducedTons.toStringAsFixed(1)} T',
              subtitle: 'Since inception',
              icon: Icons.cloud_off,
              iconColor: Colors.blue.shade600,
              bgColor: Colors.blue.shade50,
            ),
            NetZeroCard(
              title: 'Equivalent Trees',
              value: '${metrics.treesPlanted}',
              subtitle: 'Planted',
              icon: Icons.park,
              iconColor: Colors.green.shade600,
              bgColor: Colors.green.shade50,
            ),
            NetZeroCard(
              title: 'Coal Saved',
              value: '${metrics.coalSavedTons.toStringAsFixed(1)} T',
              subtitle: 'Standard Coal Equivalent',
              icon: Icons.local_fire_department,
              iconColor: Colors.orange.shade600,
              bgColor: Colors.orange.shade50,
            ),
             NetZeroCard(
              title: 'Total Active Gen',
              value: '${metrics.todayProductionKwh.toStringAsFixed(0)} kWh',
              subtitle: 'Today across all sites',
              icon: Icons.solar_power,
              iconColor: Colors.purple.shade600,
              bgColor: Colors.purple.shade50,
            ),
          ],
        );
      }
    );
  }

  Widget _buildPlantsGrid(BuildContext context, List<PlantSummary> plants) {
    return LayoutBuilder(
        builder: (context, constraints) {
          int crossAxisCount = constraints.maxWidth > 1024 ? 3 : (constraints.maxWidth > 600 ? 2 : 1);
          return GridView.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.8,
            ),
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: plants.length,
            itemBuilder: (context, index) {
               return PlantCard(plant: plants[index]);
            },
          );
        }
    );
  }
}
