import 'dart:async';
import 'dart:js_interop';

import 'package:web/web.dart' as web;

class VisitStorage {
  VisitStorage(this.scope, String? directoryPath);

  final String scope;
  static const _store = 'pending';

  Future<web.IDBDatabase> _open() {
    final result = Completer<web.IDBDatabase>();
    final request = web.window.indexedDB.open('htt-sales-visits', 1);
    request.onupgradeneeded = ((web.Event _) {
      (request.result as web.IDBDatabase).createObjectStore(_store);
    }).toJS;
    request.onsuccess = ((web.Event _) {
      result.complete(request.result as web.IDBDatabase);
    }).toJS;
    request.onerror = ((web.Event _) {
      result.completeError(StateError('Could not open browser photo storage.'));
    }).toJS;
    return result.future;
  }

  Future<String?> _transaction(
    String mode,
    web.IDBRequest Function(web.IDBObjectStore) operation,
  ) async {
    final database = await _open();
    try {
      final transaction = database.transaction(_store.toJS, mode);
      final result = Completer<String?>();
      final request = operation(transaction.objectStore(_store));
      transaction.oncomplete = ((web.Event _) {
        final value = request.result;
        result.complete(
          value != null && value.typeofEquals('string')
              ? (value as JSString).toDart
              : null,
        );
      }).toJS;
      transaction.onabort = ((web.Event _) {
        result.completeError(
          StateError('Browser photo storage transaction failed.'),
        );
      }).toJS;
      return await result.future;
    } finally {
      database.close();
    }
  }

  Future<String?> read() =>
      _transaction('readonly', (store) => store.get(scope.toJS));

  Future<void> write(String value) async {
    await _transaction(
      'readwrite',
      (store) => store.put(value.toJS, scope.toJS),
    );
  }

  Future<void> delete() async {
    await _transaction('readwrite', (store) => store.delete(scope.toJS));
  }

  Future<void> exclusive(Future<void> Function() action) async {
    Object? failure;
    StackTrace? trace;
    await web.window.navigator.locks
        .request(
          'htt-visit-$scope',
          ((web.Lock? _) {
            return (() async {
              try {
                await action();
              } catch (error, stack) {
                failure = error;
                trace = stack;
              }
              return null;
            })().toJS;
          }).toJS,
        )
        .toDart;
    if (failure != null) Error.throwWithStackTrace(failure!, trace!);
  }
}
