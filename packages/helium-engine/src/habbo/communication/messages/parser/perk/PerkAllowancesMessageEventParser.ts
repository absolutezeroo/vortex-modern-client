import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {PerkAllowanceData} from './PerkAllowanceData';

/**
 * Parser for perk allowance data.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/perk/PerkAllowancesMessageEventParser.as
 */
export class PerkAllowancesMessageEventParser implements IMessageParser
{
	private _perks: PerkAllowanceData[] = [];

	flush(): boolean
	{
		this._perks.length = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper)
		{
			return false;
		}

		this._perks.length = 0;

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			const perk = new PerkAllowanceData();
			perk.code = wrapper.readString();
			perk.errorMessage = wrapper.readString();
			perk.isAllowed = wrapper.readBoolean();
			this._perks.push(perk);
		}

		return true;
	}

	getPerks(): PerkAllowanceData[]
	{
		return this._perks;
	}

	isPerkAllowed(code: string): boolean
	{
		const perk = this.getPerk(code);

		return perk !== null && perk.isAllowed;
	}

	getPerk(code: string): PerkAllowanceData | null
	{
		for (const perk of this._perks)
		{
			if (perk.code === code)
			{
				return perk;
			}
		}

		return null;
	}
}
