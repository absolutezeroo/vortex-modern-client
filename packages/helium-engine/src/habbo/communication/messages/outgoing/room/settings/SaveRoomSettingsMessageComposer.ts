import {MessageComposer} from '@core/communication/messages/MessageComposer';
import type {RoomSettingsBuilder} from './RoomSettingsBuilder';

export class SaveRoomSettingsMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(settings: RoomSettingsBuilder)
    {
        super();

        const validTags = (settings.tags ?? []).filter((t) => t && t !== '');

        this._data = [
            settings.roomId,
            settings.name,
            settings.description,
            settings.doorMode,
            settings.password ?? '',
            settings.maximumVisitors,
            settings.categoryId,
            validTags.length,
            ...validTags,
            settings.tradeMode,
            settings.allowPets,
            settings.allowFoodConsume,
            settings.allowWalkThrough,
            settings.hideWalls,
            settings.wallThickness,
            settings.floorThickness,
            settings.whoCanMute,
            settings.whoCanKick,
            settings.whoCanBan,
            settings.chatMode,
            settings.chatBubbleSize,
            settings.chatScrollUpFrequency,
            settings.chatFullHearRange,
            settings.chatFloodSensitivity,
            settings.allowNavigatorDynCats,
        ];
    }

    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
