import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../models/device_model.dart';

class TelemetryLineChart extends StatelessWidget {
  final List<TelemetryReading> telemetry;
  final String metricKey;
  final String title;
  final String unit;
  final Color color;

  const TelemetryLineChart({
    super.key,
    required this.telemetry,
    required this.metricKey,
    required this.title,
    required this.unit,
    this.color = const Color(0xFF2196F3),
  });

  double _getValue(TelemetryReading t) {
    switch (metricKey) {
      case 'active_power': return t.activePower;
      case 'voltage_ab': return t.voltageAb;
      case 'current_a': return t.currentA;
      case 'temperature': return t.temperature;
      default: return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (telemetry.isEmpty) {
      return const Center(child: Text("No data available"));
    }

    // Determine min/max for Y axis
    double minY = double.infinity;
    double maxY = double.negativeInfinity;
    
    final spots = telemetry.asMap().entries.map((e) {
      final value = _getValue(e.value);
      if (value < minY) minY = value;
      if (value > maxY) maxY = value;
      // Using index as X axis for simplicity. In a real app we might parse epoch timestamps.
      return FlSpot(e.key.toDouble(), value);
    }).toList();

    // Add padding to Y axis
    minY = (minY - (minY * 0.1)).clamp(0.0, double.infinity);
    maxY = maxY + (maxY * 0.1);
    if (maxY == 0) maxY = 10;

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
              ),
              Text(
                unit,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF64748B)),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: LineChart(
              LineChartData(
                minY: minY,
                maxY: maxY,
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
                      interval: (telemetry.length / 5).clamp(1.0, double.infinity).toDouble(),
                      getTitlesWidget: (value, meta) {
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            'T${value.toInt()}',
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          value.toStringAsFixed(1),
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    color: color,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      color: color.withOpacity(0.1),
                    ),
                  ),
                ],
                lineTouchData: LineTouchData(
                  touchTooltipData: LineTouchTooltipData(
                    tooltipBgColor: Colors.blueGrey.shade800,
                    getTooltipItems: (touchedSpots) {
                      return touchedSpots.map((spot) {
                        return LineTooltipItem(
                          '${spot.y.toStringAsFixed(2)} $unit',
                          const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        );
                      }).toList();
                    },
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
