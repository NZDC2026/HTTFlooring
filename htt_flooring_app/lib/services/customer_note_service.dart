import 'package:uuid/uuid.dart';

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/customer_note_codec.dart';

import 'package:flutter/foundation.dart';

import '../models/customer_note.dart';
import '../models/app_user.dart';

class CustomerNoteService extends ChangeNotifier {
  CustomerNoteService({
    Iterable<CustomerNote> initialNotes = const [],
    this.persistenceKey,
  }) : _notes = List.of(initialNotes) {
    ready = _loadLocal();
  }
  final String? persistenceKey;
  late final Future<void> ready;
  Future<void> _pendingSave = Future<void>.value();
  Object? _saveError;
  bool _disposed = false;
  Future<void> _loadLocal() async {
    if (persistenceKey == null) return;
    try {
      final raw = (await SharedPreferences.getInstance()).getString(
        persistenceKey!,
      );
      if (raw == null || _disposed) return;
      for (final row in jsonDecode(raw) as List) {
        try {
          final note = decodeCustomerNote(
            Map<String, dynamic>.from(row as Map),
          );
          if (!_notes.any((n) => n.id == note.id)) _notes.add(note);
        } catch (_) {
          /* Keep other valid activities. */
        }
      }
      if (!_disposed) notifyListeners();
    } catch (_) {
      /* Preserve in-memory records if storage is unavailable. */
    }
  }

  void _changed() {
    if (persistenceKey != null) {
      _pendingSave = _pendingSave
          .then((_) async {
            await ready;
            final raw = jsonEncode(_notes.map(encodeCustomerNote).toList());
            final saved = await (await SharedPreferences.getInstance())
                .setString(persistenceKey!, raw);
            if (!saved)
              throw StateError('Activity could not be saved on this device.');
            _saveError = null;
          })
          .catchError((Object error) {
            _saveError = error;
          });
    }
    if (!_disposed) notifyListeners();
  }

  Future<void> commit(void Function() update) async {
    final before = List<CustomerNote>.of(_notes);
    try {
      update();
      await flush();
    } catch (_) {
      _notes
        ..clear()
        ..addAll(before);
      if (!_disposed) notifyListeners();
      rethrow;
    }
  }

  Future<void> flush() async {
    await _pendingSave;
    if (_saveError != null) throw _saveError!;
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }

  final List<CustomerNote> _notes;

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

  void restoreLocalFollowUp(CustomerNote note) {
    if (!note.isFollowUp || _notes.any((n) => n.id == note.id)) return;
    _notes.add(note);
    _changed();
  }

  void addNote({
    required String customerId,
    String? existingId,
    required String content,
    List<ActivityAttachment>? attachments,
    String? noteType,
    AppUser? author,
  }) {
    final text = content.trim();

    if (text.isEmpty) {
      throw ArgumentError('Note cannot be empty.');
    }

    final index = existingId == null
        ? -1
        : _notes.indexWhere(
            (note) => note.id == existingId && note.customerId == customerId,
          );
    if (existingId != null && index < 0) {
      throw StateError('Activity no longer exists.');
    }
    final existing = index < 0 ? null : _notes[index];
    final activity = CustomerNote(
      id: existing?.id ?? _generateId(),
      customerId: customerId,
      type: CustomerNoteType.note,
      noteType: noteType,
      creatorId: existing == null ? author?.id : existing.creatorId,
      authorName: existing == null ? author?.name : existing.authorName,
      content: text,
      attachments: List.unmodifiable(
        attachments ?? existing?.attachments ?? const [],
      ),
      createdAt: existing?.createdAt ?? DateTime.now(),
    );
    if (index < 0) {
      _notes.add(activity);
    } else {
      _notes[index] = activity;
    }

    _changed();
  }

  void addFollowUp({
    required String customerId,
    String? existingId,
    AppUser? actor,
    required String content,
    List<ActivityAttachment>? attachments,
    required DateTime? followUpDate,
    String? followUpType,
    List<AppUser> assignees = const [],
    String? priority,
    String? reminder,
    DateTime? reminderDate,
  }) {
    final text = content.trim();

    if (text.isEmpty) {
      throw ArgumentError('Follow-up cannot be empty.');
    }

    final index = existingId == null
        ? -1
        : _notes.indexWhere(
            (note) => note.id == existingId && note.customerId == customerId,
          );
    if (existingId != null && index < 0) {
      throw StateError('Activity no longer exists.');
    }
    final existing = index < 0 ? null : _notes[index];
    final previousAssignees =
        existing?.assignees.map((user) => user.id).toSet() ?? <String>{};
    final nextAssignees = assignees.map((user) => user.id).toSet();
    final assignmentChanged = !setEquals(previousAssignees, nextAssignees);
    final activity = CustomerNote(
      id: existing?.id ?? _generateId(),
      customerId: customerId,
      type: CustomerNoteType.followUp,
      creatorId:
          existing?.creatorId ??
          (existing?.isFollowUp == true ? null : actor?.id),
      content: text,
      attachments: List.unmodifiable(
        attachments ?? existing?.attachments ?? const [],
      ),
      createdAt: existing?.createdAt ?? DateTime.now(),
      followUpDate: followUpDate,
      followUpStatus: existing?.followUpStatus ?? FollowUpStatus.pending,
      events: List.unmodifiable([
        ...?existing?.events,
        if (actor != null && existing?.isFollowUp != true)
          (
            author: actor.name,
            action: existing == null ? 'Created' : 'Converted from note',
            message: null,
            attachments: const <ActivityAttachment>[],
            at: DateTime.now(),
          ),
        if (actor != null && assignmentChanged)
          (
            author: actor.name,
            action: existing?.isFollowUp == true ? 'Reassigned' : 'Assigned',
            message: assignees.map((user) => user.name).join(', '),
            attachments: const <ActivityAttachment>[],
            at: DateTime.now(),
          ),
      ]),
      noteType: existing?.noteType,
      followUpType: followUpType,
      assignees: List.unmodifiable(assignees),
      priority: priority,
      reminder: reminder,
      reminderDate: reminderDate,
    );
    if (index < 0) {
      _notes.add(activity);
    } else {
      _notes[index] = activity;
    }

    _changed();
  }

  void setFollowUpStatus(
    String id,
    FollowUpStatus status, {
    required AppUser actor,
    String? result,
  }) {
    final index = _notes.indexWhere((note) => note.id == id && note.isFollowUp);
    if (index < 0) throw StateError('Follow-up no longer exists.');
    final note = _notes[index];
    if (note.followUpStatus == status) return;
    final message = result?.trim();
    if (status == FollowUpStatus.completed &&
        (message == null || message.isEmpty)) {
      throw ArgumentError('Enter a completion note.');
    }
    final action = switch (status) {
      FollowUpStatus.pending => note.isCompleted ? 'Reopened' : 'Pending',
      FollowUpStatus.inProgress => 'In Progress',
      FollowUpStatus.completed => 'Completed',
    };
    _notes[index] = note.copyWith(
      followUpStatus: status,
      events: List.unmodifiable([
        ...note.events,
        (
          author: actor.name,
          action: action,
          message: message,
          attachments: const <ActivityAttachment>[],
          at: DateTime.now(),
        ),
      ]),
    );
    _changed();
  }

  void replyToFollowUp(
    String id,
    AppUser author,
    String message, {
    List<ActivityAttachment> attachments = const [],
  }) {
    final index = _notes.indexWhere((note) => note.id == id);
    if (index < 0) throw StateError('Activity no longer exists.');
    final note = _notes[index];
    final text = message.trim();
    if (text.isEmpty && attachments.isEmpty) {
      throw ArgumentError('Enter a reply or add an attachment.');
    }
    if (!note.canReply(author)) {
      throw StateError(
        'Only the creator and assignees can reply to an open follow-up.',
      );
    }
    _notes[index] = note.copyWith(
      events: List.unmodifiable([
        ...note.events,
        (
          author: author.name,
          action: 'Reply',
          message: text,
          attachments: List<ActivityAttachment>.unmodifiable(attachments),
          at: DateTime.now(),
        ),
      ]),
    );
    _changed();
  }

  void deleteNote(String id) {
    _notes.removeWhere((note) => note.id == id);

    _changed();
  }

  String _generateId() {
    return const Uuid().v4();
  }
}
