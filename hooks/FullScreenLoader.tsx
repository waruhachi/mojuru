// components/FullScreenLoader.tsx
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

type LoaderState = {
	visible: boolean;
	message: string;
	textColor: string;
};

type LoaderControl = {
	showLoader: (message: string, color?: string) => void;
	hideLoader: () => void;
	updateLoader: (message?: string, color?: string) => void;
};

const noopControl: LoaderControl = {
	showLoader: () => undefined,
	hideLoader: () => undefined,
	updateLoader: () => undefined
};

let control: LoaderControl = noopControl;

export const useFullScreenLoader = (): LoaderControl => {
	return control;
};

const FullScreenLoader = () => {
	const [state, setState] = useState<LoaderState>({
		visible: false,
		message: 'Loading...',
		textColor: '#fff'
	});

	useEffect(() => {
		control = {
			showLoader: (message, color = '#fff') =>
				setState({ visible: true, message, textColor: color }),
			hideLoader: () => setState((s) => ({ ...s, visible: false })),
			updateLoader: (message, color) =>
				setState((s) => ({
					...s,
					message: message ?? s.message,
					textColor: color ?? s.textColor
				}))
		};
	}, []);

	if (!state.visible) return null;

	return (
		<Modal
			visible
			transparent
			animationType='fade'
		>
			<BlurView
				intensity={50}
				tint='dark'
				style={styles.blurContainer}
			>
				<View style={styles.loaderContainer}>
					<ActivityIndicator
						size='large'
						color={state.textColor}
					/>
					<Text style={[styles.message, { color: state.textColor }]}>
						{state.message}
					</Text>
				</View>
			</BlurView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	blurContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	loaderContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		borderRadius: 16
	},
	message: {
		marginTop: 16,
		fontSize: 16,
		textAlign: 'center'
	}
});

export default FullScreenLoader;
