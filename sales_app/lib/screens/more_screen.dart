import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/sales_user.dart';
import '../services/sales_session.dart';
import '../theme/app_theme.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('More'),
        automaticallyImplyLeading: false,
      ),

      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(
            children: [
              const CircleAvatar(
                radius: 28,
                backgroundColor: AppColors.copperLight,
                child: Icon(Icons.person, color: AppColors.copper),
              ),

              const SizedBox(width: 14),

              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    session.salespersonName,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),

                  const Text('Sales', style: TextStyle(color: AppColors.muted)),

                  Text(
                    '${session.regionName} Region 🔒',
                    style: const TextStyle(color: AppColors.muted),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 30),

          const Text(
            'Development',
            style: TextStyle(fontWeight: FontWeight.w700),
          ),

          const SizedBox(height: 10),

          ListTile(
            tileColor: AppColors.card,
            title: const Text('Test Region'),
            subtitle: Text(session.regionName),
            trailing: const Icon(Icons.swap_horiz),

            onTap: () {
              final nextRegion = session.region == SalesRegion.sydney
                  ? SalesRegion.melbourne
                  : SalesRegion.sydney;

              session.switchDevelopmentRegion(nextRegion);
            },
          ),
        ],
      ),
    );
  }
}
