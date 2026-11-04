import 'dart:async';
import 'dart:js_interop';

import 'package:web/web.dart' as web;

Future<bool>? _loading;

Future<bool> loadGoogleMaps() => _loading ??= _load();

Future<bool> _load() async {
  const key = String.fromEnvironment('GOOGLE_MAPS_WEB_API_KEY');
  if (key.isEmpty) return false;

  final loaded = Completer<bool>();
  final script = web.HTMLScriptElement()
    ..src = Uri.https('maps.googleapis.com', '/maps/api/js', {
      'key': key,
    }).toString()
    ..async = true
    ..onload = ((web.Event _) => loaded.complete(true)).toJS
    ..onerror = ((web.Event _) => loaded.complete(false)).toJS;
  web.document.head!.appendChild(script);
  return loaded.future.timeout(
    const Duration(seconds: 15),
    onTimeout: () => false,
  );
}
