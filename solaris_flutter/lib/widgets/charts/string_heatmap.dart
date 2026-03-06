import 'package:flutter/material.dart';

class StringHeatmapWidget extends StatelessWidget {
  final List<List<double>> gridData; // [rows][cols] of string currents
  final double maxCurrent;
  final double minCurrent;

  const StringHeatmapWidget({
    super.key,
    required this.gridData,
    this.maxCurrent = 15.0, // Typical max string current
    this.minCurrent = 0.0,
  });

  Color _getColorForValue(double value) {
    if (value <= minCurrent) return Colors.grey.shade200;
    
    // Normalize value between 0 and 1
    double normalized = (value - minCurrent) / (maxCurrent - minCurrent);
    normalized = normalized.clamp(0.0, 1.0);

    // Color gradient: Red (0) -> Yellow (0.5) -> Green (1)
    if (normalized < 0.5) {
      // Scale 0-0.5 to 0-1 for Red-Yellow interpolation
      return Color.lerp(Colors.red.shade400, Colors.yellow.shade400, normalized * 2)!;
    } else {
      // Scale 0.5-1.0 to 0-1 for Yellow-Green interpolation
      return Color.lerp(Colors.yellow.shade400, Colors.green.shade500, (normalized - 0.5) * 2)!;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (gridData.isEmpty) return const Center(child: Text("No String Data"));

    int cols = gridData[0].length;

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Latest String Data (Heatmap)',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, constraints) {
              // Calculate cell width based on available space minus spacing
              double spacing = 4.0;
              double cellWidth = (constraints.maxWidth - (spacing * (cols - 1))) / cols;
              // Cap cell width so it doesn't look absurdly large on wide screens
              cellWidth = cellWidth.clamp(30.0, 80.0);

              return Column(
                children: gridData.asMap().entries.map((rowEntry) {
                  int rowIdx = rowEntry.key;
                  List<double> row = rowEntry.value;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: row.asMap().entries.map((colEntry) {
                        int colIdx = colEntry.key;
                        double val = colEntry.value;
                        
                        return Container(
                          width: cellWidth,
                          height: 40,
                          margin: EdgeInsets.only(right: colIdx < cols - 1 ? 4.0 : 0),
                          decoration: BoxDecoration(
                            color: _getColorForValue(val),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.black12),
                          ),
                          child: Center(
                            child: Text(
                              val.toStringAsFixed(1),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: val < (maxCurrent * 0.3) ? Colors.white : Colors.black87,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  );
                }).toList(),
              );
            },
          ),
          const SizedBox(height: 16),
          // Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              _buildLegendItem(Colors.red.shade400, 'Low / Fault'),
              const SizedBox(width: 16),
              _buildLegendItem(Colors.yellow.shade400, 'Sub-optimal'),
              const SizedBox(width: 16),
              _buildLegendItem(Colors.green.shade500, 'Optimal'),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 16, height: 16, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
      ],
    );
  }
}
