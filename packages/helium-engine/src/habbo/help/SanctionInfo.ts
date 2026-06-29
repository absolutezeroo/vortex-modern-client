import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('SanctionInfo');

/**
 * Sanction information display handler
 *
 * Processes sanction status events and formats ban/mute/alert messages
 * with probation day calculations.
 *
 * @see source_as_win63/habbo/help/SanctionInfo.as
 */
export class SanctionInfo
{
	private _disposed: boolean = false;

	/**
	 * Whether this handler has been disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Handle sanction status from server
	 *
	 * @param sanctionName The sanction type name (ALERT, MUTE, BAN_PERMANENT, etc.)
	 * @param sanctionReason The reason for the sanction
	 * @param sanctionLengthHours Duration in hours
	 * @param sanctionCreationTime When the sanction was created
	 * @param probationHoursLeft Hours remaining on probation
	 * @param isSanctionNew Whether this is a new sanction
	 * @param isSanctionActive Whether the sanction is currently active
	 * @param hasCustomMute Whether the user has a custom mute
	 * @param tradeLockExpiryTime When the trade lock expires
	 */
	onSanctionStatus(
		sanctionName: string,
		sanctionReason: string,
		sanctionLengthHours: number,
		sanctionCreationTime: string,
		probationHoursLeft: number,
		isSanctionNew: boolean,
		isSanctionActive: boolean,
		hasCustomMute: boolean,
		tradeLockExpiryTime: string
	): void
	{
		log.debug('Sanction status received -',
			'name:', sanctionName,
			'reason:', sanctionReason,
			'hours:', sanctionLengthHours,
			'new:', isSanctionNew,
			'active:', isSanctionActive
		);

		if (sanctionReason === 'cfh.reason.EMPTY')
		{
			log.debug('No sanction history');
			return;
		}

		const typeDesc = this.getSanctionTypeDescription('current', sanctionName, sanctionLengthHours);
		log.debug('Sanction type:', typeDesc);

		if (!isSanctionActive && probationHoursLeft > 0)
		{
			const daysLeft = Math.floor(probationHoursLeft / 24) + 1;
			log.debug('Probation days left:', daysLeft);
		}
	}

	/**
	 * Get a human-readable description of a sanction type
	 *
	 * @param prefix The prefix for the localization key (current/next)
	 * @param sanctionName The sanction type name
	 * @param lengthHours The sanction duration in hours
	 * @returns The localization key suffix for the sanction type
	 */
	getSanctionTypeDescription(prefix: string, sanctionName: string, lengthHours: number): string
	{
		let key = 'help.sanction.' + prefix;

		switch (sanctionName)
		{
			case 'ALERT':
				key += '.alert';
				break;
			case 'MUTE':
				key += '.mute';
				break;
			case 'BAN_PERMANENT':
				key += '.permban';
				break;
			default:
				key += '.ban';

				if (lengthHours > 24)
				{
					key += '.days';
					return key;
				}
				break;
		}

		return key;
	}

	/**
	 * Dispose of this handler
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
	}
}
