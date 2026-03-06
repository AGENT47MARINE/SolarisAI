import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SolarisSidebar extends StatelessWidget {
  final String currentRoute;

  const SolarisSidebar({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      color: Colors.white,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
            alignment: Alignment.centerLeft,
            child: Row(
              children: [
                Icon(Icons.solar_power, color: Theme.of(context).primaryColor, size: 28),
                const SizedBox(width: 12),
                const Text(
                  'SolarisAI',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _buildNavItem(context, 'Dashboard', Icons.dashboard, '/'),
                _buildNavItem(context, 'Plants', Icons.domain, '/plants'),
                _buildNavItem(context, 'Sensors', Icons.sensors, '/sensors'),
                _buildNavItem(context, 'Alerts', Icons.warning_amber_rounded, '/alerts'),
                _buildNavItem(context, 'Map', Icons.map, '/map'),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text('Logout', style: TextStyle(color: Colors.redAccent)),
              onTap: () {
                // Implement Logout
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, String title, IconData icon, String path) {
    bool isSelected = currentRoute == path || (path != '/' && currentRoute.startsWith(path));

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        selected: isSelected,
        selectedTileColor: Theme.of(context).primaryColor.withOpacity(0.1),
        leading: Icon(icon, color: isSelected ? Theme.of(context).primaryColor : const Color(0xFF64748B)),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? Theme.of(context).primaryColor : const Color(0xFF475569),
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        onTap: () {
          if (!isSelected) {
            context.go(path);
          }
        },
      ),
    );
  }
}
