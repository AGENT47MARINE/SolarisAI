import 'package:json_annotation/json_annotation.dart';

part 'dashboard_metrics.g.dart';

@JsonSerializable(explicitToJson: true)
class DashboardMetrics {
  @JsonKey(name: 'total_plants')
  final int totalPlants;

  @JsonKey(name: 'active_plants')
  final int activePlants;

  @JsonKey(name: 'alert_plants')
  final int alertPlants;

  @JsonKey(name: 'partially_active_plants')
  final int partiallyActivePlants;

  @JsonKey(name: 'expired_plants')
  final int expiredPlants;

  @JsonKey(name: 'today_production_kwh')
  final double todayProductionKwh;

  @JsonKey(name: 'total_production_kwh')
  final double totalProductionKwh;

  @JsonKey(name: 'total_capacity_kwp')
  final double totalCapacityKwp;

  @JsonKey(name: 'efficiency_pct')
  final double efficiencyPct;

  @JsonKey(name: 'co2_reduced_tons')
  final double co2ReducedTons;

  @JsonKey(name: 'trees_planted')
  final int treesPlanted;

  @JsonKey(name: 'coal_saved_tons')
  final double coalSavedTons;

  @JsonKey(name: 'active_alerts')
  final int activeAlerts;

  @JsonKey(name: 'total_devices')
  final int totalDevices;

  @JsonKey(name: 'device_breakdown')
  final Map<String, dynamic> deviceBreakdown;

  @JsonKey(name: 'energy_chart')
  final List<Map<String, dynamic>> energyChart;

  DashboardMetrics({
    required this.totalPlants,
    required this.activePlants,
    required this.alertPlants,
    required this.partiallyActivePlants,
    required this.expiredPlants,
    required this.todayProductionKwh,
    required this.totalProductionKwh,
    required this.totalCapacityKwp,
    required this.efficiencyPct,
    required this.co2ReducedTons,
    required this.treesPlanted,
    required this.coalSavedTons,
    required this.activeAlerts,
    required this.totalDevices,
    required this.deviceBreakdown,
    required this.energyChart,
  });

  factory DashboardMetrics.fromJson(Map<String, dynamic> json) =>
      _$DashboardMetricsFromJson(json);

  Map<String, dynamic> toJson() => _$DashboardMetricsToJson(this);
}
