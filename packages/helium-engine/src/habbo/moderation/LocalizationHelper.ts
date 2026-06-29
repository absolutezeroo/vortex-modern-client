/**
 * Static localization helper for moderation issue categories and sources.
 *
 * Maps source IDs and category IDs to human-readable names.
 * Falls back to a localization manager if available, otherwise
 * uses hardcoded mappings.
 *
 * @see source_as_win63/habbo/moderation/class_3472.as
 */
export class LocalizationHelper
{
	private static _localization: { getLocalization(key: string): string | null } | null = null;

	/**
	 * Set the localization manager for looking up translated category names.
	 *
	 * @param manager - The localization manager instance
	 */
	static setLocalizationManager(manager: { getLocalization(key: string): string | null } | null): void
	{
		LocalizationHelper._localization = manager;
	}

	/**
	 * Get a human-readable name for an issue source ID.
	 *
	 * @param sourceId - The source ID
	 * @returns The source name
	 */
	static getSourceName(sourceId: number): string
	{
		switch (sourceId)
		{
			case 1:
			case 2:
				return 'Normal';
			case 3:
				return 'Automatic';
			case 4:
				return 'Automatic IM';
			case 5:
				return 'Guide System';
			case 6:
				return 'IM';
			case 7:
				return 'Room';
			case 8:
				return 'Panic';
			case 9:
				return 'Guardian';
			case 10:
				return 'Automatic Helper';
			case 11:
				return 'Discussion';
			case 12:
				return 'Selfie';
			case 14:
				return 'Photo';
			case 15:
				return 'Ambassador';
			default:
				return 'Unknown';
		}
	}

	/**
	 * Get a human-readable name for an issue category ID.
	 *
	 * First attempts to use the localization manager to get a translated name.
	 * Falls back to hardcoded English names.
	 *
	 * @param categoryId - The category ID
	 * @returns The category name
	 */
	static getCategoryName(categoryId: number): string
	{
		if (LocalizationHelper._localization !== null)
		{
			const localized = LocalizationHelper._localization.getLocalization('help.cfh.topic.' + categoryId);

			if (localized !== null && localized !== '')
			{
				return localized;
			}
		}

		switch (categoryId)
		{
			case 0:
				return 'Automatic';
			case 101:
				return 'Sex';
			case 102:
				return 'PII';
			case 103:
				return 'Scam';
			case 104:
				return 'Bullying';
			case 105:
				return 'Disruption';
			case 106:
				return 'Other';
			case 111:
				return 'Sex';
			case 112:
				return 'Scam';
			case 113:
				return 'Disruption';
			case 114:
				return 'Other';
			case 121:
				return 'Sex';
			case 122:
				return 'PII';
			case 123:
				return 'Bullying';
			case 124:
				return 'Other';
			case 130:
				return 'Hate';
			case 131:
				return 'Violence';
			case 132:
				return 'Sex';
			case 133:
				return 'Illegal';
			case 134:
				return 'PII';
			case 135:
				return 'Copyright';
			case 136:
				return 'Spam';
			case 1024:
				return 'Guide';
			case 1025:
				return 'Bullying';
			case 1026:
				return 'Severe Alert';
			default:
				return 'Unknown';
		}
	}
}
