import { useEffect, useState, useCallback, useRef } from 'react';
import GoogleMobileAds, { InterstitialAd, AdEventType, TestIds, AdsConsent } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: 'ca-app-pub-9798215400647956/8495791161',
      android: 'ca-app-pub-9798215400647956/2852147479',
    }) || TestIds.INTERSTITIAL;

// Module-level singleton: runs once, gates all ad loading
let adsInitialized: Promise<void> | null = null;
const ensureAdsReady = (): Promise<void> => {
  if (adsInitialized) return adsInitialized;
  adsInitialized = (async () => {
    await GoogleMobileAds().initialize();
    // Consent/UMP is best-effort: if no consent form is configured yet
    // in Google Consent Manager, these will throw. Ads still serve as
    // non-personalized in that case.
    try {
      await AdsConsent.requestInfoUpdate();
      await AdsConsent.loadAndShowConsentFormIfRequired();
    } catch (e) {
      console.log('Consent flow skipped:', e);
    }
  })().catch((err) => {
    // Only initialize() itself failing is fatal — reset so it retries
    adsInitialized = null;
    console.log('Ad SDK initialize failed:', err);
    throw err;
  });
  return adsInitialized;
};

let interstitialRef: ReturnType<typeof InterstitialAd.createForAdRequest> | null = null;
const getInterstitial = () => {
  if (!interstitialRef) {
    interstitialRef = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });
  }
  return interstitialRef;
};

export const useInterstitialAd = () => {
  const loadedRef = useRef(false);
  const onAdClosedCallbackRef = useRef<(() => void) | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadNextAd = async () => {
    loadedRef.current = false;
    setLoaded(false);
    try {
      await ensureAdsReady();
      getInterstitial().load();
    } catch (err) {
      console.log('Ad load failed after init:', err);
    }
  };

  useEffect(() => {
    const interstitial = getInterstitial();

    const loadedListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
      setLoaded(true);
    });

    const errorListener = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Ad failed to load:', error);
      loadedRef.current = false;
      setLoaded(false);
    });

    const closedListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      // Fire the callback first
      if (onAdClosedCallbackRef.current) {
        onAdClosedCallbackRef.current();
        onAdClosedCallbackRef.current = null;
      }
      // Then load the next ad
      loadNextAd();
    });

    // Load the first ad (waits for init + consent internally)
    loadNextAd();

    return () => {
      loadedListener();
      errorListener();
      closedListener();
    };
  }, []);

  const showAd = useCallback(async (onClosed?: () => void): Promise<boolean> => {
    if (loadedRef.current) {
      try {
        if (onClosed) {
          onAdClosedCallbackRef.current = onClosed;
        }
        await getInterstitial().show();
        return true;
      } catch (error) {
        console.log('Error showing ad:', error);
        onAdClosedCallbackRef.current = null;
        loadNextAd();
        return false;
      }
    } else {
      // Ad not ready - call callback immediately so user isn't blocked
      if (onClosed) {
        onClosed();
      }
      return false;
    }
  }, []);

  return {
    loaded,
    showAd,
  };
};
