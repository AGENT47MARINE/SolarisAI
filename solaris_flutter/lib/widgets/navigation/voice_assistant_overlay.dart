import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import '../../state/providers/voice_provider.dart';

class VoiceAssistantOverlay extends ConsumerStatefulWidget {
  final Widget child;

  const VoiceAssistantOverlay({super.key, required this.child});

  @override
  ConsumerState<VoiceAssistantOverlay> createState() => _VoiceAssistantOverlayState();
}

class _VoiceAssistantOverlayState extends ConsumerState<VoiceAssistantOverlay> {
  bool _isOpen = false;
  final TextEditingController _textController = TextEditingController();

  String _getCurrentView() {
    final route = GoRouterState.of(context).uri.toString();
    if (route.contains('/plants')) return 'plants';
    if (route.contains('/devices')) return 'inverters';
    if (route.contains('/alerts')) return 'alerts';
    if (route.contains('/sensors')) return 'sensors';
    return 'dashboard';
  }

  void _handleIntentNavigation(String intent, Map<String, dynamic> params) {
    switch (intent) {
      case 'OPEN_DASHBOARD':
        context.go('/');
        break;
      case 'OPEN_PLANT':
        if (params.containsKey('plant_id')) {
          context.go('/plants/${params['plant_id']}');
        } else {
          // generic routing if list existed
          context.go('/');
        }
        break;
      case 'OPEN_DEVICE':
      case 'OPEN_TELEMETRY':
      case 'DIAGNOSE':
        if (params.containsKey('device_id')) {
          context.go('/devices/${params['device_id']}');
        } else if (params.containsKey('route')) {
          context.go('/${params['route']}');
        }
        break;
      case 'OPEN_ALERTS':
        context.go('/alerts');
        break;
    }
  }

  void _handleSuggestionRoute(String view) {
    if (view == 'dashboard') context.go('/');
    else if (view == 'alerts') context.go('/alerts');
    else if (view == 'sensors') context.go('/sensors');
    else if (view == 'inverters') context.go('/sensors'); // Sensors generic view
    else if (view.startsWith('alerts_device_')) context.go('/alerts');
    else if (view.startsWith('diagnose_')) context.go('/devices/${view.replaceAll('diagnose_', '')}');
    
    // Close overlay on nav
    setState(() => _isOpen = false);
    ref.read(voiceProvider.notifier).clearResponse();
  }

  @override
  Widget build(BuildContext context) {
    final voiceState = ref.watch(voiceProvider);

    // Watch for responses to trigger navigation
    ref.listen(voiceProvider, (previous, next) {
      if (next.lastResponse != null && previous?.lastResponse != next.lastResponse) {
        _handleIntentNavigation(
          next.lastResponse!.intent, 
          next.lastResponse!.navigationAction.params
        );
      }
    });

    return Stack(
      children: [
        widget.child,

        // Floating Action Button
        Positioned(
          bottom: 24,
          right: 24,
          child: FloatingActionButton(
            heroTag: 'voice_fab',
            backgroundColor: const Color(0xFF0F172A),
            onPressed: () {
              setState(() {
                _isOpen = !_isOpen;
              });
            },
            child: Icon(_isOpen ? LucideIcons.x : LucideIcons.mic, color: Colors.white),
          ),
        ),

        // Chatbot Panel
        if (_isOpen)
          Positioned(
            bottom: 90,
            right: 24,
            width: 320,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(16),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.black.withOpacity(0.1)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: const BoxDecoration(
                        color: Color(0xFF0F172A),
                        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                      ),
                      child: Row(
                        children: const [
                          Icon(LucideIcons.bot, color: Colors.white, size: 20),
                          SizedBox(width: 8),
                          Text(
                            "Solaris AI Assistant",
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),

                    // Body Window
                    Container(
                      constraints: const BoxConstraints(minHeight: 150, maxHeight: 300),
                      padding: const EdgeInsets.all(16),
                      child: ListView(
                        shrinkWrap: true,
                        children: [
                          if (voiceState.isProcessing)
                            const Center(child: Padding(
                              padding: EdgeInsets.all(20.0),
                              child: CircularProgressIndicator(),
                            ))
                          else if (voiceState.lastResponse != null) ...[
                            Text(
                              "You: ${voiceState.lastResponse!.transcript}",
                              style: const TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              "Intent Parsed: ${voiceState.lastResponse!.intent.replaceAll('_', ' ')}\nNavigating...",
                              style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                            ),
                            const SizedBox(height: 16),
                            if (voiceState.lastResponse!.suggestions.isNotEmpty) ...[
                              const Text("Suggestions:", style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                              const SizedBox(height: 8),
                              ...voiceState.lastResponse!.suggestions.map((sugg) => 
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      alignment: Alignment.centerLeft,
                                    ),
                                    onPressed: () => _handleSuggestionRoute(sugg.view),
                                    child: Text(sugg.label, style: const TextStyle(color: Color(0xFF3B82F6))),
                                  ),
                                )
                              ).toList(),
                            ]
                          ] else ...[
                            const Center(
                              child: Text(
                                "How can I help you navigate the dashboard today?",
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Color(0xFF64748B)),
                              ),
                            )
                          ],
                          
                          if (voiceState.error != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 16.0),
                              child: Text(
                                voiceState.error!,
                                style: const TextStyle(color: Colors.red),
                              ),
                            )
                        ],
                      ),
                    ),

                    // Input Field Footer
                    Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _textController,
                              decoration: InputDecoration(
                                hintText: "Type or speak...",
                                isDense: true,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              ),
                              onSubmitted: (val) {
                                ref.read(voiceProvider.notifier).submitTextCommand(val, currentView: _getCurrentView());
                                _textController.clear();
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            onPressed: () {
                              ref.read(voiceProvider.notifier).toggleListening(_getCurrentView());
                            },
                            icon: Icon(
                              voiceState.isListening ? LucideIcons.square : LucideIcons.mic,
                              color: voiceState.isListening ? Colors.red : const Color(0xFF0F172A),
                            ),
                          )
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
