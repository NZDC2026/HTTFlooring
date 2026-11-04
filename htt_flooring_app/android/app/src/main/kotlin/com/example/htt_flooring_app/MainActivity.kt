package com.example.htt_flooring_app

import android.content.pm.PackageManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "htt_flooring/google_maps")
            .setMethodCallHandler { call, result ->
                if (call.method != "isConfigured") {
                    result.notImplemented()
                    return@setMethodCallHandler
                }
                val metadata = packageManager.getApplicationInfo(
                    packageName, PackageManager.GET_META_DATA
                ).metaData
                result.success(!metadata?.getString("com.google.android.geo.API_KEY").isNullOrBlank())
            }
    }
}
