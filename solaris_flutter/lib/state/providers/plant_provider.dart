import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/plant_model.dart';
import 'api_provider.dart';

final plantsProvider = FutureProvider<List<PlantSummary>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getPlants();
});

final plantDetailProvider = FutureProvider.family<PlantDetail, String>((ref, id) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getPlant(id);
});
