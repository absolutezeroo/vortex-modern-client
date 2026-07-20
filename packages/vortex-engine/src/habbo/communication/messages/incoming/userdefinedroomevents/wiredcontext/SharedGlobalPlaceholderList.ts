import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {SharedGlobalPlaceholder} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedGlobalPlaceholder';

/**
 * SharedGlobalPlaceholderList — a wired-context DTO carrying the list of shared global
 * placeholders. Constructed inline from the message stream: reads a count, then that many
 * SharedGlobalPlaceholder entries.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2576/SharedGlobalPlaceholderList.as
 */
export class SharedGlobalPlaceholderList
{
    // AS3: SharedGlobalPlaceholderList.as::_SafeStr_8402 (backing field for sharedPlaceholders)
    private _sharedPlaceholders: SharedGlobalPlaceholder[];

    // AS3: SharedGlobalPlaceholderList.as::SharedGlobalPlaceholderList()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._sharedPlaceholders = [];
        const count: number = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            this._sharedPlaceholders.push(new SharedGlobalPlaceholder(wrapper));
        }
    }

    // AS3: SharedGlobalPlaceholderList.as::get sharedPlaceholders()
    get sharedPlaceholders(): SharedGlobalPlaceholder[]
    {
        return this._sharedPlaceholders;
    }
}
