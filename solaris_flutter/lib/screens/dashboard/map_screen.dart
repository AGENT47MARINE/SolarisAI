import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/providers/device_provider.dart';
import 'package:lucide_icons/lucide_icons.dart';

class MapScreen extends ConsumerWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final devicesAsync = ref.watch(devicesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // Slate 100 for map bg
      appBar: AppBar(
        title: const Text('Digital Twin Plant Map', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        scrolledUnderElevation: 0,
      ),
      body: devicesAsync.when(
        data: (devices) {
          if (devices.isEmpty) {
            return const Center(child: Text("No devices available for mapping."));
          }
          return Padding(
            padding: const EdgeInsets.all(24.0),
            child: Stack(
              children: [
                // "Map" Background Pattern
                Positioned.fill(
                  child: GridPaper(
                    color: Colors.blue.withOpacity(0.05),
                    divisions: 1,
                    subdivisions: 1,
                    interval: 100,
                  ),
                ),
                // Nodes
                LayoutBuilder(
                  builder: (context, constraints) {
                     return GridView.builder(
                        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 250,
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          childAspectRatio: 2.5,
                        ),
                        itemCount: devices.length,
                        itemBuilder: (context, index) {
                          final d = devices[index];
                          final isDanger = d.status.toLowerCase() == 'offline' || d.status.toLowerCase() == 'alert' || d.status.toLowerCase() == 'critical';
                          return InkWell(
                            onTap: () => context.go('/devices/${d.id}'),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isDanger ? Colors.red.shade300 : Colors.green.shade300,
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: isDanger ? Colors.red.shade50 : Colors.green.shade50,
                                    child: Icon(
                                      d.category.toLowerCase().contains('inverter') ? LucideIcons.zap : LucideIcons.cpu,
                                      color: isDanger ? Colors.red : Colors.green,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(d.deviceName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                                        Text(d.id, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                     );
                  }
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading map nodes: $err')),
      ),
    );
  }
}
