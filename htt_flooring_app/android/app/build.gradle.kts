plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val mapsApiKey = providers.gradleProperty("GOOGLE_MAPS_ANDROID_API_KEY")
    .orElse(providers.environmentVariable("GOOGLE_MAPS_ANDROID_API_KEY"))
    .orElse("")

android {
    namespace = "com.example.htt_flooring_app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        manifestPlaceholders["googleMapsApiKey"] = mapsApiKey.get()
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.example.htt_flooring_app"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        // Uses the version code from pubspec.yaml. When using split APKs, 1000 * ABI_VERSION
        // is added automatically by Flutter. (https://developer.android.com/studio/build/configure-apk-splits#configure-APK-versions)
        // You can force using the value of versionCode by specifying the `-P force-version-code-ignoring-abi=true`
        // flag during build.
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}

// Navigation SDK's older Cronet AARs share a manifest namespace under AGP 9.
configurations.configureEach {
    exclude(group = "org.chromium.net", module = "cronet-fallback")
}

dependencies {
    implementation("org.chromium.net:cronet-embedded:143.7445.0")
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs_nio:2.1.5")
    implementation("com.google.mlkit:text-recognition-chinese:16.0.1")
    implementation("com.google.mlkit:text-recognition-japanese:16.0.1")
    implementation("com.google.mlkit:text-recognition-korean:16.0.1")
    implementation("com.google.mlkit:text-recognition-devanagari:16.0.1")
}

// The navigation plugin compiles against API 35, while Flutter's lifecycle
// plugin requires API 36. Match the app SDK when building the navigation library.
project(":google_navigation_flutter").let { navigationProject ->
    navigationProject.plugins.withId("com.android.library") {
        navigationProject.extensions
            .getByType<com.android.build.api.variant.LibraryAndroidComponentsExtension>()
            .finalizeDsl { library ->
                library.compileSdk = flutter.compileSdkVersion
            }
    }
}
