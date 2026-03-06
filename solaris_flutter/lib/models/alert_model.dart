import 'package:json_annotation/json_annotation.dart';

part 'alert_model.g.dart';

@JsonSerializable(explicitToJson: true)
class AlertOut {
  final int id;
  
  @JsonKey(name: 'device_id')
  final String deviceId;
  
  @JsonKey(name: 'plant_id')
  final String plantId;
  
  final String severity;
  final String message;
  final bool acknowledged;
  
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  
  @JsonKey(name: 'device_name')
  final String? deviceName;
  
  @JsonKey(name: 'plant_name')
  final String? plantName;

  AlertOut({
    required this.id,
    required this.deviceId,
    required this.plantId,
    required this.severity,
    required this.message,
    required this.acknowledged,
    required this.createdAt,
    this.deviceName,
    this.plantName,
  });

  factory AlertOut.fromJson(Map<String, dynamic> json) =>
      _$AlertOutFromJson(json);

  Map<String, dynamic> toJson() => _$AlertOutToJson(this);
}

@JsonSerializable(explicitToJson: true)
class DiagnoseResponse {
  @JsonKey(name: 'fault_class')
  final String faultClass;
  
  final double confidence;
  
  @JsonKey(name: 'root_cause')
  final String rootCause;
  
  final List<String> recommendations;
  
  @JsonKey(name: 'estimated_downtime')
  final String estimatedDowntime;
  
  final String severity;
  
  @JsonKey(name: 'model_version')
  final String modelVersion;
  
  @JsonKey(name: 'telemetry_used')
  final Map<String, dynamic>? telemetryUsed;

  DiagnoseResponse({
    required this.faultClass,
    required this.confidence,
    required this.rootCause,
    required this.recommendations,
    required this.estimatedDowntime,
    required this.severity,
    required this.modelVersion,
    this.telemetryUsed,
  });

  factory DiagnoseResponse.fromJson(Map<String, dynamic> json) =>
      _$DiagnoseResponseFromJson(json);

  Map<String, dynamic> toJson() => _$DiagnoseResponseToJson(this);
}
