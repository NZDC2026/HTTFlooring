import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/customer.dart';
import '../models/customer_note.dart';
import '../services/customer_note_service.dart';
import '../theme/app_theme.dart';

class CustomerNotesScreen extends StatelessWidget {
  final Customer customer;

  const CustomerNotesScreen({super.key, required this.customer});

  @override
  Widget build(BuildContext context) {
    final noteService = context.watch<CustomerNoteService>();

    final notes = noteService.getCustomerNotes(customer.id);

    final pendingCount = notes
        .where((note) => note.isFollowUp && !note.isCompleted)
        .length;

    final completedCount = notes
        .where((note) => note.isFollowUp && note.isCompleted)
        .length;

    return Scaffold(
      appBar: AppBar(title: const Text('Notes & Follow-ups')),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.green,
        foregroundColor: Colors.white,
        onPressed: () {
          _showAddMenu(context);
        },
        icon: const Icon(Icons.add),
        label: const Text('Add'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            customer.businessName,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 25,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 4),

          const Text(
            'Customer notes and follow-up activity',
            style: TextStyle(color: AppColors.muted),
          ),

          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  label: 'NOTES',
                  value: notes
                      .where((note) => !note.isFollowUp)
                      .length
                      .toString(),
                ),
              ),

              const SizedBox(width: 8),

              Expanded(
                child: _SummaryCard(
                  label: 'PENDING',
                  value: pendingCount.toString(),
                  warning: pendingCount > 0,
                ),
              ),

              const SizedBox(width: 8),

              Expanded(
                child: _SummaryCard(
                  label: 'COMPLETED',
                  value: completedCount.toString(),
                ),
              ),
            ],
          ),

          const SizedBox(height: 26),

          Row(
            children: [
              const Expanded(
                child: Text(
                  'Activity',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                ),
              ),

              Text(
                '${notes.length}',
                style: const TextStyle(
                  color: AppColors.muted,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          if (notes.isEmpty)
            const _EmptyState()
          else
            ...notes.map((note) => _NoteCard(note: note)),

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  void _showAddMenu(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 18),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: AppColors.copperLight,
                    child: Icon(
                      Icons.note_add_outlined,
                      color: AppColors.copper,
                    ),
                  ),
                  title: const Text(
                    'Add Note',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  subtitle: const Text(
                    'Save a customer conversation or activity.',
                  ),
                  onTap: () {
                    Navigator.pop(sheetContext);

                    _showAddNoteDialog(context);
                  },
                ),

                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: AppColors.successLight,
                    child: Icon(Icons.event_outlined, color: AppColors.success),
                  ),
                  title: const Text(
                    'Add Follow-up',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  subtitle: const Text(
                    'Create a follow-up task for this customer.',
                  ),
                  onTap: () {
                    Navigator.pop(sheetContext);

                    _showAddFollowUpDialog(context);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _showAddNoteDialog(BuildContext context) async {
    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return _AddNoteDialog(customerId: customer.id);
      },
    );
  }

  Future<void> _showAddFollowUpDialog(BuildContext context) async {
    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return _AddFollowUpDialog(customerId: customer.id);
      },
    );
  }
}

class _AddNoteDialog extends StatefulWidget {
  final String customerId;

  const _AddNoteDialog({required this.customerId});

  @override
  State<_AddNoteDialog> createState() => _AddNoteDialogState();
}

class _AddNoteDialogState extends State<_AddNoteDialog> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();

    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();

    super.dispose();
  }

  void _save() {
    final content = _controller.text.trim();

    if (content.isEmpty) {
      return;
    }

    context.read<CustomerNoteService>().addNote(
      customerId: widget.customerId,
      content: content,
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Note'),
      content: TextField(
        controller: _controller,
        autofocus: true,
        minLines: 3,
        maxLines: 6,
        textCapitalization: TextCapitalization.sentences,
        decoration: const InputDecoration(
          labelText: 'Note',
          hintText: 'Enter customer conversation or activity...',
          border: OutlineInputBorder(),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('Cancel'),
        ),

        FilledButton(onPressed: _save, child: const Text('Save Note')),
      ],
    );
  }
}

class _AddFollowUpDialog extends StatefulWidget {
  final String customerId;

  const _AddFollowUpDialog({required this.customerId});

  @override
  State<_AddFollowUpDialog> createState() => _AddFollowUpDialogState();
}

class _AddFollowUpDialogState extends State<_AddFollowUpDialog> {
  late final TextEditingController _controller;

  late DateTime _selectedDate;

  @override
  void initState() {
    super.initState();

    _controller = TextEditingController();

    final tomorrow = DateTime.now().add(const Duration(days: 1));

    _selectedDate = DateTime(tomorrow.year, tomorrow.month, tomorrow.day);
  }

  @override
  void dispose() {
    _controller.dispose();

    super.dispose();
  }

  Future<void> _selectDate() async {
    final now = DateTime.now();

    final today = DateTime(now.year, now.month, now.day);

    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: today,
      lastDate: DateTime(today.year + 2, today.month, today.day),
    );

    if (date == null || !mounted) {
      return;
    }

    setState(() {
      _selectedDate = date;
    });
  }

  void _save() {
    final content = _controller.text.trim();

    if (content.isEmpty) {
      return;
    }

    context.read<CustomerNoteService>().addFollowUp(
      customerId: widget.customerId,
      content: content,
      followUpDate: _selectedDate,
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Follow-up'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _controller,
              autofocus: true,
              minLines: 3,
              maxLines: 5,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                labelText: 'Follow-up',
                hintText: 'What needs to be followed up?',
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 18),

            const Text(
              'Follow-up Date',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),

            const SizedBox(height: 8),

            InkWell(
              onTap: _selectDate,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(13),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.calendar_today_outlined,
                      size: 18,
                      color: AppColors.copper,
                    ),

                    const SizedBox(width: 10),

                    Text(
                      DateFormat('dd MMM yyyy').format(_selectedDate),
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('Cancel'),
        ),

        FilledButton(onPressed: _save, child: const Text('Add Follow-up')),
      ],
    );
  }
}

class _NoteCard extends StatelessWidget {
  final CustomerNote note;

  const _NoteCard({required this.note});

  @override
  Widget build(BuildContext context) {
    if (note.isFollowUp) {
      return _buildFollowUp(context);
    }

    return _buildNote(context);
  }

  Widget _buildNote(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.copperLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.notes_outlined, color: AppColors.copper),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'NOTE',
                          style: TextStyle(
                            color: AppColors.copper,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),

                      _DeleteButton(note: note),
                    ],
                  ),

                  const SizedBox(height: 5),

                  Text(note.content, style: const TextStyle(height: 1.4)),

                  const SizedBox(height: 9),

                  Text(
                    DateFormat('dd MMM yyyy · h:mm a').format(note.createdAt),
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFollowUp(BuildContext context) {
    final completed = note.isCompleted;

    final overdue = _isFollowUpOverdue(note);

    final Color statusColor;

    final Color statusBackground;

    final String statusLabel;

    if (completed) {
      statusColor = AppColors.success;
      statusBackground = AppColors.successLight;
      statusLabel = 'COMPLETED';
    } else if (overdue) {
      statusColor = AppColors.danger;
      statusBackground = AppColors.dangerLight;
      statusLabel = 'OVERDUE';
    } else {
      statusColor = AppColors.warning;
      statusBackground = AppColors.warningLight;
      statusLabel = 'PENDING';
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: overdue && !completed ? AppColors.danger : AppColors.border,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: statusBackground,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                completed ? Icons.check_circle_outline : Icons.event_outlined,
                color: statusColor,
              ),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 7,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: statusBackground,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          statusLabel,
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),

                      const Spacer(),

                      _DeleteButton(note: note),
                    ],
                  ),

                  const SizedBox(height: 8),

                  Text(
                    note.content,
                    style: TextStyle(
                      height: 1.4,
                      decoration: completed ? TextDecoration.lineThrough : null,
                      color: completed ? AppColors.muted : AppColors.text,
                    ),
                  ),

                  const SizedBox(height: 10),

                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today_outlined,
                        size: 14,
                        color: statusColor,
                      ),

                      const SizedBox(width: 6),

                      Text(
                        note.followUpDate == null
                            ? 'No date'
                            : DateFormat('dd MMM yyyy')
                                  .format(note.followUpDate!),
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  SizedBox(
                    width: double.infinity,
                    child: completed
                        ? OutlinedButton.icon(
                            onPressed: () {
                              context
                                  .read<CustomerNoteService>()
                                  .reopenFollowUp(note.id);
                            },
                            icon: const Icon(Icons.refresh_outlined, size: 17),
                            label: const Text('Reopen'),
                          )
                        : FilledButton.icon(
                            onPressed: () {
                              context
                                  .read<CustomerNoteService>()
                                  .completeFollowUp(note.id);
                            },
                            icon: const Icon(Icons.check, size: 17),
                            label: const Text('Mark Completed'),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DeleteButton extends StatelessWidget {
  final CustomerNote note;

  const _DeleteButton({required this.note});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      visualDensity: VisualDensity.compact,
      tooltip: 'Delete',
      icon: const Icon(Icons.delete_outline, size: 19, color: AppColors.muted),
      onPressed: () async {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (dialogContext) {
            return AlertDialog(
              title: Text(
                note.isFollowUp ? 'Delete follow-up?' : 'Delete note?',
              ),
              content: const Text('This action cannot be undone.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(dialogContext, false);
                  },
                  child: const Text('Cancel'),
                ),

                FilledButton(
                  onPressed: () {
                    Navigator.pop(dialogContext, true);
                  },
                  child: const Text('Delete'),
                ),
              ],
            );
          },
        );

        if (confirmed != true || !context.mounted) {
          return;
        }

        context.read<CustomerNoteService>().deleteNote(note.id);
      },
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final bool warning;

  const _SummaryCard({
    required this.label,
    required this.value,
    this.warning = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: warning ? AppColors.warningLight : AppColors.card,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 5),

          Text(
            value,
            style: TextStyle(
              color: warning ? AppColors.warning : AppColors.text,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: const Column(
        children: [
          Icon(Icons.sticky_note_2_outlined, size: 34, color: AppColors.muted),

          SizedBox(height: 10),

          Text('No notes yet', style: TextStyle(fontWeight: FontWeight.w700)),

          SizedBox(height: 4),

          Text(
            'Add a note or follow-up for this customer.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

bool _isFollowUpOverdue(CustomerNote note) {
  if (!note.isFollowUp || note.isCompleted || note.followUpDate == null) {
    return false;
  }

  final now = DateTime.now();

  final today = DateTime(now.year, now.month, now.day);

  final followUpDate = DateTime(
    note.followUpDate!.year,
    note.followUpDate!.month,
    note.followUpDate!.day,
  );

  return followUpDate.isBefore(today);
}
