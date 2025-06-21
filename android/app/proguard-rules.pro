# Razorpay SDK
-keep class com.razorpay.** { *; }
-keep interface com.razorpay.** { *; }
-dontwarn com.razorpay.**

# React Native Core
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keep class * implements com.facebook.react.bridge.JSIModulePackage { *; }
-keep class * implements com.facebook.react.ReactPackage { *; }
-keepclassmembers class * { @com.facebook.react.uimanager.UIProp <fields>; }
-keepclassmembers class * {
  @com.facebook.react.uimanager.ReactProp <methods>;
  @com.facebook.react.uimanager.ReactPropGroup <methods>;
}

# Annotation & Reflection Support
-keepattributes *Annotation*
-keepattributes InnerClasses, EnclosingMethod
