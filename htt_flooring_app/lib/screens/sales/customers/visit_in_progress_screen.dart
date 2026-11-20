import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/customer_note.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_note_service.dart';
import '../../../widgets/sales_date_picker.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../home/sales_dashboard_support.dart';

/// The verified check-in remains on the server. Checkout details are retained
/// locally until the collaboration API supports structured visit outcomes.
class VisitInProgressScreen extends StatefulWidget {
  const VisitInProgressScreen({
    super.key,
    required this.customerId,
    required this.name,
    required this.checkedInAt,
    required this.photo,
    this.demo = false,
  });
  final String customerId, name;
  final DateTime checkedInAt;
  final Uint8List photo;
  final bool demo;
  @override
  State<VisitInProgressScreen> createState() => _VisitInProgressState();
}

class _VisitInProgressState extends State<VisitInProgressScreen> {
  final _notes = TextEditingController(), _next = TextEditingController();
  final _checked = <int>{};
  final _photos = <Uint8List>[];
  String? _outcome;
  String _type = 'Quotation / Order Follow-up';
  DateTime _due = DateUtils.dateOnly(
    DateTime.now().add(const Duration(days: 1)),
  );
  bool _follow = false, _saving = false, _ready = false, _leaving = false;
  Timer? _timer, _debounce;
  late DateTime _started = widget.checkedInAt;
  List<CustomerNote> _tasks = [];
  String get _key =>
      'active-visit-${context.read<AppSession>().currentUser.id}-${widget.customerId}';
  int get _minutes =>
      DateTime.now().difference(_started).inMinutes.clamp(1, 9999);
  static const _outcomes = [
    'Order placed',
    'Quote needed',
    'Swatches needed',
    'Follow up later',
    'Relationship visit',
    'No interest',
  ];
  static const _icons = [
    Icons.shopping_bag_outlined,
    Icons.description_outlined,
    Icons.inventory_2_outlined,
    Icons.schedule,
    Icons.handshake_outlined,
    Icons.block,
  ];
  List<(String, String)> get _items => [
    (
      widget.demo && widget.name == 'ABC Flooring'
          ? 'Showroom quote review'
          : 'Customer visit',
      'Reason for this visit',
    ),
    if (widget.demo && widget.name == 'ABC Flooring' && _tasks.isEmpty) ...[
      ('INV-10548 due today (\$8,682.96 incl. GST)', 'Payment · due 18 Nov'),
      (
        'Deliver Heritage Smoked Oak colour panel (DBR-0412)',
        'Swatches · due 18 Nov',
      ),
      (
        'Chase QT-1004 — John wants Bonita for the Mosman showroom',
        'Quote · due 18 Nov',
      ),
      ('Display board DBR-0415', 'Guardian · requested'),
    ],
    for (final task in _tasks)
      (
        task.content,
        '${task.followUpType ?? 'Follow-up'} · ${task.followUpDate == null ? 'No due date' : DateFormat('d MMM').format(task.followUpDate!)}',
      ),
  ];

  @override
  void initState() {
    super.initState();
    _notes.addListener(_changed);
    _next.addListener(_changed);
    WidgetsBinding.instance.addPostFrameCallback((_) => _restore());
    _timer = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  Future<void> _restore() async {
    _tasks = context
        .read<CustomerNoteService>()
        .getCustomerNotes(widget.customerId)
        .where((n) => n.isFollowUp && !n.isCompleted)
        .toList();
    try {
      final raw = (await SharedPreferences.getInstance()).getString(_key);
      if (!mounted) return;
      if (raw != null) {
        final saved = jsonDecode(raw) as Map<String, dynamic>;
        _started =
            DateTime.tryParse(saved['started'] as String? ?? '') ?? _started;
        _outcome = saved['outcome'] as String?;
        _notes.text = saved['notes'] as String? ?? '';
        _next.text = saved['next'] as String? ?? '';
        _type = saved['type'] as String? ?? _type;
        _due = DateTime.tryParse(saved['due'] as String? ?? '') ?? _due;
        _follow = saved['follow'] == true;
        _checked.addAll((saved['checked'] as List? ?? []).cast<int>());
        _photos.addAll(
          (saved['photos'] as List? ?? []).cast<String>().map(base64Decode),
        );
      }
    } catch (_) {
      // A stale local draft must not prevent access to a verified visit.
    }
    if (mounted) {
      setState(() => _ready = true);
      _changed();
    }
  }

  Map<String, dynamic> _record() => {
    'customerId': widget.customerId,
    'customerName': widget.name,
    'started': _started.toIso8601String(),
    'outcome': _outcome,
    'notes': _notes.text.trim(),
    'next': _next.text.trim(),
    'type': _type,
    'due': _due.toIso8601String(),
    'follow': _follow,
    'checked': _checked.toList(),
    'completedItems': [
      for (final i in _checked)
        if (i < _items.length) _items[i].$1,
    ],
    'photos': _photos.map(base64Encode).toList(),
    'checkInPhoto': base64Encode(widget.photo),
  };
  void _changed() {
    if (!_ready || _saving) return;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () async {
      try {
        await (await SharedPreferences.getInstance()).setString(
          _key,
          jsonEncode(_record()),
        );
      } catch (_) {
        /* A visible save error is shown on explicit checkout. */
      }
    });
  }

  void _update(VoidCallback action) {
    setState(action);
    _changed();
  }

  Future<void> _photo() async {
    final image = await ImagePicker().pickImage(
      source: ImageSource.camera,
      maxWidth: 1600,
      imageQuality: 80,
    );
    if (image == null) return;
    final bytes = await image.readAsBytes();
    if (mounted) _update(() => _photos.add(bytes));
  }

  Future<void> _leave() async {
    if (_saving) return;
    final leave = await showReferenceModal<bool>(
      context,
      (c) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Leave this visit?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            const Text(
              'Your check-in and draft are kept. Return to this customer to finish checking out.',
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(c, false),
                  child: const Text('Stay'),
                ),
                FilledButton(
                  onPressed: () => Navigator.pop(c, true),
                  child: const Text('Leave visit'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
    if (leave != true || !mounted) return;
    _debounce?.cancel();
    await (await SharedPreferences.getInstance()).setString(
      _key,
      jsonEncode(_record()),
    );
    if (!mounted) return;
    setState(() => _leaving = true);
    Navigator.pop(context, false);
  }

  Future<void> _checkout() async {
    if (_saving) return;
    if (_outcome == null || (_follow && _next.text.trim().isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _outcome == null
                ? 'Choose an outcome before checking out.'
                : 'Describe the next step.',
          ),
        ),
      );
      return;
    }
    setState(() => _saving = true);
    _debounce?.cancel();
    final service = context.read<CustomerNoteService>();
    final user = context.read<AppSession>().currentUser;
    final visitKey = _key;
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyKey = 'visit-checkout-history-${user.id}';
      final rows = jsonDecode(prefs.getString(historyKey) ?? '[]') as List;
      final record = {
        ..._record(),
        'ended': DateTime.now().toIso8601String(),
        'minutes': _minutes,
        'checkInPhoto': base64Encode(widget.photo),
      };
      rows.insert(0, record);
      await prefs.setString(historyKey, jsonEncode(rows));
      await prefs.remove(visitKey);
      service.addNote(
        customerId: widget.customerId,
        author: user,
        noteType: 'Customer Visit',
        content:
            'Visit · $_outcome · $_minutes min${_notes.text.trim().isEmpty ? '' : '\n${_notes.text.trim()}'}${_checked.isEmpty ? '' : '\nCompleted: ${record['completedItems'] is List ? (record['completedItems'] as List).join('; ') : ''}'}',
        attachments: [
          ActivityAttachment(
            name: 'Check-in photo',
            bytes: widget.photo,
            isPhoto: true,
          ),
          for (var i = 0; i < _photos.length; i++)
            ActivityAttachment(
              name: 'Visit photo ${i + 1}',
              bytes: _photos[i],
              isPhoto: true,
            ),
        ],
      );
      if (_follow) {
        service.addFollowUp(
          customerId: widget.customerId,
          actor: user,
          content: _next.text.trim(),
          followUpDate: _due,
          followUpType: _type,
          assignees: [user],
        );
      }
      if (!mounted) return;
      setState(() => _leaving = true);
      Navigator.pop(context, true);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Visit saved · $_minutes min')));
    } catch (_) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Could not save the visit. Your draft is kept. Try again.',
            ),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _debounce?.cancel();
    _notes.dispose();
    _next.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => PopScope(
    canPop: _leaving,
    onPopInvokedWithResult: (didPop, _) {
      if (!didPop) _leave();
    },
    child: Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar('Visit in progress'),
      body: !_ready
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: detailPale,
                      child: Text(
                        widget.name
                            .split(' ')
                            .where((s) => s.isNotEmpty)
                            .take(2)
                            .map((s) => s[0])
                            .join(),
                        style: const TextStyle(color: detailGreen),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const Text(
                            'Trade Customer',
                            style: TextStyle(color: detailMuted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  child: Text(
                    'Checked in ${DateFormat('h:mm a').format(_started)} · $_minutes min',
                    style: const TextStyle(fontSize: 12, color: detailMuted),
                  ),
                ),
                detailHeading(
                  'This visit',
                  action: '${_checked.length}/${_items.length} done',
                  top: 8,
                ),
                detailCard(
                  Column(
                    children: [
                      for (var i = 0; i < _items.length; i++)
                        CheckboxListTile(
                          value: _checked.contains(i),
                          onChanged: _saving
                              ? null
                              : (v) => _update(() {
                                  v == true
                                      ? _checked.add(i)
                                      : _checked.remove(i);
                                }),
                          controlAffinity: ListTileControlAffinity.leading,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 8,
                          ),
                          title: Text(
                            _items[i].$1,
                            style: const TextStyle(fontSize: 13),
                          ),
                          subtitle: Text(
                            _items[i].$2,
                            style: const TextStyle(
                              fontSize: 11,
                              color: detailMuted,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                if (widget.demo && widget.name == 'ABC Flooring')
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: detailCard(
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Last visit · 15 Nov',
                            style: TextStyle(fontSize: 11, color: detailMuted),
                          ),
                          SizedBox(height: 5),
                          Text(
                            'Reviewed Bonita stock for the showroom refit. Order SO-2051 confirmed.',
                            style: TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(12),
                    ),
                  ),
                detailHeading('Outcome *'),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 3.3,
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  children: [
                    for (var i = 0; i < _outcomes.length; i++)
                      OutlinedButton.icon(
                        onPressed: _saving
                            ? null
                            : () => _update(() => _outcome = _outcomes[i]),
                        icon: Icon(_icons[i], size: 16),
                        label: Text(
                          _outcomes[i],
                          style: const TextStyle(fontSize: 11),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          foregroundColor: detailGreen,
                          backgroundColor: _outcome == _outcomes[i]
                              ? detailPale
                              : Colors.white,
                          side: BorderSide(
                            color: _outcome == _outcomes[i]
                                ? detailGreen
                                : detailLine,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(9),
                          ),
                        ),
                      ),
                  ],
                ),
                detailHeading('Notes'),
                TextField(
                  controller: _notes,
                  maxLines: 4,
                  decoration: detailInput(),
                ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    onPressed: () async {
                      try {
                        await _photo();
                      } catch (_) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Could not open camera. Check camera access and try again.',
                              ),
                            ),
                          );
                        }
                      }
                    },
                    icon: const Icon(Icons.add_a_photo_outlined, size: 17),
                    label: const Text('Add photo'),
                  ),
                ),
                if (_photos.isNotEmpty)
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (var i = 0; i < _photos.length; i++)
                        Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.memory(
                                _photos[i],
                                width: 80,
                                height: 80,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Positioned(
                              right: 0,
                              top: 0,
                              child: IconButton.filledTonal(
                                onPressed: () =>
                                    _update(() => _photos.removeAt(i)),
                                icon: const Icon(Icons.close, size: 14),
                                tooltip: 'Remove photo',
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                detailHeading('Next step'),
                Wrap(
                  spacing: 8,
                  children: [
                    for (final follow in [false, true])
                      ChoiceChip(
                        label: Text(follow ? 'Create follow-up' : 'None'),
                        selected: _follow == follow,
                        onSelected: (_) => _update(() => _follow = follow),
                      ),
                  ],
                ),
                if (_follow) ...[
                  detailLabel('Type'),
                  DropdownButtonFormField<String>(
                    initialValue: _type,
                    decoration: detailInput(),
                    items: [
                      for (final type in [
                        'Customer Visit',
                        'Swatch Delivery',
                        'Quotation / Order Follow-up',
                        'Payment Follow-up',
                        'Product Enquiry',
                        'Customer Complaint',
                        'Special Price',
                        'Other',
                      ])
                        DropdownMenuItem(
                          value: type,
                          child: Text(
                            type,
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                    ],
                    onChanged: (v) => _update(() => _type = v!),
                  ),
                  detailLabel('Due date'),
                  OutlinedButton(
                    onPressed: () async {
                      final date = await pickSalesDate(
                        context: context,
                        initialDate: _due,
                        firstDate: DateTime.now().subtract(
                          const Duration(days: 1),
                        ),
                        lastDate: DateTime.now().add(
                          const Duration(days: 3650),
                        ),
                      );
                      if (date != null && mounted) _update(() => _due = date);
                    },
                    child: Text(DateFormat('d MMM yyyy').format(_due)),
                  ),
                  detailLabel('What needs to happen?'),
                  TextField(controller: _next, decoration: detailInput()),
                ],
                const Padding(
                  padding: EdgeInsets.only(top: 18),
                  child: Text(
                    "Ticked items are saved to the visit record. Finish checking out before leaving the site.",
                    style: TextStyle(fontSize: 11, color: detailMuted),
                  ),
                ),
              ],
            ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _saving ? null : _leave,
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 2,
                child: FilledButton(
                  onPressed: _ready && !_saving ? _checkout : null,
                  style: FilledButton.styleFrom(backgroundColor: detailGreen),
                  child: Text(
                    _saving ? 'Saving…' : 'Check out · $_minutes min',
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
