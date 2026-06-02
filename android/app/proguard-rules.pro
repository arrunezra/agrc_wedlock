# ==============================================================================
# Project Specific Rules (Razorpay Matrimony Gateway)
# ==============================================================================
-keepclassmembers class com.razorpay.CheckoutBridge {
    public *;
}
-keep class com.razorpay.** {*;}
-dontwarn com.razorpay.**

# ==============================================================================
# Core React Native & Framework Rules
# ==============================================================================
# Keep core React Native architecture safe from being renamed or deleted
-keep class com.facebook.react.** { *; }
-keep class com.facebook.fresco.** { *; }
-dontwarn com.facebook.react.**

# Fixes for FastImage and Glide asset loading libraries
-keep class com.dylanvann.fastimage.** { *; }
-keep class com.bumptech.glide.** { *; }
-dontwarn com.bumptech.glide.**

# Support for Hermes engine and New Architecture hooks
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-dontwarn javax.annotation.**

# Common networking libraries used by React Native CLI
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn rx.**

# ==============================================================================
# Fallback Warning Suppression
# ==============================================================================
# Tell R8 to ignore missing optional third-party classes instead of crashing
-ignorewarnings