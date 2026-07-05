import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native'

/**
   * Shared notification banner, shown at the top of a screen for budget
   * alerts, goal milestones, and other app notifications (mirrors the
   * web app's notification alerts described in the README features list).
   *
   * Props:
   *   visible   - whether the banner is shown
   *   message   - text to display
   *   variant   - 'info' | 'success' | 'warning' | 'error'
   *   onDismiss - called when the user taps the banner to dismiss it
   */
const VARIANT_COLORS = {
    info: '#2563eb',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
}

export default function NotificationBanner({
    visible,
    message,
    variant = 'info',
    onDismiss,
}) {
    const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
        Animated.timing(opacity, {
                toValue: visible ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
        }).start()
  }, [visible, opacity])

  if (!visible || !message) {
        return null
  }

  return (
        <Animated.View
        style={[
                  styles.banner,
        { backgroundColor: VARIANT_COLORS[variant] ?? VARIANT_COLORS.info, opacity },
                ]}
      >
                <TouchableOpacity onPress={onDismiss} activeOpacity={0.8} style={styles.touchable}>
        <Text style={styles.text}>{message}</Text>
          </TouchableOpacity>
          </Animated.View>
    )
}

const styles = StyleSheet.create({
    banner: {
          width: '100%',
          paddingVertical: 10,
          paddingHorizontal: 16,
    },
    touchable: {
          width: '100%',
    },
    text: {
          color: '#ffffff',
          fontSize: 14,
          fontWeight: '600',
    },
})
