import { mediaAtom } from '@/atoms';
import { MediaData } from '@/models/mediaData';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

export function useMedia() {
	const mediaState = useAtomValue(mediaAtom);
	const setMedia = useSetAtom(mediaAtom);

	const getMedia = useCallback(
		(provider: string, id: string | number): MediaData | undefined => {
			return mediaState?.[provider]?.[id];
		},
		[mediaState]
	);

	const ensureMedia = useCallback(
		(provider: string, media: MediaData): void => {
			setMedia((prev) => {
				if (prev[provider]?.[media.id]) return prev;
				return {
					...prev,
					[provider]: {
						...(prev[provider] || {}),
						[media.id]: media
					}
				};
			});
		},
		[setMedia]
	);

	const setFullMedia = useCallback(
		(provider: string, media: MediaData): void => {
			setMedia((prev) => ({
				...prev,
				[provider]: {
					...(prev[provider] || {}),
					[media.id]: media
				}
			}));
		},
		[setMedia]
	);

	const updateMedia = useCallback(
		(
			provider: string,
			id: string | number,
			partial: Partial<MediaData>
		): void => {
			setMedia((prev) => ({
				...prev,
				[provider]: {
					...(prev[provider] || {}),
					[id]: {
						...(prev[provider]?.[id] || {}),
						...partial
					}
				}
			}));
		},
		[setMedia]
	);

	const removeMedia = useCallback(
		(provider: string, id: string | number): void => {
			setMedia((prev) => {
				if (!prev[provider]?.[id]) return prev;
				const { [id]: _, ...rest } = prev[provider];
				return {
					...prev,
					[provider]: rest
				};
			});
		},
		[setMedia]
	);

	const clearMedia = useCallback((): void => {
		setMedia({});
	}, [setMedia]);

	return {
		getMedia,
		ensureMedia,
		setFullMedia,
		updateMedia,
		removeMedia,
		clearMedia
	};
}
