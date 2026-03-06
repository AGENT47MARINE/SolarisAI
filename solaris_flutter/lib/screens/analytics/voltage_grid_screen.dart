import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/providers/device_provider.dart';
import '../../models/device_model.dart';

class VoltageGridScreen extends ConsumerWidget {
  final String deviceId;

  const VoltageGridScreen({super.key, required this.deviceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final voltageAsync = ref.watch(voltageGridProvider(deviceId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('12-Point Inverter Grid'),
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
      body: voltageAsync.when(
        data: (vg) {
          final List<Map<String, dynamic>> measurements = [
            {'label': 'V_R Phase (L-N)', 'value': '${vg.vR} V', 'status': (vg.vR < 210 || vg.vR > 250) ? 'warning' : 'normal'},
            {'label': 'V_Y Phase (L-N)', 'value': '${vg.vY} V', 'status': (vg.vY < 210 || vg.vY > 250) ? 'warning' : 'normal'},
            {'label': 'V_B Phase (L-N)', 'value': '${vg.vB} V', 'status': (vg.vB < 210 || vg.vB > 250) ? 'warning' : 'normal'},
            {'label': 'V_RY (L-L)', 'value': '${vg.vRy} V', 'status': (vg.vRy < 380 || vg.vRy > 420) ? 'warning' : 'normal'},
            {'label': 'V_YB (L-L)', 'value': '${vg.vYb} V', 'status': (vg.vYb < 380 || vg.vYb > 420) ? 'warning' : 'normal'},
            {'label': 'V_BR (L-L)', 'value': '${vg.vBr} V', 'status': (vg.vBr < 380 || vg.vBr > 420) ? 'warning' : 'normal'},
            {'label': 'Freq', 'value': '${vg.freq} Hz', 'status': (vg.freq < 49.5 || vg.freq > 50.5) ? 'warning' : 'normal'},
            {'label': 'PF_R', 'value': vg.pfR.toString(), 'status': vg.pfR < 0.95 ? 'warning' : 'normal'},
            {'label': 'PF_Y', 'value': vg.pfY.toString(), 'status': vg.pfY < 0.95 ? 'warning' : 'normal'},
            {'label': 'PF_B', 'value': vg.pfB.toString(), 'status': vg.pfB < 0.95 ? 'warning' : 'normal'},
            {'label': 'I_R', 'value': '${vg.iR} A', 'status': vg.iR > 150 ? 'warning' : 'normal'},
            {'label': 'I_Y', 'value': '${vg.iY} A', 'status': vg.iY > 150 ? 'warning' : 'normal'},
            {'label': 'I_B', 'value': '${vg.iB} A', 'status': vg.iB > 150 ? 'warning' : 'normal'},
          ];

          return Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Real-time Power Measurements ($deviceId)", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                Expanded(
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 300,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 2.5,
                    ),
                    itemCount: measurements.length,
                    itemBuilder: (context, index) {
                      final m = measurements[index];
                      final isWarning = m['status'] == 'warning';
                      
                      return Container(
                        decoration: BoxDecoration(
                          color: isWarning ? Colors.orange.shade50 : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isWarning ? Colors.orange.shade200 : Colors.black.withOpacity(0.05)),
                        ),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(m['label'], style: TextStyle(color: isWarning ? Colors.orange.shade800 : const Color(0xFF64748B), fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(m['value'], style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: isWarning ? Colors.orange.shade900 : const Color(0xFF0F172A))),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text("Error loading voltage grid data: $err")),
      )
    );
  }
}
