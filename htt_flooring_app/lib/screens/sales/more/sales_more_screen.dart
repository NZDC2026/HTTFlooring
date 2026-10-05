import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/sales_user.dart';
import '../../../services/app_session.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';

class SalesMoreScreen extends StatelessWidget {
  const SalesMoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appSession = context.watch<AppSession>();
    final salesSession = context.watch<SalesSession>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('More'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        children: [
          _profileCard(
            name: appSession.userName,
            role: appSession.roleLabel,
            region: salesSession.regionName,
          ),

          const SizedBox(height: 28),

          _menuGroup(
            children: [
              _menuItem(
                icon: Icons.cloud_off_outlined,
                title: 'Offline Data',
                subtitle: 'Available offline',
                trailing: Switch(value: true, onChanged: (_) {}),
              ),
              _divider(),
              _menuItem(
                icon: Icons.sync,
                title: 'Sync Now',
                subtitle: 'Sync customer and sales data',
              ),
              _divider(),
              _menuItem(
                icon: Icons.settings_outlined,
                title: 'App Settings',
                subtitle: 'Notifications and preferences',
              ),
              _divider(),
              _menuItem(
                icon: Icons.help_outline,
                title: 'Help & Support',
                subtitle: 'Get help with HTT Flooring',
              ),
              _divider(),
              _menuItem(
                icon: Icons.info_outline,
                title: 'About',
                subtitle: 'Version 1.0',
              ),
            ],
          ),

          if (kDebugMode) ...[
            const SizedBox(height: 28),

            const Text(
              'Development',
              style: TextStyle(
                color: AppColors.text,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 10),

            _menuGroup(
              children: [
                _menuItem(
                  icon: Icons.warehouse_outlined,
                  title: 'Switch to Warehouse User',
                  subtitle: 'Li Wei · Warehouse Staff · Sydney',
                  onTap: () {
                    context.read<AppSession>().switchToWarehouse();
                  },
                ),
                _divider(),
                _menuItem(
                  icon: Icons.location_on_outlined,
                  title: 'Test Sales Region',
                  subtitle: 'Currently ${salesSession.regionName}',
                  onTap: () {
                    final nextRegion = salesSession.region == SalesRegion.sydney
                        ? SalesRegion.melbourne
                        : SalesRegion.sydney;

                    salesSession.switchDevelopmentRegion(nextRegion);
                  },
                ),
              ],
            ),
          ],

          const SizedBox(height: 30),

          const Center(
            child: Text(
              'HTT Flooring',
              style: TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ),

          const SizedBox(height: 4),

          const Center(
            child: Text(
              'Prototype',
              style: TextStyle(color: AppColors.muted, fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }

  Widget _profileCard({
    required String name,
    required String role,
    required String region,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 28,
            backgroundColor: AppColors.copperLight,
            child: Icon(
              Icons.person_outline,
              color: AppColors.copper,
              size: 29,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    color: AppColors.text,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  role,
                  style: const TextStyle(color: AppColors.muted, fontSize: 13),
                ),
                const SizedBox(height: 5),
                Text(
                  '$region Store',
                  style: const TextStyle(
                    color: AppColors.green,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _menuGroup({required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(children: children),
    );
  }

  Widget _menuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    VoidCallback? onTap,
    Widget? trailing,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.ivory,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Icon(icon, color: AppColors.green, size: 21),
      ),
      title: Text(
        title,
        style: const TextStyle(
          color: AppColors.text,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 3),
        child: Text(
          subtitle,
          style: const TextStyle(color: AppColors.muted, fontSize: 11),
        ),
      ),
      trailing:
          trailing ?? const Icon(Icons.chevron_right, color: AppColors.muted),
      onTap: onTap,
    );
  }

  Widget _divider() {
    return const Divider(height: 1, indent: 68, color: AppColors.border);
  }
}
