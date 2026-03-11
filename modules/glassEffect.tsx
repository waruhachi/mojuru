import { BlurView } from 'expo-blur';
import {
	GlassContainer,
	GlassView,
	isGlassEffectAPIAvailable,
	isLiquidGlassAvailable
} from 'expo-glass-effect';
import React from 'react';
import { Platform } from 'react-native';

type BlurTint = 'default' | 'light' | 'dark';

export const canUseGlassEffect = () => {
	if (Platform.OS !== 'ios') return false;

	try {
		return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
	} catch {
		return false;
	}
};

type SafeGlassViewProps = React.ComponentProps<typeof GlassView> & {
	fallbackIntensity?: number;
	fallbackTint?: BlurTint;
};

export const SafeGlassView: React.FC<SafeGlassViewProps> = ({
	fallbackIntensity = 85,
	fallbackTint = 'dark',
	style,
	children,
	...rest
}) => {
	if (canUseGlassEffect()) {
		return (
			<GlassView
				style={style}
				{...rest}
			>
				{children}
			</GlassView>
		);
	}

	return (
		<BlurView
			intensity={fallbackIntensity}
			tint={fallbackTint}
			style={style}
		>
			{children}
		</BlurView>
	);
};

type SafeGlassContainerProps = React.ComponentProps<typeof GlassContainer> & {
	fallbackIntensity?: number;
	fallbackTint?: BlurTint;
};

export const SafeGlassContainer: React.FC<SafeGlassContainerProps> = ({
	fallbackIntensity = 85,
	fallbackTint = 'dark',
	style,
	children,
	...rest
}) => {
	if (canUseGlassEffect()) {
		return (
			<GlassContainer
				style={style}
				{...rest}
			>
				{children}
			</GlassContainer>
		);
	}

	return (
		<BlurView
			intensity={fallbackIntensity}
			tint={fallbackTint}
			style={style}
		>
			{children}
		</BlurView>
	);
};

export {
	GlassContainer,
	GlassView,
	isGlassEffectAPIAvailable,
	isLiquidGlassAvailable
};
