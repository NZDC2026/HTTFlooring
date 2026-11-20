import 'package:flutter/services.dart';

import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';

const detailGreen = Color(0xFF103F33);
const detailMuted = Color(0xFF6B7771);
const detailLine = Color(0xFFE3E8E5);
const detailPale = Color(0xFFE8F2EC);

Widget detailCard(Widget child, {EdgeInsets padding = EdgeInsets.zero}) =>
    Container(
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: detailLine),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 3,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(type: MaterialType.transparency, child: child),
    );
Widget detailHeading(
  String text, {
  String? action,
  VoidCallback? onTap,
  double top = 18,
}) => Padding(
  padding: EdgeInsets.fromLTRB(2, top, 2, 8),
  child: Row(
    children: [
      Expanded(
        child: Text(
          text,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      if (action != null)
        InkWell(
          onTap: onTap,
          child: Text(
            action,
            style: TextStyle(
              fontSize: 11,
              color: onTap == null ? detailMuted : detailGreen,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
    ],
  ),
);
Widget detailBadge(
  String text, {
  Color color = detailGreen,
  Color background = detailPale,
}) => Container(
  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
  decoration: BoxDecoration(
    color: background,
    borderRadius: BorderRadius.circular(5),
  ),
  child: Text(text, style: TextStyle(fontSize: 10, height: 1.2, color: color)),
);
Widget detailLabel(String text, {bool required = false}) => Padding(
  padding: const EdgeInsets.only(top: 18, bottom: 7),
  child: Text.rich(
    TextSpan(
      children: [
        TextSpan(text: text),
        if (required)
          const TextSpan(
            text: ' *',
            style: TextStyle(color: detailGreen),
          ),
      ],
    ),
    style: const TextStyle(fontSize: 12, color: Color(0xFF37433D)),
  ),
);
InputDecoration detailInput({String? hint}) => InputDecoration(
  hintText: hint,
  hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF9AA39E)),
  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
  isDense: true,
  filled: true,
  fillColor: Colors.white,
  enabledBorder: OutlineInputBorder(
    borderRadius: BorderRadius.circular(10),
    borderSide: const BorderSide(color: detailLine),
  ),
  border: OutlineInputBorder(
    borderRadius: BorderRadius.circular(10),
    borderSide: const BorderSide(color: detailLine),
  ),
);
Future<T?> showDetailSheet<T>(
  BuildContext context,
  Widget Function(BuildContext) builder,
) async {
  final route = RawDialogRoute<T>(
    barrierDismissible: true,
    barrierLabel: 'Close',
    barrierColor: const Color(0x66000000),
    transitionDuration: const Duration(milliseconds: 160),
    pageBuilder: (sheet, _, _) => Stack(
      children: [
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
            child: GestureDetector(
              onTap: () => Navigator.pop(sheet),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),
        Align(
          alignment: Alignment.bottomCenter,
          child: Material(
            color: Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(23)),
            child: SafeArea(
              top: false,
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.sizeOf(sheet).height * .85,
                ),
                child: SingleChildScrollView(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      20,
                      12,
                      20,
                      20 + MediaQuery.viewInsetsOf(sheet).bottom,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Container(
                            width: 38,
                            height: 4,
                            margin: const EdgeInsets.only(bottom: 18),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD5DDDA),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        builder(sheet),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );
  final result = await Navigator.of(
    context,
    rootNavigator: true,
  ).push<T>(route);
  await route.completed;
  return result;
}

Future<T?> showReferenceModal<T>(
  BuildContext context,
  Widget Function(BuildContext) builder,
) async {
  final route = RawDialogRoute<T>(
    barrierDismissible: true,
    barrierLabel: 'Close',
    barrierColor: const Color(0x66000000),
    transitionDuration: const Duration(milliseconds: 160),
    pageBuilder: (sheet, _, _) => Stack(
      children: [
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
            child: GestureDetector(
              onTap: () => Navigator.pop(sheet),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              clipBehavior: Clip.antiAlias,
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.sizeOf(sheet).height * .85,
                ),
                child: SingleChildScrollView(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      20,
                      20,
                      20,
                      20 + MediaQuery.viewInsetsOf(sheet).bottom,
                    ),
                    child: builder(sheet),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );
  final result = await Navigator.of(
    context,
    rootNavigator: true,
  ).push<T>(route);
  await route.completed;
  return result;
}

Widget detailAction(
  String label,
  String glyph,
  VoidCallback? onTap, {
  bool filled = false,
}) => SizedBox(
  height: 40,
  child: OutlinedButton(
    onPressed: onTap,
    style: OutlinedButton.styleFrom(
      backgroundColor: filled ? detailGreen : Colors.white,
      foregroundColor: filled ? Colors.white : detailGreen,
      disabledBackgroundColor: const Color(0xFFF0F2F1),
      disabledForegroundColor: detailMuted,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      minimumSize: const Size(0, 40),
      side: const BorderSide(color: detailLine),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (label != 'Cancel') ...[
          DetailGlyph(
            glyph,
            size: 15,
            color: onTap == null
                ? detailMuted
                : filled
                ? Colors.white
                : detailGreen,
          ),
          const SizedBox(width: 7),
        ],
        Flexible(
          child: Text(
            label,
            maxLines: 2,
            textAlign: TextAlign.center,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ),
      ],
    ),
  ),
);

class DetailGlyph extends StatelessWidget {
  const DetailGlyph(
    this.kind, {
    super.key,
    this.size = 20,
    this.color = detailGreen,
  });
  final String kind;
  final double size;
  final Color color;
  @override
  Widget build(BuildContext context) => Center(
    widthFactor: 1,
    heightFactor: 1,
    child: SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _DetailPainter(kind, color)),
    ),
  );
}

class _DetailPainter extends CustomPainter {
  _DetailPainter(this.kind, this.color);
  final String kind;
  final Color color;
  @override
  void paint(Canvas c, Size size) {
    c.scale(size.width / 24, size.height / 24);
    final p = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final path = Path();
    void line(double a, double b, double x, double y) {
      path.moveTo(a, b);
      path.lineTo(x, y);
    }

    switch (kind) {
      case 'close':
        line(5, 5, 19, 19);
        line(19, 5, 5, 19);
      case 'camera':
        path.moveTo(3, 7);
        path.lineTo(7, 7);
        path.lineTo(9, 4);
        path.lineTo(15, 4);
        path.lineTo(17, 7);
        path.lineTo(21, 7);
        path.lineTo(21, 20);
        path.lineTo(3, 20);
        path.close();
        c.drawCircle(const Offset(12, 13), 4, p);
      case 'phone':
        path.moveTo(6, 3);
        path.lineTo(3, 5);
        path.cubicTo(2, 12, 12, 22, 19, 21);
        path.lineTo(21, 18);
        path.lineTo(16, 14);
        path.lineTo(13, 17);
        path.cubicTo(9, 15, 7, 13, 6, 10);
        path.lineTo(9, 7);
        path.close();
      case 'mail':
        path.addRRect(
          RRect.fromRectAndRadius(
            const Rect.fromLTWH(3, 5, 18, 14),
            const Radius.circular(2),
          ),
        );
        path.moveTo(3, 6);
        path.lineTo(12, 13);
        path.lineTo(21, 6);
      case 'pin':
        path.moveTo(12, 22);
        path.cubicTo(8, 17, 4, 13, 4, 9);
        path.cubicTo(4, -1, 20, -1, 20, 9);
        path.cubicTo(20, 13, 16, 17, 12, 22);
        c.drawCircle(const Offset(12, 9), 2.5, p);
      case 'go':
        path.moveTo(12, 2);
        path.lineTo(22, 12);
        path.lineTo(12, 22);
        path.lineTo(2, 12);
        path.close();
        path.moveTo(8, 15);
        path.lineTo(8, 10);
        path.lineTo(16, 10);
        path.moveTo(13, 7);
        path.lineTo(16, 10);
        path.lineTo(13, 13);
      case 'plus':
        line(12, 4, 12, 20);
        line(4, 12, 20, 12);
      case 'check':
        path.moveTo(5, 12);
        path.lineTo(10, 17);
        path.lineTo(20, 6);
      case 'chevron':
        path.moveTo(9, 5);
        path.lineTo(16, 12);
        path.lineTo(9, 19);
      case 'down':
        path.moveTo(5, 9);
        path.lineTo(12, 16);
        path.lineTo(19, 9);
      case 'clock':
        c.drawCircle(const Offset(12, 12), 9, p);
        line(12, 6, 12, 12);
        line(12, 12, 17, 15);
      case 'person':
        c.drawCircle(const Offset(12, 6), 4, p);
        path.moveTo(3, 22);
        path.cubicTo(3, 10, 21, 10, 21, 22);
      case 'box':
        path.moveTo(12, 2);
        path.lineTo(21, 7);
        path.lineTo(21, 17);
        path.lineTo(12, 22);
        path.lineTo(3, 17);
        path.lineTo(3, 7);
        path.close();
        line(3, 7, 12, 12);
        line(12, 12, 21, 7);
        line(12, 12, 12, 22);
      case 'layers':
        path.moveTo(3, 7);
        path.lineTo(12, 2);
        path.lineTo(21, 7);
        path.lineTo(12, 12);
        path.close();
        path.moveTo(3, 12);
        path.lineTo(12, 17);
        path.lineTo(21, 12);
        path.moveTo(3, 17);
        path.lineTo(12, 22);
        path.lineTo(21, 17);
      case 'search':
        c.drawCircle(const Offset(10, 10), 6, p);
        line(15, 15, 21, 21);
      case 'more':
        for (final y in [5.0, 12.0, 19.0]) {
          c.drawCircle(Offset(12, y), 1.4, Paint()..color = color);
        }
      case 'calendar':
        path.addRRect(
          RRect.fromRectAndRadius(
            const Rect.fromLTWH(3, 5, 18, 16),
            const Radius.circular(2),
          ),
        );
        line(3, 10, 21, 10);
        line(8, 3, 8, 7);
        line(16, 3, 16, 7);
        path.moveTo(8, 15);
        path.lineTo(11, 18);
        path.lineTo(16, 13);
      default:
        path.moveTo(5, 3);
        path.lineTo(15, 3);
        path.lineTo(20, 8);
        path.lineTo(20, 21);
        path.lineTo(5, 21);
        path.close();
        line(15, 3, 15, 8);
        line(15, 8, 20, 8);
        line(8, 12, 16, 12);
        line(8, 16, 15, 16);
    }
    c.drawPath(path, p);
  }

  @override
  bool shouldRepaint(_DetailPainter old) =>
      old.kind != kind || old.color != color;
}

class DetailQuantity extends StatefulWidget {
  const DetailQuantity({
    super.key,
    required this.value,
    required this.onChanged,
    required this.label,
  });
  final int value;
  final ValueChanged<int> onChanged;
  final String label;
  @override
  State<DetailQuantity> createState() => _DetailQuantityState();
}

class _DetailQuantityState extends State<DetailQuantity> {
  late final _control = TextEditingController(text: '${widget.value}');
  final _focus = FocusNode();
  @override
  void didUpdateWidget(covariant DetailQuantity old) {
    super.didUpdateWidget(old);
    if (int.tryParse(_control.text) != widget.value &&
        (_control.text.isNotEmpty || !_focus.hasFocus)) {
      _control.text = '${widget.value}';
    }
  }

  @override
  void dispose() {
    _control.dispose();
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      SizedBox(
        width: 30,
        height: 32,
        child: IconButton(
          tooltip: 'Decrease ${widget.label}',
          padding: EdgeInsets.zero,
          icon: const Text('−', style: TextStyle(fontSize: 18)),
          onPressed: widget.value > 0
              ? () => widget.onChanged(widget.value - 1)
              : null,
        ),
      ),
      SizedBox(
        width: 38,
        child: TextField(
          controller: _control,
          focusNode: _focus,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(3),
          ],
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12),
          decoration: InputDecoration(
            semanticCounterText: widget.label,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 6),
            border: const OutlineInputBorder(borderSide: BorderSide.none),
            enabledBorder: const OutlineInputBorder(
              borderSide: BorderSide.none,
            ),
          ),
          onChanged: (s) => widget.onChanged(int.tryParse(s) ?? 0),
          onEditingComplete: () {
            if (_control.text.isEmpty) _control.text = '0';
            _focus.unfocus();
          },
        ),
      ),
      SizedBox(
        width: 30,
        height: 32,
        child: IconButton(
          tooltip: 'Increase ${widget.label}',
          padding: EdgeInsets.zero,
          icon: const Text('+', style: TextStyle(fontSize: 18)),
          onPressed: widget.value < 999
              ? () => widget.onChanged(widget.value + 1)
              : null,
        ),
      ),
    ],
  );
}
