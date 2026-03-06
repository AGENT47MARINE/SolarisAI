import 'package:flutter/material.dart';

class SolarisTopNav extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback onMenuPressed;

  const SolarisTopNav({super.key, required this.onMenuPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.black.withOpacity(0.05))),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SafeArea(
        child: Row(
          children: [
            if (MediaQuery.of(context).size.width <= 1024)
              IconButton(
                icon: const Icon(Icons.menu, color: Color(0xFF475569)),
                onPressed: onMenuPressed,
              ),
            
            const Spacer(),
            
            // Search
            Container(
              width: 250,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const TextField(
                decoration: InputDecoration(
                  hintText: 'Search...',
                  prefixIcon: Icon(Icons.search, size: 20, color: Color(0xFF64748B)),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
            const SizedBox(width: 16),
            
            // Notifications
            IconButton(
              icon: const Badge(
                child: Icon(Icons.notifications_outlined, color: Color(0xFF475569)),
              ),
              onPressed: () {},
            ),
            const SizedBox(width: 16),
            
            // Profile
            const CircleAvatar(
              backgroundColor: Color(0xFFE2E8F0),
              child: Icon(Icons.person, color: Color(0xFF64748B)),
            ),
            const SizedBox(width: 12),
            if (MediaQuery.of(context).size.width > 600)
              const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Admin User', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                  Text('Super Admin', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                ],
              ),
          ],
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
}
