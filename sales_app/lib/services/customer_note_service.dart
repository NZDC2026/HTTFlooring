import 'package:flutter/foundation.dart';

import '../models/customer_note.dart';

class CustomerNoteService extends ChangeNotifier {
  final List<CustomerNote> _notes = [];

  List<CustomerNote> get notes => List.unmodifiable(_notes);

  List<CustomerNote> getCustomerNotes(String customerId) {
    final results = _notes
        .where((note) => note.customerId == customerId)
        .toList();

    results.sort((a, b) => b.createdAt.compareTo(a.createdAt));

    return results;
  }

  List<CustomerNote> get pendingFollowUps {
    final results = _notes
        .where((note) => note.isFollowUp && !note.isCompleted)
        .toList();

    results.sort((a, b) {
      final aDate = a.followUpDate;
      final bDate = b.followUpDate;

      if (aDate == null && bDate == null) {
        return b.createdAt.compareTo(a.createdAt);
      }

      if (aDate == null) return 1;

      if (bDate == null) return -1;

      return aDate.compareTo(bDate);
    });

    return results;
  }

  void addNote({required String customerId, required String content}) {
    final text = content.trim();

    if (text.isEmpty) {
      throw ArgumentError('Note cannot be empty.');
    }

    _notes.add(
      CustomerNote(
        id: _generateId(),
        customerId: customerId,
        type: CustomerNoteType.note,
        content: text,
        createdAt: DateTime.now(),
      ),
    );

    notifyListeners();
  }

  void addFollowUp({
    required String customerId,
    required String content,
    required DateTime followUpDate,
  }) {
    final text = content.trim();

    if (text.isEmpty) {
      throw ArgumentError('Follow-up cannot be empty.');
    }

    _notes.add(
      CustomerNote(
        id: _generateId(),
        customerId: customerId,
        type: CustomerNoteType.followUp,
        content: text,
        createdAt: DateTime.now(),
        followUpDate: followUpDate,
        followUpStatus: FollowUpStatus.pending,
      ),
    );

    notifyListeners();
  }

  void completeFollowUp(String id) {
    final index = _notes.indexWhere((note) => note.id == id);

    if (index == -1) {
      throw StateError('Customer note not found.');
    }

    final note = _notes[index];

    if (!note.isFollowUp) {
      throw StateError('Only follow-ups can be completed.');
    }

    _notes[index] = note.copyWith(followUpStatus: FollowUpStatus.completed);

    notifyListeners();
  }

  void reopenFollowUp(String id) {
    final index = _notes.indexWhere((note) => note.id == id);

    if (index == -1) {
      throw StateError('Customer note not found.');
    }

    final note = _notes[index];

    if (!note.isFollowUp) {
      throw StateError('Only follow-ups can be reopened.');
    }

    _notes[index] = note.copyWith(followUpStatus: FollowUpStatus.pending);

    notifyListeners();
  }

  void deleteNote(String id) {
    _notes.removeWhere((note) => note.id == id);

    notifyListeners();
  }

  String _generateId() {
    return DateTime.now().microsecondsSinceEpoch.toString();
  }
}
