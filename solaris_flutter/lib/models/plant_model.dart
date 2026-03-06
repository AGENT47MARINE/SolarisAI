import 'package:json_annotation/json_annotation.dart';
import 'device_model.dart';

part 'plant_model.g.dart';

@JsonSerializable(explicitToJson: true)
class PlantSummary {
  final String id;
  final String name;
  final String location;
  final double lat;
  final double lng;
  final String status;
  
  @JsonKey(name: 'today_gen')
  final double todayGen;
  
  @JsonKey(name: 'total_gen')
  final double totalGen;
  
  @JsonKey(name: 'capacity_kwp')
  final double capacityKwp;
  
  @JsonKey(name: 'device_count')
  final int deviceCount;
  
  @JsonKey(name: 'last_updated')
  final String? lastUpdated;
  
  @JsonKey(name: 'chart_data')
  final List<double> chartData;

  PlantSummary({
    required this.id,
    required this.name,
    required this.location,
    required this.lat,
    required this.lng,
    required this.status,
    this.todayGen = 0.0,
    this.totalGen = 0.0,
    required this.capacityKwp,
    this.deviceCount = 0,
    this.lastUpdated,
    this.chartData = const [],
  });

  factory PlantSummary.fromJson(Map<String, dynamic> json) =>
      _$PlantSummaryFromJson(json);

  Map<String, dynamic> toJson() => _$PlantSummaryToJson(this);
}

@JsonSerializable(explicitToJson: true)
class PlantDetail extends PlantSummary {
  final List<DeviceSummary> devices;

  PlantDetail({
    required super.id,
    required super.name,
    required super.location,
    required super.lat,
    required super.lng,
    required super.status,
    super.todayGen = 0.0,
    super.totalGen = 0.0,
    required super.capacityKwp,
    super.deviceCount = 0,
    super.lastUpdated,
    super.chartData = const [],
    this.devices = const [],
  });

  factory PlantDetail.fromJson(Map<String, dynamic> json) =>
      _$PlantDetailFromJson(json);

  @override
  Map<String, dynamic> toJson() => _$PlantDetailToJson(this);
}
