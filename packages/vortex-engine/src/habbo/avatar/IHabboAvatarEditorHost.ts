import type {EventEmitter} from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IAvatarRenderManager} from './IAvatarRenderManager';
import type {IFigurePartSet} from './structure/figure/IFigurePartSet';
import type {ICategoryModel} from './common/ICategoryModel';
import type {IFigureSetOwnership} from './common/IFigureSetOwnership';
import type {IAvatarEditorMessageHandler} from './IAvatarEditorMessageHandler';

/**
 * Everything one `HabboAvatarEditor` needs from the manager that owns it.
 *
 * TS-only: AS3's editor holds `HabboAvatarEditorManager` directly and reaches through it — often
 * two levels, as in `manager.windowManager.assets.getAssetByName(...)`. Flattened to the members
 * actually used, so the editor can be constructed and tested against a stub;
 * `HabboAvatarEditorManager` implements it.
 *
 * The last two members have no AS3 counterpart as *methods*: AS3 constructs its grid items inline
 * from static window templates. They are delegated here so the view slice can supply real,
 * window-backed items without reopening `HabboAvatarEditor`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/HabboAvatarEditorManager.as
 */
export interface IHabboAvatarEditorHost
{
    // AS3: .../avatar/HabboAvatarEditorManager.as::get events()
    readonly events: EventEmitter;

    // AS3: .../avatar/HabboAvatarEditorManager.as::get avatarRenderManager()
    readonly avatarRenderManager: IAvatarRenderManager | null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::get sessionData()
    readonly sessionData: ISessionDataManager | null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::get handler()
    readonly handler: IAvatarEditorMessageHandler | null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::get communication()
    // Flattened to the connection, which is all the editor uses it for.
    readonly connection: IConnection | null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::get inventory()
    // Narrowed — the editor asks the inventory exactly one question. See `IFigureSetOwnership`.
    readonly inventory: IFigureSetOwnership | null;

    /**
     * AS3: .../avatar/HabboAvatarEditorManager.as::get inventory()
     *
     * The same inventory, for the two effect calls `saveCurrentSelection()` makes. Separate from
     * `inventory` because the two surfaces are unrelated and this one may be absent independently.
     */
    // AS3: .../avatar/HabboAvatarEditorManager.as::get inventory()
    readonly effectInventory: {
        setEffectSelected(effectType: number): void;
        deselectAllEffects(force: boolean): void;
    } | null;

    // AS3: .../src/com/sulake/core/runtime/_SafeCls_50.as::getBoolean()
    getBoolean(key: string): boolean;

    // AS3: .../src/com/sulake/habbo/catalog/IHabboCatalog.as::verifyClubLevel()
    verifyClubLevel(): boolean;

    // AS3: .../src/com/sulake/habbo/catalog/IHabboCatalog.as::openClubCenter()
    openClubCenter(): void;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::getMandatoryAvatarPartSetIds()
    getMandatoryAvatarPartSetIds(gender: string, clubLevel: number): string[];

    /**
     * TS-only: AS3 reads these straight off `windowManager.assets`. Flattened because the editor
     * needs exactly two named bitmaps and nothing else from the asset library.
     */
    // TS-only: flattens AS3's `windowManager.assets.getAssetByName(name).content`.
    getAssetBitmap(name: string): ImageBitmap | null;

    /**
     * TS-only: AS3 builds `AvatarEditorGridPartItem` inline, cloning `AvatarEditorView.THUMB_WINDOW`.
     *
     * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/common/
     * AvatarEditorGridPartItem.as — not ported (514 l., window-backed). The manager currently
     * returns a plain data item satisfying `IAvatarEditorGridPartItem`; the view slice replaces it.
     */
    // TS-only: stands in for AS3's inline `new AvatarEditorGridPartItem(...)`.
    createGridPartItem(
        model: ICategoryModel,
        partSet: IFigurePartSet | null,
        colours: unknown[] | null,
        colourable: boolean,
        disabled: boolean
    ): {iconImage: ImageBitmap | null} | null;

    /**
     * TS-only: the colour equivalent.
     *
     * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/common/
     * AvatarEditorGridColorItem.as — not ported (145 l., window-backed).
     */
    // TS-only: stands in for AS3's inline `new AvatarEditorGridColorItem(...)`.
    createGridColorItem(model: ICategoryModel, colour: unknown, disabled: boolean): unknown;
}
