# Knight's Tour — Build & Deploy Guide

Everything you need to get the app running locally, build release versions, and
submit to Google Play and the App Store. Covers both platforms end to end.

---

## Prerequisites

Make sure these are installed before you start:

- **Node.js** via nvm (v22.x) — `nvm use 22`
- **Xcode** — from the Mac App Store, plus Command Line Tools (`xcode-select --install`)
- **Android Studio** — from [developer.android.com](https://developer.android.com/studio)
- **npm**

Accounts you need access to:

- Firebase Console — `knight-tour-a6fc1` project
- AdMob Console
- Apple Developer account
- Google Play Developer account (`The Foundry Society`)

Files that are **gitignored** and must be placed manually (download from Firebase Console each time you set up a new machine):

| File | Where it goes | How to get it |
|------|---------------|---------------|
| `GoogleService-Info.plist` | `ios/` directory | Firebase Console > iOS app > Config file |
| `google-services.json` | Project root (`knight-tour-mobile/`) | Firebase Console > Android app > Config file |

The release keystore for Android signing is at `~/knighttourkey.jks`. Keep a backup — if you lose it you can never update the app on Play Store.

---

## Prebuild — when to run it

`npx expo prebuild` generates the `android/` and `ios/` native project directories from
`app.json` and your installed packages. Run it when:

- You change `app.json` (permissions, plugins, bundle ID, etc.)
- You add or remove a native dependency (e.g. expo-audio → expo-av)
- You set up the project on a new machine for the first time

```bash
# Both platforms
npx expo prebuild

# Single platform (faster)
npx expo prebuild --platform android
npx expo prebuild --platform ios
```

After prebuild, drop `GoogleService-Info.plist` into `ios/` and make sure
`google-services.json` is in the project root. Prebuild does not create or copy
these — they must be placed manually.

**Do not manually edit files inside `android/` or `ios/`** — prebuild will
overwrite them. If you need to tweak something in `AndroidManifest.xml` or
`Info.plist`, do it via `app.json` or a config plugin instead.

---

## Android

### Setup (one-time)

Android Studio must be launched **from the terminal**, not from the Finder icon.
When macOS launches an app from Finder it uses a minimal system PATH that does
not include nvm's node. Gradle needs node to run the Expo autolinking plugin.

Add `adb` to your shell so you don't have to type the full path every time.
Add this to `~/.zshrc` (or `~/.bashrc`):

```bash
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
```

Then `source ~/.zshrc` (or open a new terminal).

### Debug build

Two things need to be running: Metro (the JS bundler) and the app on a device
or emulator.

**Terminal 1 — start Metro:**
```bash
npx expo start
```

**Terminal 2 — launch Android Studio:**
```bash
"/Applications/Android Studio.app/Contents/MacOS/studio" "/path/to/knight-tour-mobile/android" &
```

1. Wait for Gradle to sync (first time can take a few minutes).
2. Pick a device or emulator in the toolbar and hit Run.
3. If you see **"Unable to load script from http://localhost:8081"**, Metro
   isn't reachable from the device. Run this in a terminal:
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```
   Then relaunch the app on the device. You only need this for **physical
   devices** — emulators route localhost automatically.

### Release build

Use Android Studio's signing wizard — do not use "Build > Build Bundle(s)"
because that produces a debug-signed bundle.

1. Launch Android Studio from terminal (same command as above).
2. Wait for Gradle sync.
3. **File > Generate Signed Bundle / APK**
4. Select **Android App Bundle** > Next
5. Under "Signing config" select **Create new** or **Use existing**.
   - Keystore file: `~/knighttourkey.jks`
   - Enter your keystore password, key alias, and key password.
6. Click Next.
7. Make sure the build variant is **release**.
8. Click Finish.

The `.aab` file lands at `android/app/release/app-release.aab`. That's the
file you upload to Play Store.

---

## Google Play Submission

1. Go to [Play Console](https://play.google.com/console) > select the app.
2. Navigate to the release track you want (Internal testing, Alpha, Beta, or
   Production).
3. Upload the `.aab` from `android/app/release/app-release.aab`.
4. Fill in the **Privacy policy URL**:
   ```
   https://the-foundry-society.github.io/knight-tour-mobile/privacy-policy.html
   ```
5. Complete the **Data Safety** section — the app collects:
   - Anonymous gameplay analytics via Firebase (no personal data)
   - Advertising identifiers via Google AdMob
   - No other user data is collected or transmitted
6. Review and submit.

---

## iOS

### Setup (one-time)

Make sure `GoogleService-Info.plist` is in the `ios/` directory. If you just
ran prebuild, the directory was regenerated — you need to drop it back in.

### Debug build

```bash
npx expo start --ios
```

This opens the app in the iOS Simulator. To run on a **physical device**,
open `ios/` in Xcode, select your device in the toolbar, and hit Run. You may
need to set a development team in Xcode > project settings > Signing.

### Release build (Archive)

1. Open `ios/` in Xcode.
2. Make sure `GoogleService-Info.plist` is present in the project.
3. In the scheme selector (top toolbar), set the destination to **Any iOS
   Device (arm64)** — not a simulator.
4. **Product > Archive**. Xcode builds and opens the Organizer.
5. Click **Distribute App**.
6. Select **App Store Connect** > Upload.
7. If you see dSYM upload errors for React Native / Hermes frameworks —
   these are prebuilt binaries that don't ship debug symbols. Uncheck
   **"Upload symbols"** and proceed. The upload will succeed without them.
8. The build appears in App Store Connect for review.

---

## App Store Submission

1. Go to [App Store Connect](https://appstoreconnect.apple.com).
2. Select the app > Versions > add a new version if needed.
3. Select the build you just uploaded.
4. Fill in the **Privacy Policy URL**:
   ```
   https://the-foundry-society.github.io/knight-tour-mobile/privacy-policy.html
   ```
5. Submit for review.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Gradle can't find `node` | Launch Android Studio from the terminal, not Finder. See Android Setup above. |
| "Unable to load script" on device | Metro isn't reachable. Run `adb reverse tcp:8081 tcp:8081` and relaunch the app. |
| `adb` command not found | Add `~/Library/Android/sdk/platform-tools` to PATH (see Android Setup). |
| "android_app_id required" Gradle error | `app.json` has **two** AdMob config locations: (a) `expo.plugins` array uses camelCase (`androidAppId`), read by the Expo config plugin; (b) a **top-level** `react-native-google-mobile-ads` key uses snake_case (`android_app_id`), read by the Gradle plugin at build time. Both must be present. |
| "APK signed in debug mode" on Play Store | You used Build > Build Bundle(s) instead of the signing wizard. Use **File > Generate Signed Bundle / APK** and walk through the keystore steps. |
| dSYM upload errors on iOS | Prebuilt React Native frameworks don't include debug symbols. Uncheck "Upload symbols" in the distribution dialog. |
| Ads not playing (debug build) | `__DEV__` is `true` in debug — test ad IDs are used automatically. Ads require a **release** build or a development build (not Expo Go) to show test ads. |
| Ads not playing (release build) | Check the console for errors. The SDK needs network access and the consent flow to complete before the first ad loads. There may be a short delay on first launch. |
| GoogleService-Info.plist / google-services.json missing | These are gitignored. Download from Firebase Console > project settings > your app > Config file, and place them manually (see Prerequisites). |
