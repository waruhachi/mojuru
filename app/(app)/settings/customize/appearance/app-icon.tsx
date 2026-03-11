import Frame from '@/components/Frame';
import {
	APP_ICONS,
	BORDER_RADIUS,
	FRAME_MARGIN,
	ICON_IMAGES
} from '@/constants/Utils';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { hapticVibrate } from '@/modules/utils/haptics';
import { capitalizeFirst } from '@/modules/utils/utils';
import { Image } from 'expo-image';
import { RotateCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const setDynamicAppIcon = async (iconName: string) => {
	try {
		const module =
			(await import('nixa-expo-dynamic-app-icon')) as unknown as {
				setAppIcon?: (
					name: string,
					defaultIcon: string
				) => string | false;
			};

		if (!module?.setAppIcon) {
			return false;
		}

		const result = module.setAppIcon(iconName, 'mojuru');
		return result !== false;
	} catch {
		return false;
	}
};

export default function AppIconSettingsScreen() {
	const { store, setStoreItem } = useStore();
	const { theme } = useTheme();

	const [error, setError] = useState<string | null>(null);

	const handleSelect = async (iconName: (typeof APP_ICONS)[number]) => {
		try {
			hapticVibrate();

			const changed = await setDynamicAppIcon(iconName);
			if (!changed) {
				const message =
					'Dynamic app icons are unavailable in this runtime. If you are using Expo Go, switch to a development build or production build.';
				setError(message);
				Alert.alert('Feature not available', message);
				return;
			}

			await setStoreItem('appIcon', iconName);
			setError(null);

			Alert.alert(
				'Icon changed!',
				`Mojuru app icon has been set to "${capitalizeFirst(iconName)}".`
			);
		} catch (e) {
			console.error(e);
			setError('Failed to set app icon.');
		}
	};

	return (
		<Frame
			isTab
			bigHeading='App Icon'
			showCollapsibleHeader
			collapsibleHeaderText='App Icons'
			rightIcons={[
				{
					icon: RotateCcw,
					onPress: () => {
						handleSelect('mojuru');
					},
					accent: theme.alert
				}
			]}
			backButton
		>
			<View style={{ marginHorizontal: FRAME_MARGIN, gap: 10 }}>
				{APP_ICONS.map((iconName, index) => (
					<AppIconItem
						key={index}
						iconName={iconName}
						isSelected={store.appIcon === iconName}
						onSelect={handleSelect}
					/>
				))}
				{error && (
					<Text
						style={{
							color: 'red',
							textAlign: 'center',
							marginTop: 10
						}}
					>
						{error}
					</Text>
				)}
			</View>
		</Frame>
	);
}

const AppIconItem: React.FC<{
	iconName: string;
	isSelected: boolean;
	onSelect: (name: (typeof APP_ICONS)[number]) => void;
}> = ({ iconName, isSelected, onSelect }) => {
	const { theme } = useTheme();

	const txt = isSelected ? theme.text : theme.textShy;
	const bg = isSelected ? theme.mist : theme.foreground;

	return (
		<TouchableOpacity
			activeOpacity={0.5}
			onPress={() => onSelect(iconName as any)}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				gap: 10,
				height: 67,
				paddingHorizontal: 16,
				borderRadius: BORDER_RADIUS * 2,
				borderWidth: 1,
				borderColor: bg,
				backgroundColor: bg
			}}
		>
			<Image
				source={ICON_IMAGES[iconName]}
				style={{
					width: 48,
					height: 48,
					borderRadius: 6,
					backgroundColor: theme.mist
				}}
			/>
			<Text
				style={{
					color: txt,
					fontFamily: 'SemiBold',
					fontSize: 15
				}}
			>
				{capitalizeFirst(iconName)}
			</Text>
		</TouchableOpacity>
	);
};
