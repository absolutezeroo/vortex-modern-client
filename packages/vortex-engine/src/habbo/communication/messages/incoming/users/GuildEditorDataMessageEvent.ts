import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {GuildEditorData} from './GuildEditorData';
import {GuildEditorDataMessageParser} from '../../parser/users/GuildEditorDataMessageParser';

/**
 * GuildEditorDataMessageEvent (header 1132)
 *
 * The badge parts and colour palettes, requested once per session and cached by
 * `HabboGroupsManager` — both the creation wizard and the edit window need it before
 * their badge and colour steps can render.
 *
 * Name DERIVED from its payload (whose class name is recovered from the 2016 PRODUCTION
 * build), corroborated by the emulator's `GuildEditorDataMessageComposer = 1132`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2263.as
 */
export class GuildEditorDataMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildEditorDataMessageParser);
    }

    // AS3: .../_SafeCls_2263.as::get data()
    get data(): GuildEditorData | null
    {
        return (this._parser as GuildEditorDataMessageParser).data;
    }
}
