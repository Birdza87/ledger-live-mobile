// @flow

import React, { memo, useRef, useEffect, useMemo } from "react";
import { Animated } from "react-native";
import { useTheme } from "@react-navigation/native";

type Props = {
  style?: any,
  loading: boolean,
  children?: React$Node,
  animated?: boolean,
};

const Skeleton = ({
  style,
  loading,
  children = null,
  animated = true,
}: Props) => {
  const { colors } = useTheme();
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      const duration = 1000;
      const values = { min: 0.5, max: 1 };

      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: values.min,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: values.max,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, []);

  const animatedStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: colors.skeletonBg,
        opacity: opacityAnim,
      },
    ],
    [style, colors.skeletonBg, opacityAnim],
  );

  return loading ? <Animated.View style={animatedStyle} /> : children;
};

export default memo<Props>(Skeleton);
