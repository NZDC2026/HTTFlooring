import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';

import '../models/handover_proof.dart';

class HandoverFields extends StatefulWidget {
  const HandoverFields({
    super.key,
    required this.nameLabel,
    required this.signatureLabel,
    this.proof,
  });
  final String nameLabel;
  final String signatureLabel;
  final HandoverProof? proof;
  @override
  State<HandoverFields> createState() => HandoverFieldsState();
}

class HandoverFieldsState extends State<HandoverFields> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _mobile = TextEditingController();
  final List<List<double>> _points = [];
  bool _signatureError = false;
  @override
  void initState() {
    super.initState();
    _name.text = widget.proof?.name ?? '';
    _mobile.text = widget.proof?.mobile ?? '';
    _points.addAll(widget.proof?.points ?? []);
  }

  @override
  void dispose() {
    _name.dispose();
    _mobile.dispose();
    super.dispose();
  }

  void resetSignature() => setState(() => _points.clear());
  HandoverProof? validateAndRead() {
    final valid = _form.currentState!.validate();
    final signed = HandoverProof.hasSignature(_points);
    setState(() => _signatureError = !signed);
    if (!valid || !signed) return null;
    return HandoverProof(
      name: _name.text,
      mobile: _mobile.text,
      points: _points,
    );
  }

  @override
  Widget build(BuildContext context) {
    final readOnly = widget.proof != null;
    return Form(
      key: _form,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: _name,
            readOnly: readOnly,
            textCapitalization: TextCapitalization.words,
            decoration: InputDecoration(labelText: '${widget.nameLabel} *'),
            validator: (v) =>
                v == null || v.trim().isEmpty ? 'Enter a name.' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _mobile,
            readOnly: readOnly,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Mobile (optional)'),
          ),
          const SizedBox(height: 16),
          Text(
            '${widget.signatureLabel} *',
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          LayoutBuilder(
            builder: (context, constraints) => Semantics(
              label: widget.signatureLabel,
              child: Container(
                height: 180,
                width: double.infinity,
                clipBehavior: Clip.hardEdge,
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(
                    color: _signatureError ? Colors.red : Colors.grey,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: GestureDetector(
                  key: const ValueKey('handover-signature-pad'),
                  dragStartBehavior: DragStartBehavior.down,
                  behavior: HitTestBehavior.opaque,
                  onPanStart: readOnly
                      ? null
                      : (d) => setState(() {
                          _points.add([]);
                          _add(d.localPosition, constraints.maxWidth);
                        }),
                  onPanUpdate: readOnly
                      ? null
                      : (d) => setState(
                          () => _add(d.localPosition, constraints.maxWidth),
                        ),
                  child: CustomPaint(
                    painter: _SignaturePainter(List.of(_points)),
                    child: _points.isEmpty
                        ? const Center(child: Text('Sign here'))
                        : null,
                  ),
                ),
              ),
            ),
          ),
          if (_signatureError)
            const Text(
              'A handwritten signature is required.',
              style: TextStyle(color: Colors.red),
            ),
          if (!readOnly)
            TextButton.icon(
              onPressed: () => setState(() {
                _points.clear();
                _signatureError = false;
              }),
              icon: const Icon(Icons.refresh),
              label: const Text('Clear / Re-sign'),
            ),
          if (readOnly) Text('Signed: ${widget.proof!.signedAt.toLocal()}'),
        ],
      ),
    );
  }

  void _add(Offset p, double width) {
    _points.add([(p.dx / width).clamp(0.0, 1.0), (p.dy / 180).clamp(0.0, 1.0)]);
    _signatureError = false;
  }
}

class _SignaturePainter extends CustomPainter {
  _SignaturePainter(this.points);
  final List<List<double>> points;
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;
    Offset? previous;
    for (final p in points) {
      if (p.isEmpty) {
        previous = null;
        continue;
      }
      final current = Offset(p[0] * size.width, p[1] * size.height);
      if (previous != null) canvas.drawLine(previous, current, paint);
      previous = current;
    }
  }

  @override
  bool shouldRepaint(covariant _SignaturePainter oldDelegate) => true;
}
