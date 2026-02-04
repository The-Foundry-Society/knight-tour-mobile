# AdMob Setup Instructions

## Current Status
✅ Interstitial ads are integrated and ready to use
✅ Test ads are currently configured (you'll see test ads in development)
⚠️ You need to replace test IDs with your real AdMob IDs before submitting to stores

## How Ads Work in Your App

**Timing:** An interstitial ad shows immediately after a player wins a level, before the victory celebration popup appears.

**Flow:**
1. Player completes the level
2. Interstitial ad displays (full screen)
3. Player closes the ad
4. Confetti animation + victory modal appears

## Getting Your Real AdMob IDs

### Step 1: Create App in AdMob
1. Go to https://apps.admob.google.com/
2. Click "Apps" in the left menu
3. Click "Add App"
4. Create **two apps** (one for iOS, one for Android)
   - iOS: "Knight's Tour (iOS)"
   - Android: "Knight's Tour (Android)"
5. Note down both **App IDs** (format: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY)

### Step 2: Create Ad Units
For **each app** (iOS and Android):
1. Click on your app
2. Click "Ad units" tab
3. Click "Add Ad Unit"
4. Select **"Interstitial"**
5. Name it "Victory Interstitial" or similar
6. Click "Create ad unit"
7. Note down the **Ad Unit ID** (format: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY)

You should now have:
- iOS App ID
- iOS Interstitial Ad Unit ID
- Android App ID
- Android Interstitial Ad Unit ID

### Step 3: Update Your Code

#### File 1: `app.json`
Replace the test App IDs:

```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY", // Your Android App ID
      "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"      // Your iOS App ID
    }
  ]
]
```

#### File 2: `hooks/useInterstitialAd.ts`
Find this section (around line 9-11):

```typescript
const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL // Use test ads in development
  : Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Replace with your iOS ad unit ID
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Replace with your Android ad unit ID
    }) || TestIds.INTERSTITIAL;
```

Replace the placeholder ad unit IDs with your real ones.

**Important:** Keep `TestIds.INTERSTITIAL` for development mode (`__DEV__`). This ensures you see test ads during development and real ads in production.

### Step 4: Test with Test Ads
Before replacing with real IDs, you can test the integration:
1. Build a development build: `npx expo run:ios` or `npx expo run:android`
2. Play a level and complete it
3. You should see a Google test ad appear
4. After closing the ad, the victory modal should appear

**Note:** Ads won't work in Expo Go. You need a development build or production build.

### Step 5: Build Production Version
Once real IDs are added:
1. Create a production build: `eas build --platform ios` and `eas build --platform android`
2. Test the production build before submitting to stores
3. Verify real ads appear (not test ads)

## Important Notes

- **Don't click your own ads** - Google will ban your AdMob account for invalid activity
- **Test thoroughly** before submission - make sure ads don't crash the app
- **Ad fill rate** might not be 100% - sometimes ads won't load, and that's normal
- **Revenue** won't show immediately - AdMob reports have a delay
- **Compliance** - Make sure you have proper privacy policy and consent (GDPR, CCPA)

## Troubleshooting

**Ads not showing:**
- Check that you've replaced all placeholder IDs
- Verify you're using a development/production build (not Expo Go)
- Check AdMob dashboard to ensure ad units are active
- Wait a few hours after creating ad units (they need to activate)

**App crashes when showing ad:**
- Check that App IDs in app.json match your AdMob account
- Verify you've rebuilt the app after changing app.json
- Check device logs for error messages

**Test ads showing in production:**
- Verify `__DEV__` check is working correctly
- Make sure you're testing a production build, not a development build
- Check that real ad unit IDs are correct

## Next Steps
After ads are working:
1. Add privacy policy to your app store listings
2. Configure user consent (EU users require consent for personalized ads)
3. Monitor AdMob dashboard for revenue and performance
4. Consider ad frequency - currently shows after every win (you can adjust this)
