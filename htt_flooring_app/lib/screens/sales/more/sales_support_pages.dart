part of 'sales_more_screen.dart';

class _MoreInfoScreen extends StatefulWidget {
  const _MoreInfoScreen({this.help = false});
  final bool help;
  @override
  State<_MoreInfoScreen> createState() => _MoreInfoState();
}

class _MoreInfoState extends State<_MoreInfoScreen> {
  final _feedback = TextEditingController();
  final Set<int> _expanded = {};
  bool _saving = false;
  @override
  void dispose() {
    _feedback.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final text = _feedback.text.trim();
    if (text.isEmpty || _saving) return;
    setState(() => _saving = true);
    final user = context.read<AppSession>().currentUser;
    final service = context.read<CustomerNoteService>();
    try {
      final prefs = await SharedPreferences.getInstance();
      final key = 'sales-feedback-${user.id}';
      final rows = jsonDecode(prefs.getString(key) ?? '[]') as List;
      rows.insert(0, {'text': text, 'at': DateTime.now().toIso8601String()});
      await prefs.setString(key, jsonEncode(rows));
      service.addNote(
        customerId: '',
        content: 'Feedback: $text',
        noteType: 'Other',
        author: user,
      );
      if (mounted) {
        _feedback.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Feedback saved to activity log.')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.white,
    appBar: dashboardBar(widget.help ? 'Help & support' : 'About'),
    body: widget.help
        ? ListView(
            padding: const EdgeInsets.all(12),
            children: [
              detailHeading('Common questions', top: 0),
              detailCard(
                Column(
                  children: [
                    for (var i = 0; i < _questions.length; i++)
                      Column(
                        children: [
                          if (i > 0)
                            const Divider(height: 1, color: detailLine),
                          ListTile(
                            dense: true,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12,
                            ),
                            title: Text(
                              _questions[i].$1,
                              style: const TextStyle(fontSize: 13),
                            ),
                            trailing: DetailGlyph(
                              _expanded.contains(i) ? 'down' : 'chevron',
                              size: 14,
                              color: detailMuted,
                            ),
                            onTap: () => setState(
                              () => _expanded.contains(i)
                                  ? _expanded.remove(i)
                                  : _expanded.add(i),
                            ),
                          ),
                          if (_expanded.contains(i))
                            Padding(
                              padding: const EdgeInsets.fromLTRB(12, 0, 12, 14),
                              child: Text(
                                _questions[i].$2,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: detailMuted,
                                  height: 1.5,
                                ),
                              ),
                            ),
                        ],
                      ),
                  ],
                ),
              ),
              detailHeading('Send feedback'),
              TextField(
                controller: _feedback,
                minLines: 4,
                maxLines: 8,
                onChanged: (_) => setState(() {}),
                decoration: detailInput(hint: 'What can we improve?'),
              ),
              const SizedBox(height: 12),
              detailAction(
                _saving ? 'Saving…' : 'Save feedback',
                'doc',
                _saving || _feedback.text.trim().isEmpty ? null : _save,
                filled: true,
              ),
              const SizedBox(height: 9),
              const Text(
                'In this prototype feedback is saved to the activity log.',
                style: TextStyle(fontSize: 11, color: detailMuted),
              ),
            ],
          )
        : Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: detailGreen,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(
                        child: DetailGlyph(
                          'layers',
                          color: Colors.white,
                          size: 23,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'HTT Flooring Sales',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Text(
                  'Version 2.0 · prototype',
                  style: TextStyle(fontSize: 13, color: detailMuted),
                ),
                const SizedBox(height: 7),
                const Text(
                  'Build 18 Nov 2026',
                  style: TextStyle(fontSize: 12, color: detailMuted),
                ),
              ],
            ),
          ),
  );
  static const _questions = [
    (
      'How does check-in work?',
      'Open the customer, tap Check in and take an on-site photo. Record the outcome and notes, then Check out. The visit time and outcome are saved to the customer’s Activities.',
    ),
    (
      'Why can’t I save a lower price?',
      'Each product has a floor price for your role. Below it, submit the price for manager approval with a reason. It takes effect once approved.',
    ),
    (
      'When is stock reserved?',
      'Stock is reserved when the office raises the order, or when you put it on hold for a customer. Quotes alone do not reserve stock.',
    ),
    (
      'What does "On hold" mean?',
      'The customer has invoices more than 60 days overdue or is over their credit limit. New orders need manager approval.',
    ),
  ];
}
