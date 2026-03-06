// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_metrics.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DashboardMetrics _$DashboardMetricsFromJson(Map<String, dynamic> json) =>
    DashboardMetrics(
      totalPlants: (json['total_plants'] as num).toInt(),
      activePlants: (json['active_plants'] as num).toInt(),
      alertPlants: (json['alert_plants'] as num).toInt(),
      partiallyActivePlants: (json['partially_active_plants'] as num).toInt(),
      expiredPlants: (json['expired_plants'] as num).toInt(),
      todayProductionKwh: (json['today_production_kwh'] as num).toDouble(),
      totalProductionKwh: (json['total_production_kwh'] as num).toDouble(),
      totalCapacityKwp: (json['total_capacity_kwp'] as num).toDouble(),
      efficiencyPct: (json['efficiency_pct'] as num).toDouble(),
      co2ReducedTons: (json['co2_reduced_tons'] as num).toDouble(),
      treesPlanted: (json['trees_planted'] as num).toInt(),
      coalSavedTons: (json['coal_saved_tons'] as num).toDouble(),
      activeAlerts: (json['active_alerts'] as num).toInt(),
      totalDevices: (json['total_devices'] as num).toInt(),
      deviceBreakdown: json['device_breakdown'] as Map<String, dynamic>,
      energyChart: (json['energy_chart'] as List<dynamic>)
          .map((e) => e as Map<String, dynamic>)
          .toList(),
    );

Map<String, dynamic> _$DashboardMetricsToJson(DashboardMetrics instance) =>
    <String, dynamic>{
      'total_plants': instance.totalPlants,
      'active_plants': instance.activePlants,
      'alert_plants': instance.alertPlants,
      'partially_active_plants': instance.partiallyActivePlants,
      'expired_plants': instance.expiredPlants,
      'today_production_kwh': instance.todayProductionKwh,
      'total_production_kwh': instance.totalProductionKwh,
      'total_capacity_kwp': instance.totalCapacityKwp,
      'efficiency_pct': instance.efficiencyPct,
      'co2_reduced_tons': instance.co2ReducedTons,
      'trees_planted': instance.treesPlanted,
      'coal_saved_tons': instance.coalSavedTons,
      'active_alerts': instance.activeAlerts,
      'total_devices': instance.totalDevices,
      'device_breakdown': instance.deviceBreakdown,
      'energy_chart': instance.energyChart,
    };
