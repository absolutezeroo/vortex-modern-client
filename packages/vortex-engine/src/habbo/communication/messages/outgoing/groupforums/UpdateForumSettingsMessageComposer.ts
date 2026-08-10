import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Change which group rank each forum right requires.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/UpdateForumSettingsMessageComposer.as
 * (`_SafeCls_2662` in the primary tree; header 2793 from its registry)
 */
export class UpdateForumSettingsMessageComposer extends MessageComposer<[number, number, number, number, number]>
{
    private _data: [number, number, number, number, number];

    constructor(groupId: number, readPermissions: number, postMessagePermissions: number, postThreadPermissions: number, moderatePermissions: number)
    {
        super();

        this._data = [groupId, readPermissions, postMessagePermissions, postThreadPermissions, moderatePermissions];
    }

    // AS3: .../groupforums/UpdateForumSettingsMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number, number]
    {
        return this._data;
    }
}
