import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/providers/device_provider.dart';
import '../../models/device_model.dart';
import 'package:go_router/go_router.dart';

class CTAnalysisScreen extends ConsumerWidget {
  final String deviceId;

  const CTAnalysisScreen({super.key, required this.deviceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ctAsync = ref.watch(ctAnalysisProvider(deviceId));

    return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          title: const Text('CT Data Analysis'),
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
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: ctAsync.when(
            data: (ctData) {
              if (ctData.isEmpty) {
                return const Center(child: Text("No CT data available."));
              }

              // Find max current for Y-axis
              double maxY = 0;
              for (var d in ctData) {
                if (d.phaseA > maxY) maxY = d.phaseA;
                if (d.phaseB > maxY) maxY = d.phaseB;
                if (d.phaseC > maxY) maxY = d.phaseC;
              }
              maxY = maxY + (maxY * 0.1);

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Compare Multiple Currents ($deviceId)", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text("Analyze Phase A, B, and C currents simultaneously across connected transformers.", style: TextStyle(color: Color(0xFF64748B))),
                  const SizedBox(height: 24),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(24.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.black.withOpacity(0.05)),
                      ),
                      child: LineChart(
                        LineChartData(
                          minY: 0,
                          maxY: maxY == 0 ? 100 : maxY,
                          gridData: FlGridData(
                            show: true,
                            drawVerticalLine: false,
                            getDrawingHorizontalLine: (value) => FlLine(color: const Color(0xFFF1F5F9), strokeWidth: 1),
                          ),
                          titlesData: FlTitlesData(
                            show: true,
                            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                reservedSize: 30,
                                getTitlesWidget: (value, meta) {
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Text('T${value.toInt()}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10)),
                                  );
                                },
                              ),
                            ),
                          ),
                          borderData: FlBorderData(show: false),
                          lineBarsData: [
                            _buildLine(Colors.red, ctData.map((e) => e.phaseA).toList()), // Phase A
                            _buildLine(Colors.green, ctData.map((e) => e.phaseB).toList()), // Phase B
                            _buildLine(Colors.blue, ctData.map((e) => e.phaseC).toList()), // Phase C
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _legendItem(Colors.red, "Phase A"),
                      const SizedBox(width: 24),
                      _legendItem(Colors.green, "Phase B"),
                      const SizedBox(width: 24),
                      _legendItem(Colors.blue, "Phase C"),
                    ],
                  )
                ],
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text("Error loading CT data: $err")),
          )
        ));
  }

  LineChartBarData _buildLine(Color color, List<double> values) {
    return LineChartBarData(
      spots: values.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value)).toList(),
      isCurved: true,
      color: color,
      barWidth: 3,
      dotData: const FlDotData(show: false),
    );
  }

  Widget _legendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF475569))),
      ],
    );
  }
}
