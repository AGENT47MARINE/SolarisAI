import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:syncfusion_flutter_datagrid/datagrid.dart';
import 'package:syncfusion_flutter_core/theme.dart';
import 'package:intl/intl.dart';
import '../../state/providers/alert_provider.dart';
import '../../models/alert_model.dart';

class GlobalAlertsScreen extends ConsumerWidget {
  const GlobalAlertsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertsAsync = ref.watch(alertsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Global Alerts & AI Diagnosis'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(alertsProvider),
          ),
        ],
      ),
      body: alertsAsync.when(
        data: (alerts) => _buildAlertsContent(context, alerts),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildAlertsContent(BuildContext context, List<AlertOut> alerts) {
    if (alerts.isEmpty) {
      return const Center(child: Text('No active alerts found across all plants.', style: TextStyle(fontSize: 18, color: Colors.green)));
    }

    final source = AlertDataSource(alerts: alerts, context: context);

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.black.withOpacity(0.05)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: SfDataGridTheme(
            data: SfDataGridThemeData(
              headerColor: const Color(0xFFF8FAFC),
              gridLineColor: const Color(0xFFF1F5F9),
            ),
            child: SfDataGrid(
              source: source,
              columnWidthMode: ColumnWidthMode.fill,
              allowSorting: true,
              columns: [
                GridColumn(
                  columnName: 'time',
                  label: _buildHeaderCell('Time'),
                ),
                GridColumn(
                  columnName: 'severity',
                  label: _buildHeaderCell('Severity'),
                ),
                GridColumn(
                  columnName: 'plant',
                  label: _buildHeaderCell('Plant'),
                ),
                GridColumn(
                  columnName: 'device',
                  label: _buildHeaderCell('Device'),
                ),
                GridColumn(
                  columnName: 'message',
                  label: _buildHeaderCell('Message'),
                ),
                GridColumn(
                  columnName: 'actions',
                  label: _buildHeaderCell('AI Action'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCell(String title) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      alignment: Alignment.centerLeft,
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF475569))),
    );
  }
}

class AlertDataSource extends DataGridSource {
  final BuildContext context;
  List<DataGridRow> _data = [];

  AlertDataSource({required List<AlertOut> alerts, required this.context}) {
    _data = alerts.map((alert) => DataGridRow(cells: [
      DataGridCell<DateTime>(columnName: 'time', value: alert.createdAt),
      DataGridCell<String>(columnName: 'severity', value: alert.severity),
      DataGridCell<String>(columnName: 'plant', value: alert.plantName ?? alert.plantId),
      DataGridCell<String>(columnName: 'device', value: alert.deviceName ?? alert.deviceId),
      DataGridCell<String>(columnName: 'message', value: alert.message),
      DataGridCell<AlertOut>(columnName: 'actions', value: alert),
    ])).toList();
  }

  @override
  List<DataGridRow> get rows => _data;

  @override
  DataGridRowAdapter buildRow(DataGridRow row) {
    return DataGridRowAdapter(
      cells: row.getCells().map<Widget>((e) {
        if (e.columnName == 'actions') {
          return _buildActionCell(e.value as AlertOut);
        }
        if (e.columnName == 'severity') {
          return _buildSeverityBadge(e.value.toString());
        }
        if (e.columnName == 'time') {
          return _buildTextCell(DateFormat('MMM dd, HH:mm').format(e.value as DateTime));
        }
        return _buildTextCell(e.value.toString());
      }).toList(),
    );
  }

  Widget _buildTextCell(String text) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      alignment: Alignment.centerLeft,
      child: Text(text, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF1E293B))),
    );
  }

  Widget _buildSeverityBadge(String severity) {
    Color bg, text;
    if (severity.toLowerCase() == 'critical') {
      bg = Colors.red.shade50;
      text = Colors.red.shade700;
    } else if (severity.toLowerCase() == 'warning') {
      bg = Colors.orange.shade50;
      text = Colors.orange.shade700;
    } else {
      bg = Colors.blue.shade50;
      text = Colors.blue.shade700;
    }

    return Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.all(16.0),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
        child: Text(severity.toUpperCase(), style: TextStyle(color: text, fontSize: 11, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildActionCell(AlertOut alert) {
    return Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.all(8.0),
      child: Consumer(
        builder: (context, ref, child) {
          return ElevatedButton.icon(
            icon: const Icon(Icons.psychology, size: 16),
            label: const Text("Diagnose"),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4F46E5),
              foregroundColor: Colors.white,
              elevation: 0,
            ),
            onPressed: () {
              _showDiagnosisModal(context, ref, alert);
            },
          );
        }
      ),
    );
  }

  void _showDiagnosisModal(BuildContext context, WidgetRef ref, AlertOut alert) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text('AI Diagnosis: ${alert.deviceName ?? alert.deviceId}'),
          content: SizedBox(
            width: 500,
            child: Consumer(
              builder: (context, ref, _) {
                final diagnosisAsync = ref.watch(diagnosisProvider({
                  'device_id': alert.deviceId,
                  'alert_id': alert.id,
                }));

                return diagnosisAsync.when(
                  data: (diag) => Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _diagRow('Fault Class', diag.faultClass, isHighlight: true),
                      _diagRow('Confidence', '${(diag.confidence * 100).toStringAsFixed(1)}%'),
                      const Divider(),
                      const Text('Root Cause:', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text(diag.rootCause, style: const TextStyle(color: Color(0xFF475569))),
                      const SizedBox(height: 12),
                      const Text('Recommendations:', style: TextStyle(fontWeight: FontWeight.bold)),
                      ...diag.recommendations.map((r) => Padding(
                        padding: const EdgeInsets.only(top: 4.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                            Expanded(child: Text(r, style: const TextStyle(color: Color(0xFF475569)))),
                          ]
                        ),
                      )).toList(),
                      const SizedBox(height: 12),
                      _diagRow('Est. Downtime', diag.estimatedDowntime),
                    ],
                  ),
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text('Running ML Inference Model...'),
                        ],
                      ),
                    ),
                  ),
                  error: (err, stack) => Text('Failed to run diagnosis:\n$err', style: const TextStyle(color: Colors.red)),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  Widget _diagRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF475569))),
          Text(
            value, 
            style: TextStyle(
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal,
              color: isHighlight ? const Color(0xFFEF4444) : const Color(0xFF1E293B)
            )
          ),
        ],
      ),
    );
  }
}
