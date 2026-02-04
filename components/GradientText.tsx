import React from 'react';
import { Text, TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientTextProps {
  children: string;
  style?: TextStyle;
  colors?: string[];
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  style,
  colors = ['#d4a574', '#e8a838', '#f0c860', '#e8a838', '#8a6a3a'] // Brown to gold gradient
}) => {
  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};
