/* eslint-disable @typescript-eslint/no-explicit-any -- Component.dependencies is declared Array<ComponentDependency<any>>; matching it keeps the typed IID setters. */
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IContext} from '@core/runtime';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IAvatarRenderManager} from './IAvatarRenderManager';
import type {IAvatarEditorSaveListener} from './IAvatarEditorSaveListener';
import type {IFigurePartSet} from './structure/figure/IFigurePartSet';
import type {IPartColor} from './structure/figure/IPartColor';
import type {ICategoryModel} from './common/ICategoryModel';
import type {IFigureSetOwnership} from './common/IFigureSetOwnership';
import type {IHabboAvatarEditor} from './IHabboAvatarEditor';
import type {IHabboAvatarEditorHost} from './IHabboAvatarEditorHost';
import type {IAvatarEditorMessageHandler} from './IAvatarEditorMessageHandler';
import {Component, ComponentDependency} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import {OrderedMap} from '@core/utils/OrderedMap';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboInventory} from '@iid/IIDHabboInventory';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {AvatarEditorIdEnum} from './enum/AvatarEditorIdEnum';
import {AvatarEditorMessageHandler} from './AvatarEditorMessageHandler';
import {HabboAvatarEditor} from './HabboAvatarEditor';
import {AvatarEditorGridPartItem} from './common/AvatarEditorGridPartItem';
import {AvatarEditorGridColorItem} from './common/AvatarEditorGridColorItem';

const log = Logger.getLogger('habbo.avatar.HabboAvatarEditorManager');

/**
 * The avatar editor as a DI component: one `HabboAvatarEditor` per id, the shared network handler,
 * and the `avatareditor/` link route.
 *
 * This is what `IID_HabboAvatarEditor` resolves to.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/HabboAvatarEditorManager.as
 */
export class HabboAvatarEditorManager extends Component
    implements IHabboAvatarEditor, IHabboAvatarEditorHost, ILinkEventTracker
{
    // AS3: .../avatar/HabboAvatarEditorManager.as::AVATAR_EDITOR_READY
    // Name DERIVED: the event type AS3 raises once the renderer reports ready.
    public static readonly AVATAR_EDITOR_READY: string = 'AVATAR_EDITOR_READY';

    // AS3: .../avatar/HabboAvatarEditorManager.as::LINK_PATTERN
    private static readonly LINK_PATTERN: string = 'avatareditor/';

    // AS3: .../avatar/HabboAvatarEditorManager.as::GENERIC
    private static readonly GENERIC: string = 'generic';

    // AS3: .../avatar/HabboAvatarEditorManager.as::_avatarRenderManager
    private _avatarRenderManager: IAvatarRenderManager | null = null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::_inventory
    private _inventory: IHabboInventory | null = null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::_sessionData
    private _sessionData: ISessionDataManager | null = null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::_handler
    // Name DERIVED (`_SafeStr_4574`).
    private _handler: IAvatarEditorMessageHandler | null = null;

    // AS3: .../avatar/HabboAvatarEditorManager.as::_editors
    private _editors: OrderedMap<number, HabboAvatarEditor> | null =
        new OrderedMap<number, HabboAvatarEditor>();

    // AS3: .../avatar/HabboAvatarEditorManager.as::HabboAvatarEditorManager()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::get avatarRenderManager()
    public get avatarRenderManager(): IAvatarRenderManager | null
    {
        return this._avatarRenderManager;
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::get sessionData()
    public get sessionData(): ISessionDataManager | null
    {
        return this._sessionData;
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::get handler()
    public get handler(): IAvatarEditorMessageHandler | null
    {
        return this._handler;
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::get communication()
    // Flattened to the connection — see `IHabboAvatarEditorHost`.
    public get connection(): IConnection | null
    {
        return this._communication?.connection ?? null;
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::get inventory()
    public get inventory(): IFigureSetOwnership | null
    {
        // TODO(AS3): `IHabboInventory` has no `hasFigureSetIdInInventory()` yet — see
        // `IFigureSetOwnership`. Returning null until it does, which reports every sellable item
        // as unowned and therefore hides it.
        return null;
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::get inventory()
    // The effect half of the same manager; separate because the two surfaces are unrelated.
    public get effectInventory(): {
        setEffectSelected(effectType: number): void;
        deselectAllEffects(force: boolean): void;
    } | null
    {
        return this._inventory;
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::get linkPattern()
    public get linkPattern(): string
    {
        return HabboAvatarEditorManager.LINK_PATTERN;
    }

    /**
     * AS3: .../avatar/HabboAvatarEditorManager.as::openEditor()
     *
     * **Reuses** an editor already at that id rather than replacing it — the opposite of
     * `embedEditorToContext()`.
     */
    public openEditor(
        editorId: number,
        saveListener: IAvatarEditorSaveListener | null,
        categories: string[] | null = null,
        sideContentEnabled: boolean = false,
        title: string | null = null,
        defaultCategory: string = HabboAvatarEditorManager.GENERIC
    ): IWindowContainer | null
    {
        let editor = this._editors?.getValue(editorId) ?? null;

        if(editor === null)
        {
            editor = new HabboAvatarEditor(editorId, this);
            this._editors?.add(editorId, editor);
        }

        return editor.openWindow(saveListener, categories, sideContentEnabled, title, defaultCategory);
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::embedEditorToContext()
    // Always **replaces**: an existing editor at that id is disposed first.
    public embedEditorToContext(
        editorId: number,
        context: IWindowContainer | null,
        saveListener: IAvatarEditorSaveListener | null = null,
        categories: string[] | null = null,
        sideContentEnabled: boolean = false,
        isDevelopmentEditor: boolean = false
    ): boolean
    {
        this._editors?.getValue(editorId)?.dispose();

        const editor = new HabboAvatarEditor(editorId, this, isDevelopmentEditor);

        // AS3 calls `add()` here, which **refuses** a key already present — and the disposed editor
        // was never removed from the map, so the replacement is never stored and every later
        // `getEditor()` returns the disposed one. Kept: `setValue()` would silently change which
        // editor the message handler talks to.
        this._editors?.add(editorId, editor);
        editor.embedToContext(context, saveListener, categories, sideContentEnabled);

        return true;
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::loadAvatarInEditor()
    public loadAvatarInEditor(editorId: number, figure: string, gender: string, clubLevel: number = 0): void
    {
        this._editors?.getValue(editorId)?.loadAvatarInEditor(figure, gender, clubLevel);
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::loadOwnAvatarInEditor()
    // An NFT outfit cannot be edited, so the *fallback* figure is loaded instead.
    public loadOwnAvatarInEditor(editorId: number): void
    {
        const editor = this._editors?.getValue(editorId) ?? null;

        if(editor === null) return;

        if(editor.hasNftOutfit())
        {
            editor.loadFallbackFigure();

            return;
        }

        editor.loadAvatarInEditor(
            this._sessionData?.figure ?? '',
            this._sessionData?.gender ?? 'M',
            this._sessionData?.clubLevel ?? 0
        );
    }

    /**
     * AS3: .../avatar/HabboAvatarEditorManager.as::close()
     *
     * What "close" means depends on the id, and the switch is written with its `case 2` **after**
     * the default — so id 2 falls through to nothing and the bot editor is never disposed. Kept.
     *
     *  - 0 hides the window and keeps the editor;
     *  - 1 hides, disposes and forgets it;
     *  - 2 does nothing at all;
     *  - anything else disposes and forgets without hiding.
     *
     * Before any of that, a non-development editor has the user's last activated effect written
     * back into its figure.
     */
    public close(editorId: number): void
    {
        if(this._editors === null) return;

        const editor = this._editors.getValue(editorId);

        if(editor === null) return;

        if(!AvatarEditorIdEnum.isDevelopmentEditor(editorId))
        {
            // TODO(AS3): `figureData.avatarEffectType = inventory.getLastActivatedEffect()` —
            // `IHabboInventory` has no `getLastActivatedEffect()` in this port, so the effect is
            // left as it is rather than reset to the last activated one.
            log.debug('Last activated effect not restored on close — getLastActivatedEffect() is not ported');
        }

        switch(editorId)
        {
            case AvatarEditorIdEnum.MAIN_EDITOR:
                editor.hide();
                break;

            case AvatarEditorIdEnum.FURNITURE_EDITOR:
                editor.hide();
                editor.dispose();
                this._editors.remove(editorId);
                break;

            case AvatarEditorIdEnum.BOT_EDITOR:
                break;

            default:
                editor.dispose();
                this._editors.remove(editorId);
                break;
        }
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::getEditor()
    public getEditor(editorId: number): HabboAvatarEditor | null
    {
        return this._editors?.getValue(editorId) ?? null;
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::linkReceived()
    // `avatareditor/open` opens the main editor on the user's own figure — the route the
    // navigator and the web pages use.
    public linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] !== 'open') return;

        this.openEditor(AvatarEditorIdEnum.MAIN_EDITOR, null, null, true);
        this.loadOwnAvatarInEditor(AvatarEditorIdEnum.MAIN_EDITOR);
    }

    // AS3: .../src/com/sulake/habbo/catalog/IHabboCatalog.as::verifyClubLevel()
    public verifyClubLevel(): boolean
    {
        return this._catalog?.verifyClubLevel() ?? false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/IHabboCatalog.as::openClubCenter()
    public openClubCenter(): void
    {
        this._catalog?.openClubCenter();
    }

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::getMandatoryAvatarPartSetIds()
    public getMandatoryAvatarPartSetIds(gender: string, clubLevel: number): string[]
    {
        return this._avatarRenderManager?.getMandatoryAvatarPartSetIds(gender, clubLevel) ?? [];
    }

    // TS-only: AS3 reads `windowManager.assets.getAssetByName(name).content` inline — see
    // `IHabboAvatarEditorHost`.
    public getAssetBitmap(name: string): ImageBitmap | null
    {
        return (this.assets?.getAssetByName(name)?.content ?? null) as ImageBitmap | null;
    }

    /**
     * TS-only: stands in for AS3's inline
     * `new AvatarEditorGridPartItem(AvatarEditorView.THUMB_WINDOW.clone(), ...)`.
     *
     * TODO(AS3): the **window argument is null** until `AvatarEditorView` lands — AS3 clones a
     * static template held on that class. The item itself is the real one: it computes its
     * colour-layer count from the part's own sprites and holds the part set and flags. With a null
     * window `updateThumbVisualization()` returns early, so nothing is drawn and the sprite
     * compositing never runs.
     */
    public createGridPartItem(
        model: ICategoryModel,
        partSet: IFigurePartSet | null,
        colours: unknown[] | null,
        colourable: boolean,
        disabled: boolean
    ): {iconImage: ImageBitmap | null} | null
    {
        return new AvatarEditorGridPartItem(
            null, model, partSet, (colours ?? []) as (IPartColor | null)[], colourable, disabled
        );
    }

    /**
     * TS-only: the colour equivalent, standing in for
     * `new AvatarEditorGridColorItem(AvatarEditorView.COLOUR_WINDOW.clone(), ...)`.
     *
     * TODO(AS3): same null window as above.
     */
    public createGridColorItem(model: ICategoryModel, colour: unknown, disabled: boolean): unknown
    {
        return new AvatarEditorGridColorItem(null, model, colour as IPartColor | null, disabled);
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::dispose()
    public override dispose(): void
    {
        if(this._editors !== null)
        {
            for(const editor of this._editors.getValues()) editor?.dispose();

            this._editors = null;
        }

        this._handler?.dispose();
        this._handler = null;

        this.context?.removeLinkEventTracker(this);

        super.dispose();
    }

    /**
     * AS3: .../avatar/HabboAvatarEditorManager.as::get dependencies()
     *
     * All five are **optional** here where AS3 makes several required. A required dependency that
     * never resolves locks the component forever with no log — the hole that once kept the friend
     * bar from ever building — and this manager must come up whether or not the catalogue,
     * inventory or session are present. AS3 itself already gates three of them on constructor
     * flags, so "required" was never unconditional there either.
     */
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_AvatarRenderManager,
                (manager: IAvatarRenderManager | null) => { this._avatarRenderManager = manager; },
                false,
                // AS3 raises AVATAR_EDITOR_READY from this listener, so anything waiting on the
                // editor learns the renderer is up.
                [{type: 'AVATAR_RENDER_READY', callback: () => this.onAvatarRendererReady()}]
            ),
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communication = manager; },
                false
            ),
            new ComponentDependency(
                IID_HabboInventory,
                (inventory: IHabboInventory | null) => { this._inventory = inventory; },
                false
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: IHabboCatalog | null) => { this._catalog = catalog; },
                false
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (session: ISessionDataManager | null) => { this._sessionData = session; },
                false
            )
        ];
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::initComponent()
    protected override initComponent(): void
    {
        this.context?.addLinkEventTracker(this);

        if(this.connection !== null)
        {
            this._handler = new AvatarEditorMessageHandler(this, this.connection);
        }

        log.debug('HabboAvatarEditorManager initialized');
    }

    // AS3: .../avatar/HabboAvatarEditorManager.as::onAvatarRendererReady()
    private onAvatarRendererReady(): void
    {
        this.events.emit(HabboAvatarEditorManager.AVATAR_EDITOR_READY, {
            type: HabboAvatarEditorManager.AVATAR_EDITOR_READY
        });
    }
}
