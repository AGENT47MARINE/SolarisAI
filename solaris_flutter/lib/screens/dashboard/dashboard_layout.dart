import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/navigation/sidebar.dart';
import '../../widgets/navigation/top_nav.dart';
import '../../widgets/navigation/voice_assistant_overlay.dart';

class DashboardLayout extends StatefulWidget {
  final Widget child;

  const DashboardLayout({super.key, required this.child});

  @override
  State<DashboardLayout> createState() => _DashboardLayoutState();
}

class _DashboardLayoutState extends State<DashboardLayout> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    // Get the current route path
    final String currentRoute = GoRouterState.of(context).uri.toString();
    final bool isDesktop = MediaQuery.of(context).size.width > 1024;

    return VoiceAssistantOverlay(
      child: Scaffold(
        key: _scaffoldKey,
        drawer: isDesktop ? null : Drawer(child: SolarisSidebar(currentRoute: currentRoute)),
        body: Column(
          children: [
            SolarisTopNav(
              onMenuPressed: () {
                _scaffoldKey.currentState?.openDrawer();
              },
            ),
            Expanded(
              child: Row(
                children: [
                  if (isDesktop)
                    SolarisSidebar(currentRoute: currentRoute),
                  Expanded(
                    child: widget.child,
                  ),
                ],
              ),
            ),
          ],
        ),
      )
    );
  }
}
