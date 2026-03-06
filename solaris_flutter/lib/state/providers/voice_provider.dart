import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../models/voice_model.dart';
import 'api_provider.dart';

final voiceProvider = StateNotifierProvider<VoiceNotifier, VoiceState>((ref) {
  return VoiceNotifier(ref);
});

class VoiceState {
  final bool isListening;
  final String transcript;
  final bool isProcessing;
  final String? error;
  final VoiceCommandResponse? lastResponse;

  VoiceState({
    this.isListening = false,
    this.transcript = '',
    this.isProcessing = false,
    this.error,
    this.lastResponse,
  });

  VoiceState copyWith({
    bool? isListening,
    String? transcript,
    bool? isProcessing,
    String? error,
    VoiceCommandResponse? lastResponse,
    bool clearError = false,
  }) {
    return VoiceState(
      isListening: isListening ?? this.isListening,
      transcript: transcript ?? this.transcript,
      isProcessing: isProcessing ?? this.isProcessing,
      error: clearError ? null : (error ?? this.error),
      lastResponse: lastResponse ?? this.lastResponse,
    );
  }
}

class VoiceNotifier extends StateNotifier<VoiceState> {
  final Ref ref;
  final stt.SpeechToText _speech;
  bool _isAvailable = false;
  String? _sessionId;

  VoiceNotifier(this.ref)
      : _speech = stt.SpeechToText(),
        super(VoiceState()) {
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    _isAvailable = await _speech.initialize(
      onStatus: (status) {
        if (status == 'done' || status == 'notListening') {
          state = state.copyWith(isListening: false);
          if (state.transcript.isNotEmpty && !state.isProcessing) {
            _submitCommand(state.transcript);
          }
        }
      },
      onError: (errorNotification) {
        state = state.copyWith(
          isListening: false,
          error: "Speech error: ${errorNotification.errorMsg}",
        );
      },
    );
  }

  void toggleListening(String currentView) {
    if (!_isAvailable) {
      state = state.copyWith(error: "Microphone permission denied or not supported.", clearError: false);
      return;
    }

    if (state.isListening) {
      _speech.stop();
      state = state.copyWith(isListening: false);
    } else {
      state = state.copyWith(transcript: '', error: null, clearError: true);
      _speech.listen(
        onResult: (result) {
          state = state.copyWith(
            transcript: result.recognizedWords,
            isListening: !result.finalResult,
          );
          if (result.finalResult) {
            _submitCommand(result.recognizedWords, currentView: currentView);
          }
        },
      );
      state = state.copyWith(isListening: true);
    }
  }

  void submitTextCommand(String text, {required String currentView}) {
    _submitCommand(text, currentView: currentView);
  }

  Future<void> _submitCommand(String text, {String currentView = 'dashboard'}) async {
    if (text.trim().isEmpty) return;

    state = state.copyWith(isProcessing: true, clearError: true);

    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.sendVoiceCommand(
        textInput: text,
        sessionId: _sessionId,
        currentView: currentView,
      );

      _sessionId = response.sessionId;

      state = state.copyWith(
        isProcessing: false,
        lastResponse: response,
      );
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: "Failed to connect to AI Assistant.",
      );
    }
  }

  void clearResponse() {
    state = state.copyWith(lastResponse: null, transcript: '', error: null, clearError: true);
  }
}
