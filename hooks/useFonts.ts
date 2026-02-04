import { useFonts as useExpoFonts } from 'expo-font';
import {
  Cinzel_400Regular,
  Cinzel_500Medium,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
} from '@expo-google-fonts/lora';

export const useFonts = () => {
  const [fontsLoaded] = useExpoFonts({
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
  });

  return fontsLoaded;
};

// Font family constants for easy use throughout the app
export const FONTS = {
  heading: 'Cinzel_700Bold',
  headingMedium: 'Cinzel_600SemiBold',
  headingRegular: 'Cinzel_500Medium',
  body: 'Lora_400Regular',
  bodyMedium: 'Lora_500Medium',
  bodySemiBold: 'Lora_600SemiBold',
  bodyBold: 'Lora_700Bold',
};
