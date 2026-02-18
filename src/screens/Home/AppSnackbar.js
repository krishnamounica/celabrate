import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import styled from 'styled-components/native';

const SnackbarWrap = styled(Animated.View)`
  position: absolute;
  left: 16px;
  right: 16px;

  background-color: #ffffff;
  padding: 14px 16px;
  border-radius: 14px;

  flex-direction: row;
  align-items: center;

  elevation: 12;
  shadow-color: #000;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.18;
  shadow-radius: 10px;
`;

const IconWrap = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: #000;
`;

export default function AppSnackbar({
  visible,
  message,
  variant = 'success',
  duration = 2200,
  onHide,
  bottomOffset = 90,
}) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(onHide);
    }, duration);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <SnackbarWrap
      pointerEvents="none"
      style={{
        bottom: bottomOffset,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <IconWrap
        style={{
          backgroundColor: variant === 'error' ? '#000' : '#000',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>
          {variant === 'error' ? '✕' : '✓'}
        </Text>
      </IconWrap>

      <Text
        style={{
          color: '#000',
          fontWeight: '700',
          fontSize: 14,
          flex: 1,
        }}
        numberOfLines={2}
      >
        {message}
      </Text>
    </SnackbarWrap>
  );
}
