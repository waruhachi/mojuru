import { MediaData } from '@/models/mediaData';

import { useMemo } from 'react';
import { useStore } from './useStore';
import useTheme from './useTheme';

/**
 * Returns the appropriate color(s) based on the user's preference
 * between theme colors and media cover colors.
 */
const useDynColors = (media: MediaData) => {
	const { theme } = useTheme();
	const { store } = useStore();

	const dynColors = useMemo(() => {
		const defaultThemeColors = {
			primary: theme.primary.toString(),
			dark: theme.foreground.toString(),
			darker: theme.background.toString()
		};

		if (
			store.dynColors &&
			media?.color &&
			media?.darkColor &&
			media?.darkerColor
		) {
			return {
				primary: media.color,
				dark: media.darkColor,
				darker: media.darkerColor
			};
		}

		return defaultThemeColors;
	}, [
		store.dynColors,
		media?.color,
		media?.darkColor,
		media?.darkerColor,
		theme.primary,
		theme.foreground,
		theme.background
	]);

	return { dynColors };
};

export default useDynColors;
