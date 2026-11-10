import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';

/// Native CRM presentation shared by sales and warehouse, without shared state.
class CrmBackdrop extends StatelessWidget {
  const CrmBackdrop({super.key, required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) => Stack(
    children: [
      const Positioned.fill(child: CustomPaint(painter: _FlooringBackdrop())),
      child,
    ],
  );
}

class CrmBrandMark extends StatelessWidget {
  const CrmBrandMark({super.key});
  @override
  Widget build(BuildContext context) => Semantics(
    label: 'HTT',
    child: SizedBox(
      width: 30,
      height: 30,
      child: Transform.rotate(
        angle: math.pi / 4,
        child: Stack(
          children: [
            Positioned(
              left: 3,
              top: 8,
              width: 11,
              height: 26,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1DDE8B), Color(0xFF00A968)],
                  ),
                ),
              ),
            ),
            Positioned(
              left: 16,
              top: 0,
              width: 11,
              height: 26,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF11BD78), Color(0xFF007449)],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class CrmBottomNavigation extends StatelessWidget {
  const CrmBottomNavigation({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.destinations,
  });
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final List<Widget> destinations;
  @override
  Widget build(BuildContext context) => DecoratedBox(
    decoration: const BoxDecoration(
      color: AppColors.green,
      borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      boxShadow: [
        BoxShadow(
          color: Color(0x18002E21),
          blurRadius: 20,
          offset: Offset(0, -4),
        ),
      ],
    ),
    child: ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
      child: NavigationBarTheme(
        data: NavigationBarThemeData(
          backgroundColor: Colors.transparent,
          surfaceTintColor: Colors.transparent,
          indicatorColor: const Color(0xFF087D50),
          indicatorShape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          iconTheme: const WidgetStatePropertyAll(
            IconThemeData(color: Colors.white, size: 26),
          ),
          labelTextStyle: WidgetStateProperty.resolveWith(
            (states) => TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: states.contains(WidgetState.selected)
                  ? FontWeight.w700
                  : FontWeight.w500,
            ),
          ),
        ),
        child: NavigationBar(
          selectedIndex: selectedIndex,
          onDestinationSelected: onDestinationSelected,
          height: 78,
          backgroundColor: Colors.transparent,
          destinations: destinations,
        ),
      ),
    ),
  );
}

class _FlooringBackdrop extends CustomPainter {
  const _FlooringBackdrop();
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
      Offset.zero & size,
      Paint()..color = const Color(0xFFF7F8F6),
    );
    final header = Rect.fromLTWH(0, 0, size.width, 268);
    canvas.drawRect(
      header,
      Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFF003C2C), Color(0xFF002D23)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ).createShader(header),
    );
    // Vector flooring detail remains crisp and bundled offline on mobile.
    canvas.save();
    canvas.clipRect(header);
    canvas.translate(size.width * .83, 102);
    canvas.rotate(-math.pi / 3.2);
    for (var i = 0; i < 5; i++) {
      final board = Rect.fromLTWH(i * 37.0, -115, 35, 470);
      canvas.drawRect(
        board,
        Paint()
          ..shader = LinearGradient(
            colors: [
              const Color(0xFFBD9567),
              const Color(0xFFE8C99F),
              const Color(0xFFA97946),
            ],
            stops: const [0, .55, 1],
          ).createShader(board),
      );
      for (var j = 0; j < 6; j++) {
        canvas.drawLine(
          Offset(i * 37.0 + 3 + j * 5, -115),
          Offset(i * 37.0 + 4 + j * 5, 355),
          Paint()
            ..color = const Color(0x22804A20)
            ..strokeWidth = .6,
        );
      }
    }
    canvas.restore();
    canvas.drawRect(
      header,
      Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFF003C2C), Color(0xF0003C2C), Color(0x00003C2C)],
          stops: [0, .46, 1],
        ).createShader(header),
    );
    final fade = Rect.fromLTWH(0, 128, size.width, 140);
    canvas.drawRect(
      fade,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0x00F7F8F6), Color(0xFFF7F8F6)],
        ).createShader(fade),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
