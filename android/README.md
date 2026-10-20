# Android APK build

The APK is a Capacitor wrapper: a thin Android WebView that loads the
deployed PWA at the URL in `capacitor.config.json` (`server.url`). The
generated Gradle project (`android/app/…`) is **not** committed —
`.github/workflows/android-apk.yml` recreates it from scratch on every run
with `npx cap add android`.

## Trigger a build

Two ways:

1. **Manual** (easiest for one-offs). Go to the repo's **Actions** tab →
   **Build Android APK** → **Run workflow**. Pick a release tag
   (e.g. `v0.2.0`); the workflow will create the release if it doesn't
   exist and attach the APK to it.

2. **On tag push.** Any tag starting with `v` triggers a build:

   ```
   git tag v0.2.0
   git push --tags
   ```

The finished APK is attached to the GitHub Release and also uploaded as a
workflow artifact (findable under the run's **Summary** page, kept 30
days).

## Install on a device

Download the APK on the phone, open it, and tap Install. Android will
prompt you to allow "install unknown apps" for whichever file manager or
browser opened the file — allow it once, then back out and tap Install
again.

## Debug vs release signing

With no secrets configured, the workflow builds a **debug-signed APK**.
It's fully installable but each build has a different signature, so
upgrading requires uninstalling the previous version first.

To get a stable identity across releases (so upgrades install over the top
without uninstalling), generate a release keystore once and store it in
GitHub secrets:

```bash
# One-time, on your local machine
keytool -genkeypair -v \
  -keystore trvlplnr-release.keystore \
  -alias trvlplnr \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass '<a-strong-password>' -keypass '<a-strong-password>' \
  -dname 'CN=TrvlPlnr, OU=App, O=TrvlPlnr, L=Unknown, S=Unknown, C=US'

# Encode for the GitHub secret
base64 -i trvlplnr-release.keystore | pbcopy
```

Add these four secrets under **Settings → Secrets and variables →
Actions**:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | base64 contents of the keystore |
| `ANDROID_KEYSTORE_PASSWORD` | the `-storepass` you used |
| `ANDROID_KEY_ALIAS` | `trvlplnr` (or whatever alias you chose) |
| `ANDROID_KEY_PASSWORD` | the `-keypass` you used |

The next run picks them up automatically and builds a release-signed APK.
Keep the keystore file somewhere safe — losing it means you can't ship
updates to installed users without a new app identity.

## Point the APK at a different URL

Pass `pwa_url` when running the workflow manually, or edit
`capacitor.config.json` and commit — the workflow uses whatever is in the
file as the default. Common cases:

- Switching domains: edit `server.url` and tag a new release.
- Running against a preview build: trigger manually with the preview URL.

## Local build (optional)

You don't need this for day-to-day work — CI handles it. If you want to
produce an APK locally:

```bash
npm install
npm install --save-dev @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
# APK lands at android/app/build/outputs/apk/debug/app-debug.apk
```

Requires JDK 17 and the Android SDK (platforms;android-34,
build-tools;34.0.0).
