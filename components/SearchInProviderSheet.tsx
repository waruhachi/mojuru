import { FRAME_MARGIN } from '@/constants/Utils';
import { useMediaMatchCache } from '@/hooks/useMediaMatchCache';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { useResolvedPlugin } from '@/lib/plugins/useResolvedPlugin';
import { MediaData } from '@/models/mediaData';
import { MediaResult, Plugin } from '@/models/plugins';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	TouchableOpacity,
	View
} from 'react-native';
import ActionSheet, {
	ActionSheetRef,
	registerSheet,
	SheetManager
} from 'react-native-actions-sheet';

import AnimeEntryPoor from './AnimeEntryPoor';
import Heading from './ui/Heading';
import SearchBar from './ui/SearchBar';
import Txt from './ui/Txt';

const SearchInProviderSheet: React.FC<{
	payload: {
		media: MediaData;
		number?: number;
		forcedPlugin?: Plugin;
	};
}> = ({ payload: { media, number, forcedPlugin } }) => {
	const { store } = useStore();
	const { plugin } = useResolvedPlugin(forcedPlugin);
	const { searchInPlugin, searchMatchInPlugin } = usePluginManager(
		plugin?.metadata.pluginProvider
	);
	const { getMatchedMedia, setMediaMatch } = useMediaMatchCache();
	const { theme } = useTheme();

	const actionSheetRef = useRef<ActionSheetRef>(null);
	const [actionSheetLoading, setActionSheetLoading] =
		useState<boolean>(false);
	const [automaticMatchResults, setAutomaticMatchResults] = useState<
		MediaResult[]
	>([]);

	useEffect(() => {
		let isCancelled = false;

		const runSearchFlow = async () => {
			if (!plugin) {
				Alert.alert(
					'Plugin Required',
					'You need to install and select a plugin first!',
					[{ text: 'OK' }]
				);
				SheetManager.hide('search-in-provider-sheet');
				return;
			}

			const match = getMatchedMedia(
				media.provider,
				media.id.toString(),
				plugin?.metadata?.name ?? null
			);

			if (match && store.matchCachingEnabled) {
				SheetManager.hide('search-in-provider-sheet', {
					payload: { providerMediaId: match.id } as any
				});
				return;
			}

			setActionSheetLoading(true);
			try {
				const results = await searchMatchInPlugin(
					plugin?.metadata?.name ?? null,
					media
				);
				if (!isCancelled && results) {
					setAutomaticMatchResults([results]);
				}
			} catch (error) {
				console.log(error);
			} finally {
				if (!isCancelled) setActionSheetLoading(false);
			}
		};

		runSearchFlow();

		return () => {
			isCancelled = true;
		};
	}, [
		plugin,
		media.provider,
		media.id,
		store.matchCachingEnabled,
		getMatchedMedia,
		searchMatchInPlugin,
		media
	]);

	const handleActionSheetSearch = () => {
		setActionSheetLoading(true);
	};

	const handleActionSheetDeouncedSearch = async (query: string) => {
		if (query === '') {
			setAutomaticMatchResults([]);
			setActionSheetLoading(false);
			return;
		}

		setActionSheetLoading(true);

		try {
			const results = await searchInPlugin(
				plugin?.metadata?.name ?? null,
				query
			);
			if (results) setAutomaticMatchResults(results);
		} catch (error) {
			console.log(error);
		} finally {
			setActionSheetLoading(false);
		}
	};

	const hideWithResult = async (providerMediaId: string) => {
		SheetManager.hide('search-in-provider-sheet', {
			payload: { providerMediaId } as any
		});
	};

	const handleCardPress = async (mediaResult: MediaResult) => {
		// remember matching choice
		if (store.matchCachingEnabled)
			await setMediaMatch(
				media.provider,
				media.id.toString(),
				plugin?.metadata?.name ?? null,
				mediaResult.id,
				mediaResult
			);
		hideWithResult(mediaResult.id);
	};

	return (
		<View style={{ width: '100%' }}>
			<ActionSheet
				id='search-in-provider-sheet'
				ref={actionSheetRef}
				gestureEnabled
				containerStyle={{
					backgroundColor: theme.background.toString(),
					paddingTop: 4
				}}
				indicatorStyle={{
					backgroundColor: theme.textMuted,
					height: 3
				}}
			>
				<View style={{ marginTop: 8 }}>
					<View style={{ paddingHorizontal: FRAME_MARGIN, gap: 10 }}>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}
						>
							<Heading text='Match media' />
							<TouchableOpacity
								activeOpacity={0.5}
								onPress={() => {
									actionSheetRef.current?.hide();
									router.push('/what-is-select-source');
								}}
							>
								<Txt
									style={{
										color: theme.textMuted,
										fontSize: 15,
										textAlign: 'right'
									}}
								>
									What is this?
								</Txt>
							</TouchableOpacity>
						</View>

						<SearchBar
							onChangeText={handleActionSheetSearch}
							onDebounceChangeText={
								handleActionSheetDeouncedSearch
							}
						/>
					</View>

					<View style={{ height: 200, marginTop: 24 }}>
						{actionSheetLoading ?
							<ActivityIndicator color={theme.textMuted} />
						:	automaticMatchResults.length > 0 && (
								<FlatList
									data={automaticMatchResults}
									horizontal
									showsHorizontalScrollIndicator={false}
									keyExtractor={(_, index) =>
										index.toString()
									}
									style={{ paddingLeft: FRAME_MARGIN }}
									renderItem={({
										item,
										index
									}: {
										item: MediaResult;
										index: number;
									}) => (
										<AnimeEntryPoor
											key={index}
											mediaResult={item}
											onPress={() => {
												handleCardPress(item);
											}}
										/>
									)}
								/>
							)
						}
					</View>
				</View>
			</ActionSheet>
		</View>
	);
};

registerSheet('search-in-provider-sheet', SearchInProviderSheet);

export default SearchInProviderSheet;
