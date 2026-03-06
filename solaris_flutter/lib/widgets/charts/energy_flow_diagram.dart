import 'package:flutter/material.dart';

class EnergyFlowDiagram extends StatelessWidget {
  final double pvPower;
  final double gridPower;
  final double loadPower;
  
  const EnergyFlowDiagram({
    super.key,
    required this.pvPower,
    required this.gridPower,
    required this.loadPower,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24.0),
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
        children: [
          const Text(
            'Energy Flow',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 32),
          Center(
            child: SizedBox(
              height: 200,
              width: double.infinity,
              child: CustomPaint(
                painter: _EnergyFlowPainter(
                  pvPower: pvPower,
                  gridPower: gridPower,
                  loadPower: loadPower,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EnergyFlowPainter extends CustomPainter {
  final double pvPower;
  final double gridPower;
  final double loadPower;

  _EnergyFlowPainter({
    required this.pvPower,
    required this.gridPower,
    required this.loadPower,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paintLine = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;
      
    final paintActiveLine = Paint()
      ..color = const Color(0xFF2196F3)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    final double nodeSize = 60.0;
    
    // Define positions
    // Left (PV)
    final Offset pvCenter = Offset(nodeSize * 1.5, size.height / 2);
    // Middle (Inverter)
    final Offset invCenter = Offset(size.width / 2, size.height / 2);
    // Right (Grid)
    final Offset gridCenter = Offset(size.width - (nodeSize * 1.5), size.height / 2 - 40);
    // Bottom Right (Load)
    final Offset loadCenter = Offset(size.width - (nodeSize * 1.5), size.height / 2 + 40);

    // Draw lines
    // PV to Inverter
    canvas.drawLine(
      Offset(pvCenter.dx + nodeSize/2, pvCenter.dy), 
      Offset(invCenter.dx - nodeSize/2, invCenter.dy), 
      pvPower > 0 ? paintActiveLine : paintLine
    );
    
    // Inverter to Grid
    canvas.drawLine(
      Offset(invCenter.dx + nodeSize/2, invCenter.dy - 10), 
      Offset(gridCenter.dx - nodeSize/2, gridCenter.dy), 
      gridPower > 0 ? paintActiveLine : paintLine
    );
    
    // Inverter to Load
    canvas.drawLine(
      Offset(invCenter.dx + nodeSize/2, invCenter.dy + 10), 
      Offset(loadCenter.dx - nodeSize/2, loadCenter.dy), 
      loadPower > 0 ? paintActiveLine : paintLine
    );

    // Draw Nodes (Placeholders for Icons)
    _drawNode(canvas, pvCenter, nodeSize, 'PV Array\n${pvPower.toStringAsFixed(1)} kW', Colors.orange.shade50);
    _drawNode(canvas, invCenter, nodeSize, 'Inverter', Colors.blue.shade50);
    _drawNode(canvas, gridCenter, nodeSize, 'Grid\n${gridPower.toStringAsFixed(1)} kW', Colors.green.shade50);
    _drawNode(canvas, loadCenter, nodeSize, 'Load\n${loadPower.toStringAsFixed(1)} kW', Colors.purple.shade50);
  }

  void _drawNode(Canvas canvas, Offset center, double size, String label, Color bgColor) {
    final bgPaint = Paint()..color = bgColor..style = PaintingStyle.fill;
    final borderPaint = Paint()..color = Colors.black12..strokeWidth = 1..style = PaintingStyle.stroke;
    
    final rect = Rect.fromCenter(center: center, width: size * 1.5, height: size);
    final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(8));
    
    canvas.drawRRect(rrect, bgPaint);
    canvas.drawRRect(rrect, borderPaint);
    
    // Simple text rendering
    final textPainter = TextPainter(
      text: TextSpan(
        text: label,
        style: const TextStyle(color: Colors.black87, fontSize: 10, fontWeight: FontWeight.bold),
      ),
      textDirection: TextDirection.ltr,
      textAlign: TextAlign.center,
    );
    
    textPainter.layout(minWidth: size * 1.5, maxWidth: size * 1.5);
    textPainter.paint(
      canvas, 
      Offset(center.dx - (textPainter.width / 2), center.dy - (textPainter.height / 2))
    );
  }

  @override
  bool shouldRepaint(covariant _EnergyFlowPainter oldDelegate) {
    return pvPower != oldDelegate.pvPower || 
           gridPower != oldDelegate.gridPower || 
           loadPower != oldDelegate.loadPower;
  }
}
