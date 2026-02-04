import { useEffect, useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

const SOUND_SOURCES = {
  move: require('../assets/sounds/move.wav'),
  invalid: require('../assets/sounds/invalid.wav'),
  win: require('../assets/sounds/win.wav'),
  stuck: require('../assets/sounds/stuck.wav'),
  undo: require('../assets/sounds/undo.wav'),
} as const;

type SoundType = keyof typeof SOUND_SOURCES;

export const useSounds = () => {
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const soundsRef = useRef<Partial<Record<SoundType, Audio.Sound>>>({});

  useEffect(() => {
    const loadSounds = async () => {
      for (const [key, source] of Object.entries(SOUND_SOURCES)) {
        const { sound } = await Audio.Sound.createAsync(source);
        soundsRef.current[key as SoundType] = sound;
      }
    };
    loadSounds();

    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        sound?.unloadAsync();
      });
      soundsRef.current = {};
    };
  }, []);

  const playSound = useCallback(async (type: SoundType) => {
    if (!soundsEnabled) return;

    try {
      const sound = soundsRef.current[type];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Sound playback error:', error);
    }
  }, [soundsEnabled]);

  const toggleSounds = useCallback(() => {
    setSoundsEnabled(prev => !prev);
  }, []);

  return { playSound, soundsEnabled, toggleSounds };
};
