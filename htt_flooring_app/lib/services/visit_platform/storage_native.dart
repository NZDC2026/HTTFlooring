import 'dart:io';

import 'package:path_provider/path_provider.dart';

class VisitStorage {
  VisitStorage(this.scope, this.directoryPath);

  final String scope;
  final String? directoryPath;

  Future<File> _file() async {
    final directory =
        directoryPath ?? (await getApplicationSupportDirectory()).path;
    return File('$directory/visit-$scope.json');
  }

  Future<String?> read() async {
    final file = await _file();
    return await file.exists() ? file.readAsString() : null;
  }

  Future<void> write(String value) async {
    final file = await _file();
    await file.parent.create(recursive: true);
    final temporary = File('${file.path}.tmp');
    await temporary.writeAsString(value, flush: true);
    await temporary.rename(file.path);
  }

  Future<void> delete() async => (await _file()).delete();

  Future<void> exclusive(Future<void> Function() action) => action();
}
