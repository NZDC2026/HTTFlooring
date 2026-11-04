import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

Future<bool> loadGoogleMaps() async {
  if (defaultTargetPlatform != TargetPlatform.android &&
      defaultTargetPlatform != TargetPlatform.iOS) {
    return false;
  }
  const channel = MethodChannel('htt_flooring/google_maps');
  return await channel.invokeMethod<bool>('isConfigured') ?? false;
}
