import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {AddonDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/AddonDefinition';

import type {IWiredElement} from '../IWiredElement';
import type {IWiredTypeHolder} from '../IWiredTypeHolder';

/**
 * AddonTypes — the wired addon registry (IWiredTypeHolder).
 *
 * PORT GAP: no addon types are ported yet (the whole addons/ category is pending — TODO(AS3)), so
 * `_types` is empty and getElementByCode returns null for every code. The registry still exists so the
 * controller can resolve the addon holder and no addon dialog opens until the types land.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/AddonTypes.as
 */
export class AddonTypes implements IWiredTypeHolder
{
    // AS3: AddonTypes.as::_types (empty until the addons category is ported)
    private _types: IWiredElement[] = [];

    // AS3: AddonTypes.as::getByCode()
    getByCode(code: number): IWiredElement | null
    {
        for(const type of this._types)
        {
            if(type.code === code)
            {
                return type;
            }
        }

        return null;
    }

    // AS3: AddonTypes.as::getElementByCode()
    getElementByCode(code: number): IWiredElement
    {
        return this.getByCode(code) as IWiredElement;
    }

    // AS3: AddonTypes.as::getKey()
    getKey(): string
    {
        return 'addon';
    }

    // AS3: AddonTypes.as::acceptTriggerable()
    acceptTriggerable(triggerable: Triggerable): boolean
    {
        return triggerable instanceof AddonDefinition;
    }
}
