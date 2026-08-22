/**
 * FurnitureFurniChestLogic
 *
 * The furni chest — a chest that floats the icons of the items it holds above itself.
 *
 * The server sends the contents as a `visuals` entry in the stuff data: semicolon-separated
 * `isWallItem,typeId[,extra]` triples. Each one is turned into a placeholder entry and an
 * ROFIAE_LOAD_FURNI_ICON request; the engine answers with a
 * `RoomObjectFurniIconUpdateMessage` once the icon has loaded, and only then is the real asset
 * name swapped in. The model always carries the whole comma-joined list, placeholders included,
 * because the visualization indexes into it positionally.
 *
 * Name DERIVED: `_SafeCls_1812` in the primary tree, absent from the 2016 one. Named for the
 * `furniture_furnichest` logic type the factory maps to it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {FurnitureChestLogic} from './FurnitureChestLogic';
import {RoomObjectDataUpdateMessage} from '@habbo/room/messages/RoomObjectDataUpdateMessage';
import {RoomObjectFurniIconUpdateMessage} from '@habbo/room/messages/RoomObjectFurniIconUpdateMessage';
import {RoomObjectFurniIconAssetEvent} from '@habbo/room/events/RoomObjectFurniIconAssetEvent';
import {MapStuffData} from '@habbo/room/object/data/MapStuffData';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureFurniChestLogic extends FurnitureChestLogic
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::LOADING_ICON_PLACEHOLDER
    private static readonly LOADING_ICON_PLACEHOLDER: string = 'loading_icon';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::VISUALS_KEY
    private static readonly VISUALS_KEY: string = 'visuals';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::_SafeStr_8028
    private _visuals: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::_assetNamesForVisuals
    private _assetNamesForVisuals: Map<string, string> = new Map();

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::itemTypeToString()
    private static itemTypeToString(wallItem: boolean, typeId: number, extra: string): string
    {
        let key = `${wallItem},${typeId}`;

        if(extra !== '') key += `,${extra}`;

        return key;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::stringToItemType()
    private static stringToItemType(value: string): {isWallItem: boolean; typeId: number; extra: string}
    {
        const parts = value.split(',');

        return {
            isWallItem: parts[0] === 'true',
            typeId: parseInt(parts[1], 10) || 0,
            extra: parts.length > 2 ? parts[2] : ''
        };
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::getEventTypes()
    override getEventTypes(): string[]
    {
        return this.getAllEventTypes(super.getEventTypes(), [RoomObjectFurniIconAssetEvent.LOAD_FURNI_ICON]);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::processUpdateMessage()
    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        super.processUpdateMessage(message);

        if(message instanceof RoomObjectDataUpdateMessage)
        {
            const data = message.data;

            if(data instanceof MapStuffData)
            {
                let visuals = data.getValue(FurnitureFurniChestLogic.VISUALS_KEY);

                // The chest only shows its contents in an odd state — the open one.
                if(message.state % 2 !== 1) visuals = '';

                if(visuals !== null && visuals !== this._visuals)
                {
                    this._visuals = visuals;

                    this.onVisualsChange();

                    this.object?.getModelController()?.setString(
                        RoomObjectVariableEnum.FURNITURE_FURNI_CHEST_SHOWN_ASSET_NAMES, this.shownAssetsString
                    );

                    this.update(performance.now());
                }
            }
        }

        if(message instanceof RoomObjectFurniIconUpdateMessage)
        {
            if(message.assetName !== FurnitureFurniChestLogic.LOADING_ICON_PLACEHOLDER)
            {
                const key = FurnitureFurniChestLogic.itemTypeToString(message.wallItem, message.typeId, message.extra);

                if(this._assetNamesForVisuals.get(key) === FurnitureFurniChestLogic.LOADING_ICON_PLACEHOLDER)
                {
                    this._assetNamesForVisuals.set(key, message.assetName);

                    this.object?.getModelController()?.setString(
                        RoomObjectVariableEnum.FURNITURE_FURNI_CHEST_SHOWN_ASSET_NAMES, this.shownAssetsString
                    );

                    this.update(performance.now());
                }
            }
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::onVisualsChange()
    private onVisualsChange(): void
    {
        this._assetNamesForVisuals = new Map();

        for(const entry of this._visuals.split(';'))
        {
            if(entry === '') continue;

            this._assetNamesForVisuals.set(entry, FurnitureFurniChestLogic.LOADING_ICON_PLACEHOLDER);

            const item = FurnitureFurniChestLogic.stringToItemType(entry);

            if(this.eventDispatcher === null || this.object === null) continue;

            this.eventDispatcher.emit(
                RoomObjectFurniIconAssetEvent.LOAD_FURNI_ICON,
                new RoomObjectFurniIconAssetEvent(
                    RoomObjectFurniIconAssetEvent.LOAD_FURNI_ICON,
                    this.object,
                    item.isWallItem,
                    item.typeId,
                    item.extra
                )
            );
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1812.as::get shownAssetsString()
    private get shownAssetsString(): string
    {
        const names: string[] = [];

        for(const entry of this._visuals.split(';'))
        {
            if(entry === '') continue;

            // AS3 pushes the map's raw value here, so an entry the map does not know yet
            // contributes an empty slot rather than shifting the ones after it.
            names.push(this._assetNamesForVisuals.get(entry) ?? '');
        }

        return names.join(',');
    }
}
