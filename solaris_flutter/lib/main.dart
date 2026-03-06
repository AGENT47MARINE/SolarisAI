import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Screens (To be implemented)
import 'screens/dashboard/main_dashboard_screen.dart';
import 'screens/dashboard/plant_dashboard_screen.dart';
import 'screens/dashboard/dashboard_layout.dart';
import 'screens/dashboard/inverter_detail_screen.dart';
import 'screens/alerts/global_alerts_screen.dart';
import 'screens/sensors/sensors_screen.dart';
import 'screens/analytics/ct_analysis_screen.dart';
import 'screens/analytics/voltage_grid_screen.dart';
import 'screens/dashboard/plants_screen.dart';
import 'screens/dashboard/map_screen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: SolarisApp(),
    ),
  );
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return DashboardLayout(child: child);
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const MainDashboardScreen(),
        ),
        GoRoute(
          path: '/plants/:id',
          builder: (context, state) {
            final plantId = state.pathParameters['id']!;
            return PlantDashboardScreen(plantId: plantId);
          },
        ),
        GoRoute(
          path: '/devices/:id',
          builder: (context, state) {
            final deviceId = state.pathParameters['id']!;
            return InverterDetailScreen(deviceId: deviceId);
          },
        ),
        GoRoute(
          path: '/alerts',
          builder: (context, state) => const GlobalAlertsScreen(),
        ),
        GoRoute(
          path: '/sensors',
          builder: (context, state) => const SensorsScreen(),
        ),
        GoRoute(
          path: '/plants',
          builder: (context, state) => const PlantsScreen(),
        ),
        GoRoute(
          path: '/map',
          builder: (context, state) => const MapScreen(),
        ),
        GoRoute(
          path: '/analytics/ct/:id',
          builder: (context, state) {
            final deviceId = state.pathParameters['id']!;
            return CTAnalysisScreen(deviceId: deviceId);
          },
        ),
        GoRoute(
          path: '/analytics/voltage/:id',
          builder: (context, state) {
            final deviceId = state.pathParameters['id']!;
            return VoltageGridScreen(deviceId: deviceId);
          },
        ),
      ],
    ),
  ],
);

class SolarisApp extends StatelessWidget {
  const SolarisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'SolarisAI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2196F3)),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF0F4F8),
        fontFamily: 'Inter',
      ),
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}
