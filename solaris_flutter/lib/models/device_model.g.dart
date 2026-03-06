// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'device_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DeviceSummary _$DeviceSummaryFromJson(Map<String, dynamic> json) =>
    DeviceSummary(
      id: json['id'] as String,
      deviceName: json['device_name'] as String,
      category: json['category'] as String,
      manufacturer: json['manufacturer'] as String,
      status: json['status'] as String,
      plantId: json['plant_id'] as String,
    );

Map<String, dynamic> _$DeviceSummaryToJson(DeviceSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'device_name': instance.deviceName,
      'category': instance.category,
      'manufacturer': instance.manufacturer,
      'status': instance.status,
      'plant_id': instance.plantId,
    };

TelemetryReading _$TelemetryReadingFromJson(Map<String, dynamic> json) =>
    TelemetryReading(
      time: DateTime.parse(json['time'] as String),
      deviceId: json['device_id'] as String,
      voltageAb: (json['voltage_ab'] as num).toDouble(),
      voltageBc: (json['voltage_bc'] as num).toDouble(),
      voltageAc: (json['voltage_ac'] as num).toDouble(),
      currentA: (json['current_a'] as num).toDouble(),
      currentB: (json['current_b'] as num).toDouble(),
      currentC: (json['current_c'] as num).toDouble(),
      activePower: (json['active_power'] as num).toDouble(),
      reactivePower: (json['reactive_power'] as num).toDouble(),
      frequency: (json['frequency'] as num).toDouble(),
      temperature: (json['temperature'] as num).toDouble(),
      irradiance: (json['irradiance'] as num).toDouble(),
      todayGeneration: (json['today_generation'] as num).toDouble(),
      totalGeneration: (json['total_generation'] as num).toDouble(),
    );

Map<String, dynamic> _$TelemetryReadingToJson(TelemetryReading instance) =>
    <String, dynamic>{
      'time': instance.time.toIso8601String(),
      'device_id': instance.deviceId,
      'voltage_ab': instance.voltageAb,
      'voltage_bc': instance.voltageBc,
      'voltage_ac': instance.voltageAc,
      'current_a': instance.currentA,
      'current_b': instance.currentB,
      'current_c': instance.currentC,
      'active_power': instance.activePower,
      'reactive_power': instance.reactivePower,
      'frequency': instance.frequency,
      'temperature': instance.temperature,
      'irradiance': instance.irradiance,
      'today_generation': instance.todayGeneration,
      'total_generation': instance.totalGeneration,
    };

CTAnalysisData _$CTAnalysisDataFromJson(Map<String, dynamic> json) =>
    CTAnalysisData(
      time: DateTime.parse(json['time'] as String),
      phaseA: (json['phase_a'] as num).toDouble(),
      phaseB: (json['phase_b'] as num).toDouble(),
      phaseC: (json['phase_c'] as num).toDouble(),
    );

Map<String, dynamic> _$CTAnalysisDataToJson(CTAnalysisData instance) =>
    <String, dynamic>{
      'time': instance.time.toIso8601String(),
      'phase_a': instance.phaseA,
      'phase_b': instance.phaseB,
      'phase_c': instance.phaseC,
    };

VoltageGridData _$VoltageGridDataFromJson(Map<String, dynamic> json) =>
    VoltageGridData(
      vR: (json['v_r'] as num).toDouble(),
      vY: (json['v_y'] as num).toDouble(),
      vB: (json['v_b'] as num).toDouble(),
      vRy: (json['v_ry'] as num).toDouble(),
      vYb: (json['v_yb'] as num).toDouble(),
      vBr: (json['v_br'] as num).toDouble(),
      freq: (json['freq'] as num).toDouble(),
      pfR: (json['pf_r'] as num).toDouble(),
      pfY: (json['pf_y'] as num).toDouble(),
      pfB: (json['pf_b'] as num).toDouble(),
      iR: (json['i_r'] as num).toDouble(),
      iY: (json['i_y'] as num).toDouble(),
      iB: (json['i_b'] as num).toDouble(),
    );

Map<String, dynamic> _$VoltageGridDataToJson(VoltageGridData instance) =>
    <String, dynamic>{
      'v_r': instance.vR,
      'v_y': instance.vY,
      'v_b': instance.vB,
      'v_ry': instance.vRy,
      'v_yb': instance.vYb,
      'v_br': instance.vBr,
      'freq': instance.freq,
      'pf_r': instance.pfR,
      'pf_y': instance.pfY,
      'pf_b': instance.pfB,
      'i_r': instance.iR,
      'i_y': instance.iY,
      'i_b': instance.iB,
    };
