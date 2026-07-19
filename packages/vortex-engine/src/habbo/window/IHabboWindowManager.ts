import type {IDisposable} from '@core/runtime/IDisposable';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IElementDescriptionData} from './IElementDescriptor';
import type {ElementRegistry} from './ElementRegistry';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContext} from '@core/window/IWindowContext';
import type {IInputEventTracker} from '@core/window/IInputEventTracker';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IWidget} from '@core/window/IWidget';
import type {IWindowRenderer} from '@core/window/graphics/IWindowRenderer';
import type {ISkinRenderer} from '@core/window/graphics/renderer/ISkinRenderer';
import type {ISkinContainer} from '@core/window/graphics/ISkinContainer';
import type {IResourceManager} from '@core/window/IResourceManager';
import type {ISkinData} from '@core/window/graphics/renderer/BitmapSkinParser';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IModalDialog} from './utils/IModalDialog';
import type {IInternalWindowServices} from "@core/window";
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {AlertDialogCallback, IAlertDialog} from './utils/AlertDialog';
import type {IAlertDialogWithLink} from './utils/AlertDialogWithLink';
import type {IConfirmDialog} from './utils/ConfirmDialog';

/**
 * Interface for the Habbo Window Manager.
 *
 * Manages the lifecycle of declarative windows: opening from XML layouts,
 * resolving variables, tracking instances, and emitting events for the UI layer.
 *
 * Also provides the AS3-compatible ICoreWindowManager + IHabboWindowManager API
 * for creating windows programmatically, showing alerts/confirms, managing hints,
 * and accessing window contexts.
 *
 * @see sources/win63_2021_version/com/sulake/habbo/window/IHabboWindowManager.as
 * @see sources/win63_2021_version/com/sulake/habbo/window/HabboWindowManagerComponent.as
 */
export interface IHabboWindowManager extends IDisposable {
    // TS-only: element registry
    readonly elementRegistry: ElementRegistry;
    // AS3: sources/win63_version/habbo/window/class_38.as::avatarRenderer
    readonly avatarRenderer: IAvatarRenderManager | null;
    // AS3: sources/win63_version/habbo/window/class_38.as::communication
    readonly communication: IHabboCommunicationManager | null;
    // AS3: sources/win63_version/habbo/window/class_38.as::sessionDataManager
    readonly sessionDataManager: ISessionDataManager | null;
    // AS3: sources/win63_version/habbo/window/class_38.as::roomEngine
    readonly roomEngine: IRoomEngine | null;
    // AS3: sources/win63_version/habbo/window/class_38.as::resourceManager
    readonly resourceManager: IResourceManager | null;
    // AS3: sources/win63_version/habbo/window/class_38.as::localization
    readonly localization: IHabboLocalizationManager | null;
    // AS3: sources/win63_version/habbo/window/class_38.as::habboPagesStyleSheet
    readonly habboPagesStyleSheet: unknown | null;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/HabboWindowManagerComponent.as::get catalog()
    readonly catalog: IHabboCatalog | null;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/HabboWindowManagerComponent.as::get freeFlowChat()
    readonly freeFlowChat: IHabboFreeFlowChat | null;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/HabboWindowManagerComponent.as (context.configuration)
    readonly configuration: IHabboConfigurationManager | null;

    // TS-only
    loadElementDescription(data: IElementDescriptionData): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::create()
    create(
        name: string,
        type: number,
        style: number,
        param: number,
        rect: { x: number; y: number; width: number; height: number },
        procedure?: ((event: unknown, window: IWindow) => void) | null,
        dynamicStyle?: string,
        id?: number,
        tags?: string[] | null,
        parent?: IWindow | null,
        properties?: unknown[] | null
    ): IWindow;

    // AS3: sources/win63_version/habbo/window/class_38.as::buildFromXML()
    buildFromXML(layout: string | Document | Element, layer?: number, vars?: Map<string, string> | null): IWindow;

    // AS3: sources/win63_version/habbo/window/class_38.as::windowToXMLString()
    windowToXMLString(window: IWindow): string;

    // AS3: sources/win63_version/habbo/window/class_38.as::destroy()
    destroy(window: IWindow): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::notify()
    notify(title: string, message: string, callback: AlertDialogCallback | null, flags?: number): IAlertDialog;

    // AS3: sources/win63_version/habbo/window/class_38.as::alert()
    alert(title: string, message: string, flags: number, callback: AlertDialogCallback | null): IAlertDialog;

    // AS3: sources/win63_version/habbo/window/class_38.as::alertWithModal()
    alertWithModal(title: string, message: string, flags: number, callback: AlertDialogCallback | null): IAlertDialog;

    // AS3: sources/win63_version/habbo/window/class_38.as::alertWithLink()
    alertWithLink(
        title: string,
        message: string,
        linkTitle: string,
        linkUrl: string,
        flags: number,
        callback: AlertDialogCallback | null
    ): IAlertDialogWithLink;

    // AS3: sources/win63_version/habbo/window/class_38.as::confirm()
    confirm(title: string, message: string, flags: number, callback: AlertDialogCallback | null): IConfirmDialog;

    // AS3: sources/win63_version/habbo/window/class_38.as::confirmWithModal()
    confirmWithModal(title: string, message: string, flags: number, callback: AlertDialogCallback | null): IConfirmDialog;

    // TS-only
    registerWidgetLayout(name: string, xml: string): void;

    // TS-only
    buildWidgetLayout(name: string, layer?: number): IWindow | null;

    // TS-only
    hasWidgetLayout(name: string): boolean;

    // TS-only
    getRegisteredWidgetLayoutNames(): string[];

    /**
     * Look up a registered widget layout's raw XML by name, throwing if missing.
     *
     * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/HabboWindowManagerComponent.as
     * fetches these directly via `assets.getAssetByName(name).content as XML` inline at each call
     * site (alert/confirm/simpleAlert/etc) and has no equivalent named method; this centralizes
     * that lookup + the "missing asset" throw shared by all of them.
     */
    requireWidgetLayout(name: string, purpose: string): string;

    // AS3: sources/win63_version/habbo/window/class_38.as::createWindow()
    createWindow(
        name: string,
        caption?: string,
        type?: number,
        style?: number,
        param?: number,
        rect?: { x: number; y: number; width: number; height: number } | null,
        procedure?: ((event: unknown, window: IWindow) => void) | null,
        id?: number,
        layer?: number,
        dynamicStyle?: string
    ): IWindow;

    // AS3: sources/win63_version/habbo/window/class_38.as::removeWindow()
    removeWindow(name: string, layer?: number): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::getWindowByName()
    getWindowByName(name: string, layer?: number): IWindow | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::getActiveWindow()
    getActiveWindow(layer?: number): IWindow | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::toggleFullScreen()
    toggleFullScreen(): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::getWindowContext()
    getWindowContext(layer: number): IWindowContext;

    // AS3: sources/win63_version/habbo/window/class_38.as::getDesktop()
    getDesktop(layer: number): IWindow | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::registerUpdateReceiver()
    registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::removeUpdateReceiver()
    removeUpdateReceiver(receiver: IUpdateReceiver): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::findWindowByName()
    findWindowByName(name: string): IWindow | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::findWindowByTag()
    findWindowByTag(tag: string): IWindow | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::groupWindowsWithTag()
    groupWindowsWithTag(tag: string, windows: IWindow[], depth?: number): number;

    // AS3: sources/win63_version/habbo/window/class_38.as::addMouseEventTracker()
    addMouseEventTracker(tracker: IInputEventTracker): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::removeMouseEventTracker()
    removeMouseEventTracker(tracker: IInputEventTracker): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::eventReceived()
    eventReceived(event: WindowEvent, window: IWindow): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::registerLocalizationParameter()
    registerLocalizationParameter(key: string, parameter: string, value: string, delimiter?: string): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::createUnseenItemCounter()
    createUnseenItemCounter(): IWindowContainer | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::registerHintWindow()
    registerHintWindow(hintId: string, window: IWindow, direction?: number): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::unregisterHintWindow()
    unregisterHintWindow(hintId: string): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::showHint()
    showHint(hintId: string, rect?: { x: number; y: number; width: number; height: number } | null): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::hideHint()
    hideHint(): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::hideMatchingHint()
    hideMatchingHint(hintId: string): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::openHelpPage()
    openHelpPage(pageId: string): void;

    // AS3: sources/win63_version/habbo/window/class_38.as::buildModalDialogFromXML()
    buildModalDialogFromXML(layout: string): IModalDialog;

    // TS-only
    registerAsset(name: string, bitmap: ImageBitmap): void;

    // TS-only
    registerAssetUrl(name: string, url: string): void;

    // TS-only
    loadSkinAssets(skins: Map<string, ISkinData>, atlases: Map<string, ImageBitmap>): void;

    // TS-only
    getSkinContainer(): ISkinContainer;

    // TS-only
    getWindowRenderer(): IWindowRenderer | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::getRendererByTypeAndStyle()
    getRendererByTypeAndStyle(type: number, style: number): ISkinRenderer | null;

    // TS-only
    compositeToBuffer(width: number, height: number): OffscreenCanvas | null;

    // TS-only: composites only the first `layerCount` window-context layers
    // (e.g. the non-modal desktop layers below ModalDialog's layer). Used by
    // ModalDialog to snapshot the desktop before darkening it behind a dialog —
    // AS3 captured this via BitmapData.draw(stage), which has no equivalent
    // here since rendering is Canvas2D-composited per context.
    compositeLayers(layerCount: number, width: number, height: number): OffscreenCanvas | null;

    // TS-only: renders a single window (and its children) into its own
    // scratch canvas, optionally darkened. Used by ModalDialog to freeze a
    // previous dialog's appearance into the accumulated background when a
    // new dialog stacks on top of it.
    renderWindowSnapshot(window: IWindow, width: number, height: number, darken?: boolean): OffscreenCanvas | null;

    // TS-only: darkens an existing captured buffer.
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/utils/ModalDialog.as::COLOR_TRANSFORM
    darkenSnapshot(source: OffscreenCanvas | ImageBitmap, width: number, height: number): OffscreenCanvas | null;

    // TS-only
    findWindowAtPoint(x: number, y: number): IWindow | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::displayFloorPlanEditor()
    displayFloorPlanEditor(): void;

    // TS-only
    getServiceManager(): IInternalWindowServices | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/HabboWindowManagerComponent.as::createWidget()
    createWidget(type: string, window: IWidgetWindow): IWidget | null;

    // AS3: sources/win63_version/habbo/window/class_38.as::simpleAlert()
    simpleAlert(
        title: string,
        message: string,
        subtitle: string,
        linkCaption?: string | null,
        linkUrl?: string | null,
        parameters?: Map<string, string> | null,
        illustrationUrl?: string | null,
        linkClickCallback?: (() => void) | null,
        closeCallback?: (() => void) | null
    ): void;
}
