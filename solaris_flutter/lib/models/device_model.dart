import 'package:json_annotation/json_annotation.dart';

part 'device_model.g.dart';

@JsonSerializable(explicitToJson: true)
class DeviceSummary {
  final String id;
  
  @JsonKey(name: 'device_name')
  final String deviceName;
  
  final String category;
  final String manufacturer;
  final String status;
  
  @JsonKey(name: 'plant_id')
  final String plantId;

  DeviceSummary({
    required this.id,
    required this.deviceName,
    required this.category,
    required this.manufacturer,
    required this.status,
    required this.plantId,
  });

  factory DeviceSummary.fromJson(Map<String, dynamic> json) =>
      _$DeviceSummaryFromJson(json);

  Map<String, dynamic> toJson() => _$DeviceSummaryToJson(this);
}

@JsonSerializable(explicitToJson: true)
class TelemetryReading {
  final DateTime time;
  
  @JsonKey(name: 'device_id')
  final String deviceId;
  
  @JsonKey(name: 'voltage_ab')
  final double voltageAb;
  
  @JsonKey(name: 'voltage_bc')
  final double voltageBc;
  
  @JsonKey(name: 'voltage_ac')
  final double voltageAc;
  
  @JsonKey(name: 'current_a')
  final double currentA;
  
  @JsonKey(name: 'current_b')
  final double currentB;
  
  @JsonKey(name: 'current_c')
  final double currentC;
  
  @JsonKey(name: 'active_power')
  final double activePower;
  
  @JsonKey(name: 'reactive_power')
  final double reactivePower;
  
  final double frequency;
  final double temperature;
  final double irradiance;
  
  @JsonKey(name: 'today_generation')
  final double todayGeneration;
  
  @JsonKey(name: 'total_generation')
  final double totalGeneration;

  TelemetryReading({
    required this.time,
    required this.deviceId,
    required this.voltageAb,
    required this.voltageBc,
    required this.voltageAc,
    required this.currentA,
    required this.currentB,
    required this.currentC,
    required this.activePower,
    required this.reactivePower,
    required this.frequency,
    required this.temperature,
    required this.irradiance,
    required this.todayGeneration,
    required this.totalGeneration,
  });

  factory TelemetryReading.fromJson(Map<String, dynamic> json) =>
      _$TelemetryReadingFromJson(json);

  Map<String, dynamic> toJson() => _$TelemetryReadingToJson(this);
}

@JsonSerializable(explicitToJson: true)
class CTAnalysisData {
  final DateTime time;
  
  @JsonKey(name: 'phase_a')
  final double phaseA;
  
  @JsonKey(name: 'phase_b')
  final double phaseB;
  
  @JsonKey(name: 'phase_c')
  final double phaseC;

  CTAnalysisData({
    required this.time,
    required this.phaseA,
    required this.phaseB,
    required this.phaseC,
  });

  factory CTAnalysisData.fromJson(Map<String, dynamic> json) =>
      _$CTAnalysisDataFromJson(json);

  Map<String, dynamic> toJson() => _$CTAnalysisDataToJson(this);
}

@JsonSerializable(explicitToJson: true)
class VoltageGridData {
  @JsonKey(name: 'v_r')
  final double vR;
  
  @JsonKey(name: 'v_y')
  final double vY;
  
  @JsonKey(name: 'v_b')
  final double vB;
  
  @JsonKey(name: 'v_ry')
  final double vRy;
  
  @JsonKey(name: 'v_yb')
  final double vYb;
  
  @JsonKey(name: 'v_br')
  final double vBr;
  
  final double freq;
  
  @JsonKey(name: 'pf_r')
  final double pfR;
  
  @JsonKey(name: 'pf_y')
  final double pfY;
  
  @JsonKey(name: 'pf_b')
  final double pfB;
  
  @JsonKey(name: 'i_r')
  final double iR;
  
  @JsonKey(name: 'i_y')
  final double iY;
  
  @JsonKey(name: 'i_b')
  final double iB;

  VoltageGridData({
    required this.vR,
    required this.vY,
    required this.vB,
    required this.vRy,
    required this.vYb,
    required this.vBr,
    required this.freq,
    required this.pfR,
    required this.pfY,
    required this.pfB,
    required this.iR,
    required this.iY,
    required this.iB,
  });

  factory VoltageGridData.fromJson(Map<String, dynamic> json) =>
      _$VoltageGridDataFromJson(json);

  Map<String, dynamic> toJson() => _$VoltageGridDataToJson(this);
}
