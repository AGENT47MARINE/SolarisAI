import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_datagrid/datagrid.dart';
import 'package:syncfusion_flutter_core/theme.dart';
import '../../models/device_model.dart';
import 'package:intl/intl.dart';

class SensorsDataGrid extends StatefulWidget {
  final List<DeviceSummary> devices;
  final List<TelemetryReading> latestTelemetry; // Mapped 1:1 with devices or filtered

  const SensorsDataGrid({
    super.key,
    required this.devices,
    required this.latestTelemetry,
  });

  @override
  State<SensorsDataGrid> createState() => _SensorsDataGridState();
}

class _SensorsDataGridState extends State<SensorsDataGrid> {
  late DeviceDataSource _deviceDataSource;

  @override
  void initState() {
    super.initState();
    _deviceDataSource = DeviceDataSource(
      devices: widget.devices,
      telemetry: widget.latestTelemetry,
    );
  }

  @override
  void didUpdateWidget(covariant SensorsDataGrid oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.devices != widget.devices || oldWidget.latestTelemetry != widget.latestTelemetry) {
      _deviceDataSource = DeviceDataSource(
        devices: widget.devices,
        telemetry: widget.latestTelemetry,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
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
            gridLineStrokeWidth: 1,
            rowHoverColor: const Color(0xFFF1F5F9).withOpacity(0.5),
          ),
          child: SfDataGrid(
            source: _deviceDataSource,
            columnWidthMode: ColumnWidthMode.fill,
            allowSorting: true,
            allowTriStateSorting: true,
            columns: <GridColumn>[
              GridColumn(
                columnName: 'device_name',
                label: Container(
                  padding: const EdgeInsets.all(16.0),
                  alignment: Alignment.centerLeft,
                  child: const Text('Device Name', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                ),
              ),
              GridColumn(
                columnName: 'category',
                label: Container(
                  padding: const EdgeInsets.all(16.0),
                  alignment: Alignment.centerLeft,
                  child: const Text('Category', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                ),
              ),
              GridColumn(
                columnName: 'active_power',
                label: Container(
                  padding: const EdgeInsets.all(16.0),
                  alignment: Alignment.centerRight,
                  child: const Text('Active Power (kW)', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                ),
              ),
              GridColumn(
                columnName: 'temperature',
                label: Container(
                  padding: const EdgeInsets.all(16.0),
                  alignment: Alignment.centerRight,
                  child: const Text('Temp (°C)', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                ),
              ),
              GridColumn(
                columnName: 'status',
                label: Container(
                  padding: const EdgeInsets.all(16.0),
                  alignment: Alignment.center,
                  child: const Text('Status', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class DeviceDataSource extends DataGridSource {
  DeviceDataSource({
    required List<DeviceSummary> devices,
    required List<TelemetryReading> telemetry,
  }) {
    _deviceData = devices.map<DataGridRow>((device) {
      // Find matching telemetry if available
      final t = telemetry.cast<TelemetryReading?>().firstWhere(
        (read) => read?.deviceId == device.id,
        orElse: () => null,
      );

      return DataGridRow(cells: [
        DataGridCell<String>(columnName: 'device_name', value: device.deviceName),
        DataGridCell<String>(columnName: 'category', value: device.category),
        DataGridCell<double>(columnName: 'active_power', value: t?.activePower ?? 0.0),
        DataGridCell<double>(columnName: 'temperature', value: t?.temperature ?? 0.0),
        DataGridCell<String>(columnName: 'status', value: device.status),
      ]);
    }).toList();
  }

  List<DataGridRow> _deviceData = [];

  @override
  List<DataGridRow> get rows => _deviceData;

  @override
  DataGridRowAdapter buildRow(DataGridRow row) {
    return DataGridRowAdapter(
      cells: row.getCells().map<Widget>((e) {
        if (e.columnName == 'status') {
          return Container(
            alignment: Alignment.center,
            padding: const EdgeInsets.all(8.0),
            child: _buildStatusBadge(e.value.toString()),
          );
        }
        
        if (e.columnName == 'category') {
           return Container(
            alignment: Alignment.centerLeft,
            padding: const EdgeInsets.all(16.0),
            child: _buildCategoryBadge(e.value.toString()),
          );
        }

        return Container(
          alignment: (e.columnName == 'active_power' || e.columnName == 'temperature')
              ? Alignment.centerRight
              : Alignment.centerLeft,
          padding: const EdgeInsets.all(16.0),
          child: Text(
            e.value is double ? (e.value as double).toStringAsFixed(2) : e.value.toString(),
            style: const TextStyle(color: Color(0xFF1E293B)),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;
    switch (status.toLowerCase()) {
      case 'active':
        bgColor = Colors.green.shade50;
        textColor = Colors.green.shade700;
        break;
      case 'fault':
        bgColor = Colors.red.shade50;
        textColor = Colors.red.shade700;
        break;
      case 'offline':
        bgColor = Colors.grey.shade100;
        textColor = Colors.grey.shade700;
        break;
      default:
        bgColor = Colors.blue.shade50;
        textColor = Colors.blue.shade700;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }
  
  Widget _buildCategoryBadge(String cat) {
    Color bgColor;
    switch (cat.toLowerCase()) {
      case 'wms': bgColor = const Color(0xFFEF4444); break;
      case 'temperature': bgColor = const Color(0xFFF59E0B); break;
      case 'mfm': bgColor = const Color(0xFF3B82F6); break;
      default: bgColor = const Color(0xFF64748B); break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        cat.toUpperCase(),
        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }
}
