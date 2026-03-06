import 'package:json_annotation/json_annotation.dart';

part 'voice_model.g.dart';

@JsonSerializable(explicitToJson: true)
class VoiceCommandResponse {
  final String sessionId;
  final String transcript;
  final String intent;
  final double confidence;
  
  @JsonKey(name: 'navigation_action')
  final NavigationAction navigationAction;
  
  final List<Suggestion> suggestions;
  final int latencyMs;

  VoiceCommandResponse({
    required this.sessionId,
    required this.transcript,
    required this.intent,
    required this.confidence,
    required this.navigationAction,
    required this.suggestions,
    required this.latencyMs,
  });

  factory VoiceCommandResponse.fromJson(Map<String, dynamic> json) =>
      _$VoiceCommandResponseFromJson(json);

  Map<String, dynamic> toJson() => _$VoiceCommandResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class NavigationAction {
  final String action;
  final Map<String, dynamic> params;

  NavigationAction({
    required this.action,
    required this.params,
  });

  factory NavigationAction.fromJson(Map<String, dynamic> json) =>
      _$NavigationActionFromJson(json);

  Map<String, dynamic> toJson() => _$NavigationActionToJson(this);
}

@JsonSerializable(explicitToJson: true)
class Suggestion {
  final String view;
  final String label;
  final double probability;

  Suggestion({
    required this.view,
    required this.label,
    required this.probability,
  });

  factory Suggestion.fromJson(Map<String, dynamic> json) =>
      _$SuggestionFromJson(json);

  Map<String, dynamic> toJson() => _$SuggestionToJson(this);
}
