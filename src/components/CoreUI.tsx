import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Line,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInDown,
  SlideOutDown,
  Easing,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { TOKEN_STYLE, fmtAxisDate } from '../lib/mockData';
import { lightColors, useColors } from '../lib/theme';

export type Colors = import('../lib/theme').Colors;

// Static light-mode reference kept for external TS usage
export const C = lightColors;

export const fonts = {
  display: 'Fraunces_400Regular',
  displayMed: 'Fraunces_500Medium',
  displayItalic: 'Fraunces_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMed: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export type IconName =
  | 'wallet'
  | 'chevron-down'
  | 'chevron-right'
  | 'search'
  | 'x'
  | 'swap'
  | 'check'
  | 'info'
  | 'copy'
  | 'spark'
  | 'settings'
  | 'arrow-up'
  | 'arrow-down'
  | 'globe'
  | 'terminal'
  | 'moon'
  | 'sun';

export function Icon({
  name,
  size = 18,
  color = 'currentColor',
  stroke = 1.7,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = { stroke: color, strokeWidth: stroke, strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const, fill: 'none' };
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {name === 'wallet' && <><Path {...p} d="M3 7h15v11H3z" /><Path {...p} d="M3 7l3-3h12v3" /><Circle {...p} cx="15" cy="12.5" r="1.2" /></>}
        {name === 'chevron-down' && <Path {...p} d="M5 9l7 7 7-7" />}
        {name === 'chevron-right' && <Path {...p} d="M9 5l7 7-7 7" />}
        {name === 'search' && <><Circle {...p} cx="11" cy="11" r="6" /><Path {...p} d="M20 20l-4-4" /></>}
        {name === 'x' && <Path {...p} d="M5 5l14 14M19 5L5 19" />}
        {name === 'swap' && <Path {...p} d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4" />}
        {name === 'check' && <Path {...p} d="M4 12l5 5L20 6" />}
        {name === 'info' && <><Circle {...p} cx="12" cy="12" r="9" /><Path {...p} d="M12 11v6M12 7.5v.5" /></>}
        {name === 'copy' && <><Rect {...p} x="8" y="8" width="12" height="12" /><Path {...p} d="M16 4H4v12h4" /></>}
        {name === 'spark' && <Path {...p} d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l4.2 4.2M14.3 14.3l4.2 4.2M18.5 5.5l-4.2 4.2M9.7 14.3l-4.2 4.2" />}
        {name === 'settings' && <><Circle {...p} cx="12" cy="12" r="3" /><Path {...p} d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>}
        {name === 'arrow-up' && <Path {...p} d="M12 20V4M5 11l7-7 7 7" />}
        {name === 'arrow-down' && <Path {...p} d="M12 4v16M5 13l7 7 7-7" />}
        {name === 'globe' && <><Circle {...p} cx="12" cy="12" r="9" /><Path {...p} d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" /></>}
        {name === 'terminal' && <><Rect {...p} x="3" y="4" width="18" height="16" /><Path {...p} d="M7 9l3 3-3 3M12 16h5" /></>}
        {name === 'moon' && <Path {...p} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />}
        {name === 'sun' && <><Circle {...p} cx="12" cy="12" r="5" /><Path {...p} d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>}
      </Svg>
    </View>
  );
}

export function Mono({ children, style, ...props }: TextProps) {
  const colors = useColors();
  return <Text {...props} style={[{ fontFamily: fonts.mono, color: colors.ink }, style]}>{children}</Text>;
}

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const colors = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: fonts.sansSemi,
          fontSize: 10,
          letterSpacing: 2.6,
          textTransform: 'uppercase',
          color: colors.body,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
  pad = 16,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pad?: number;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.hairline,
          borderRadius: 20,
          padding: pad,
          shadowColor: '#14100c',
          shadowOpacity: 0.025,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 },
          elevation: 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  children,
  onPress,
  variant = 'accent',
  disabled,
  icon,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'accent' | 'ink' | 'outline' | 'surface' | 'positive' | 'merah';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variants = {
    accent: { backgroundColor: colors.accent, borderColor: colors.accent },
    ink: { backgroundColor: colors.ink, borderColor: colors.ink },
    outline: { backgroundColor: 'transparent', borderColor: colors.hairlineStrong },
    surface: { backgroundColor: colors.surface2, borderColor: colors.hairline },
    positive: { backgroundColor: colors.positive, borderColor: colors.positive },
    merah: { backgroundColor: colors.merah, borderColor: colors.merah },
  };
  const textColor = variant === 'outline' || variant === 'surface' ? colors.ink : colors.canvas;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => { if (!disabled) scale.value = withTiming(0.97, { duration: 80 }); }}
      onPressOut={() => { if (!disabled) scale.value = withTiming(1, { duration: 150 }); }}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Animated.View
        style={[
          {
            height: 56,
            gap: 9,
            borderWidth: 1,
            borderRadius: 14,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
          variants[variant],
          animatedStyle,
        ]}
      >
        {icon}
        <Text style={{ color: textColor, fontFamily: fonts.sansSemi, fontSize: 15 }}>{children}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function TokenAvatar({ ticker, size = 40 }: { ticker: string; size?: number }) {
  const colors = useColors();
  const s = TOKEN_STYLE[ticker] ?? { fill: colors.ink, glyph: ticker?.[1] ?? '•' };
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: s.fill,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Math.max(0, size * 0.25),
      }}
    >
      <Text style={{ color: '#fff', fontFamily: fonts.displayMed, fontSize: size * 0.48 }}>{s.glyph}</Text>
    </View>
  );
}

export function ScreenHeader({
  title,
  eyebrow,
  right,
  onBack,
  large = true,
}: {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  large?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: large ? 'flex-start' : 'center',
        gap: 12,
        paddingHorizontal: 18,
        paddingTop: large ? 16 : 10,
        paddingBottom: large ? 8 : 6,
      }}
    >
      {onBack && (
        <Pressable
          onPress={onBack}
          style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 99, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M15 5l-7 7 7 7" fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </Pressable>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && <Eyebrow style={{ marginBottom: large ? 6 : 2 }}>{eyebrow}</Eyebrow>}
        <Text style={{ fontFamily: fonts.display, fontSize: large ? 30 : 21, lineHeight: large ? 34 : 25, color: colors.ink, letterSpacing: large ? -0.6 : -0.42 }}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Segmented({ options, value, onChange, size = 'md' }: { options: { label: string; value: string }[]; value: string; onChange: (v: string) => void; size?: 'sm' | 'md' }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: 99, borderWidth: 1, borderColor: colors.hairline, padding: 3, gap: 2 }}>
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{ flex: 1, paddingVertical: size === 'sm' ? 6 : 9, paddingHorizontal: size === 'sm' ? 8 : 10, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.ink : 'transparent', borderRadius: 99 }}
          >
            <Text style={{ fontFamily: fonts.sansSemi, fontSize: size === 'sm' ? 12 : 13, lineHeight: size === 'sm' ? 14 : 15, includeFontPadding: false, color: on ? colors.canvas : colors.body }}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 42,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.hairline,
        borderRadius: 99,
        paddingHorizontal: 14,
      }}
    >
      <Icon name="search" size={17} color={colors.body} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search pBUMI, Telkom..."
        placeholderTextColor={colors.body}
        style={{ flex: 1, fontFamily: fonts.sans, color: colors.ink, fontSize: 14, padding: 0 }}
      />
      {!!value && (
        <Pressable onPress={() => onChange('')}>
          <Icon name="x" size={15} color={colors.body} />
        </Pressable>
      )}
    </View>
  );
}

export function BottomSheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = React.useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.46}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onChange={handleSheetChanges}
      enableDynamicSizing
      maxDynamicContentSize={Dimensions.get('window').height * 0.88}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.hairlineStrong, width: 40, height: 4.5 }}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 26 }}
      enableContentPanningGesture={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        bounces={false}
        contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom + 10) }}
      >
        {title && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 21, color: colors.ink, letterSpacing: -0.42 }}>{title}</Text>
            <Pressable onPress={onClose} style={{ width: 32, height: 32, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.hairline, borderRadius: 99, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={16} color={colors.body} />
            </Pressable>
          </View>
        )}
        <View style={{ paddingHorizontal: 20 }}>
          {children}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function buildPath(data: number[], w: number, h: number) {
  if (data.length < 2) return '';
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const pad = 2;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: pad + ((maxV - v) / range) * (h - pad * 2),
  }));
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX.toFixed(1)} ${prev.y.toFixed(1)}, ${cpX.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

export function Spark({ data, w = 54, h = 24, color }: { data: number[]; w?: number; h?: number; color?: string }) {
  const colors = useColors();
  const trend = data[data.length - 1] >= data[0];
  const stroke = color ?? (trend ? colors.positive : colors.merah);
  const d = useMemo(() => buildPath(data, w, h), [data, w, h]);
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Path d={d} stroke={stroke} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function AreaChart({
  data,
  height = 150,
  valueFormatter,
  range,
}: {
  data: { t: number; v: number }[];
  height?: number;
  valueFormatter: (v: number) => string;
  range: string;
}) {
  const colors = useColors();
  const W = Dimensions.get('window').width - 12;
  const H = height;
  const padL = 54;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const values = data.map((d) => d.v);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const padV = (maxV - minV) * 0.1 || maxV * 0.05 || 1;
  const lo = minV - padV;
  const hi = maxV + padV;
  const xAt = (i: number) => padL + (i / Math.max(1, data.length - 1)) * (W - padL - padR);
  const yAt = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const points = data.map((d, i) => [xAt(i), yAt(d.v)] as [number, number]);
  const path = smoothPath(points);
  const areaPath = `${path} L ${W - padR},${H - padB} L ${padL},${H - padB} Z`;
  const positive = data[data.length - 1].v >= data[0].v;
  const stroke = positive ? colors.positive : colors.merah;
  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  const xTickIdx = Array.from({ length: 4 }, (_, i) => Math.round((i / 3) * (data.length - 1)));

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <Path d={areaPath} fill={stroke} fillOpacity={0.1} />
      <Path d={path} stroke={stroke} strokeWidth={2} fill="none" />
      {ticks.map((tv, i) => {
        const y = yAt(tv);
        return (
          <G key={i}>
            <Line x1={padL} x2={W - padR} y1={y} y2={y} stroke={colors.hairline} strokeWidth={1} strokeDasharray={i === 0 || i === ticks.length - 1 ? undefined : '2 4'} />
            <SvgText x={padL - 8} y={y + 3} textAnchor="end" fill={colors.body} fontFamily={fonts.mono} fontSize="10">
              {valueFormatter(tv)}
            </SvgText>
          </G>
        );
      })}
      {xTickIdx.map((idx, i) => (
        <SvgText key={i} x={xAt(idx)} y={H - 10} textAnchor="middle" fill={colors.body} fontFamily={fonts.mono} fontSize="10">
          {fmtAxisDate(data[idx].t, range)}
        </SvgText>
      ))}
    </Svg>
  );
}

function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function Donut({
  data,
  size = 116,
  thickness = 18,
  palette,
}: {
  data: { label: string; v: number }[];
  size?: number;
  thickness?: number;
  palette: string[];
}) {
  const colors = useColors();
  const total = data.reduce((s, d) => s + d.v, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  let a0 = -Math.PI / 2;
  const segs = data.map((d, i) => {
    const a1 = a0 + (d.v / total) * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const path = `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
    a0 = a1;
    return { path, color: palette[i % palette.length] };
  });
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.hairline} strokeWidth={thickness} />
      {segs.map((s, i) => (
        <Path key={i} d={s.path} fill="none" stroke={s.color} strokeWidth={thickness} />
      ))}
    </Svg>
  );
}

export function LoadingInline() {
  const colors = useColors();
  return <ActivityIndicator color={colors.merah} />;
}
