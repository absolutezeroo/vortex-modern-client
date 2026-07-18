import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {HabboLandingView} from '../HabboLandingView';
import type {ISlotAwareWidget} from '../interfaces/ISlotAwareWidget';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {CommonWidgetSettings} from './CommonWidgetSettings';
import {WidgetContainer} from './WidgetContainer';
import {DynamicLayoutManager} from './DynamicLayoutManager';
import {MovingBackgroundObjects} from './MovingBackgroundObjects';
import {LandingViewWidgetType} from './LandingViewWidgetType';
import {GetCurrentTimingCodeMessageComposer} from '@habbo/communication/messages/outgoing/competition/GetCurrentTimingCodeMessageComposer';
import {CurrentTimingCodeMessageEvent} from '@habbo/communication/messages/incoming/competition/CurrentTimingCodeMessageEvent';
import type {CurrentTimingCodeMessageEventParser} from '@habbo/communication/messages/parser/competition/CurrentTimingCodeMessageEventParser';

const log = Logger.getLogger('WidgetContainerLayout');

const DEFAULT_LAYOUT: string = 'landing_view_default_dynamic_layout';
const GENERIC_RECEPTION_LAYOUT: string = 'landing_view_generic_reception';
const WIDGET_PLACEHOLDER_PREFIX: string = 'widget_placeholder_';

const BACKGROUND_ELEMENT_NAMES: string[] = [
    'background_back', 'background_front', 'background_gradient_top', 'background_hotel_top',
    'background_gradient', 'background_right', 'background_horizon', 'background_left', 'background_left_bottom'
];

const FIXED_WIDGET_TYPES: string[] = [
    'avatarimage', 'expiringcatalogpage', 'expiringcatalogpagesmall', 'communitygoal', 'catalogpromo',
    'achievementcompetition_hall_of_fame', 'achievementcompetition_prizes', 'dailyquest', 'nextlimitedrarecountdown',
    'habbomoderationpromo', 'habbotalentspromo', 'habbowaypromo', 'safetyquizpromo', 'generic', 'widgetcontainer'
];

const DYNAMIC_SLOT_COUNT = 6;

/**
 * WidgetContainerLayout
 *
 * Manages the main landing view window: builds it from a layout, registers
 * the ~15 fixed placeholder-anchored widgets plus the 6 dynamic-grid widgets,
 * drives background parallax + campaign background-image timing codes, and
 * handles resize/activate/disable.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as
 */
export class WidgetContainerLayout implements IUpdateReceiver
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::getColorizableElements()
    private static getColorizableElements(container: IWindowContainer | null): ITextWindow[]
    {
        if(!container) return [];

        const result: IWindow[] = [];

        container.groupChildrenWithTag('COLORABLE', result, -1);

        return result as ITextWindow[];
    }

    /**
	 * Applies a `CommonWidgetSettings` campaign override (text/etching color,
	 * etching position) to every `COLORABLE`-tagged text element under a
	 * widget's container. Called by widgets implementing `ISettingsAwareWidget`
	 * from their `set settings()`.
	 *
	 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::applyCommonWidgetSettings()
	 */
    public static applyCommonWidgetSettings(container: IWindowContainer | null, settings: CommonWidgetSettings): void
    {
        if(!container) return;

        if(settings.isTextColorSet || settings.isEtchingColorSet || settings.isEtchingPositionSet)
        {
            for(const element of WidgetContainerLayout.getColorizableElements(container))
            {
                if(settings.isTextColorSet) element.textColor = settings.textColor;
                if(settings.isEtchingColorSet) element.etchingColor = settings.etchingColor;
                if(settings.isEtchingPositionSet) element.etchingPosition = settings.etchingPosition;
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::applyColorizableWidgetTextColor()
    public static applyColorizableWidgetTextColor(container: IWindowContainer | null, textColor: number): void
    {
        if(!container) return;

        for(const element of WidgetContainerLayout.getColorizableElements(container))
        {
            element.textColor = textColor;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::applyColorizableWidgetEtchingColor()
    public static applyColorizableWidgetEtchingColor(container: IWindowContainer | null, etchingColor: number): void
    {
        if(!container) return;

        for(const element of WidgetContainerLayout.getColorizableElements(container))
        {
            element.etchingColor = etchingColor;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::applyColorizableWidgetEtchingPosition()
    public static applyColorizableWidgetEtchingPosition(container: IWindowContainer | null, etchingPosition: string): void
    {
        if(!container) return;

        for(const element of WidgetContainerLayout.getColorizableElements(container))
        {
            element.etchingPosition = etchingPosition;
        }
    }

    protected _landingView: HabboLandingView | null;
    protected _window: IWindowContainer | null = null;
    protected _dynamicWidgetLayout: DynamicLayoutManager | null = null;
    protected _movingBackgroundObjects: MovingBackgroundObjects | null = null;
    protected _orgWindowWidth: number = 0;
    protected _orgWindowHeight: number = 0;
    private _widgetContainers: WidgetContainer[] = [];
    private _settings: CommonWidgetSettings | null = null;
    private _schedulingStr: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::WidgetContainerLayout()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
        this.registerFixedWidgets();
        this._movingBackgroundObjects = new MovingBackgroundObjects(landingView);
        this._settings = new CommonWidgetSettings(landingView);
        landingView.registerUpdateReceiver(this, 1000);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::update()
    update(elapsedTime: number): void
    {
        if(this._window !== null && this._window.visible)
        {
            this._movingBackgroundObjects?.update(elapsedTime);
        }
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::dispose()
    dispose(): void
    {
        if(this._landingView)
        {
            this._landingView.removeUpdateReceiver(this);
        }

        this._landingView = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        for(const widgetContainer of this._widgetContainers)
        {
            widgetContainer.dispose();
        }

        this._widgetContainers = [];

        if(this._movingBackgroundObjects)
        {
            this._movingBackgroundObjects.dispose();
            this._movingBackgroundObjects = null;
        }

        if(this._dynamicWidgetLayout)
        {
            this._dynamicWidgetLayout.dispose();
            this._dynamicWidgetLayout = null;
        }

        this._settings = null;
    }

    /**
	 * Activate the landing view layout.
	 *
	 * Creates the window if it doesn't exist, resizes it to fill the desktop,
	 * and sets it visible.
	 *
	 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::activate()
	 */
    public activate(): void
    {
        if(this._window === null)
        {
            this.createWindow();
            this.registerDynamicWidgets();
            this._landingView?.communicationManager?.addHabboConnectionMessageEvent(new CurrentTimingCodeMessageEvent(this.onTimingCode));
            this._schedulingStr = this._landingView?.getProperty('landing.view.bgtiming') ?? '';
        }

        if(this._window)
        {
            for(const widgetContainer of this._widgetContainers)
            {
                widgetContainer.refresh(this._window);
            }
        }

        this.resizeWindow();

        const desktop = this._landingView?.windowManager?.getWindowContext(0).getDesktopWindow();

        desktop?.addEventListener(WindowEvent.WE_RESIZED, this.onDesktopResized);

        this._window?.invalidate();

        if(this.navigatorPosition !== null)
        {
            // TODO(AS3): IHabboNavigator.openNavigator() doesn't accept a position
            // argument yet (pre-existing gap in the navigator module - see
            // packages/helium-engine/src/habbo/navigator/HabboNavigator.ts::openNavigator()).
            // AS3 opens the navigator centered at `navigatorPosition`; ported call
            // omits the position until that lands.
            this._landingView?.navigator?.openNavigator();
        }

        this._landingView?.send(new GetCurrentTimingCodeMessageComposer(this._schedulingStr));

        if(this._window)
        {
            this._window.visible = true;
        }

        log.info('Landing view layout activated');
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::get navigatorPosition()
    private get navigatorPosition(): {x: number; y: number} | null
    {
        const placer = this._window?.findChildByName('navigator_placer');

        if(!placer) return null;

        const point = {x: 0, y: 0};

        placer.getGlobalPosition(point);

        return point;
    }

    /**
	 * Disable the landing view layout (hide the window).
	 *
	 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::disable()
	 */
    public disable(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
        }

        for(const widgetContainer of this._widgetContainers)
        {
            widgetContainer.disable();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::createWindow()
    protected createWindow(): void
    {
        if(this._window !== null) return;

        const layoutName = this.getLayout();
        const built = this._landingView!.getXmlWindow(layoutName, 0);

        this._window = built as IWindowContainer | null;

        if(!this._window)
        {
            log.error(`Failed to build landing view window from layout: ${layoutName}`);
            return;
        }

        this.hideWarningIfPresent();

        if(this._landingView!.getBoolean('landing.view.right_pane_dimmer.hidden'))
        {
            const dimmer = this._window.findChildByName('right_pane_dimmer');

            if(dimmer) dimmer.visible = false;
        }

        this.setOrgWindowSize();
        this.setupBottomSlotWidgetName();

        log.info(`Landing view window created from layout: ${layoutName}`);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::hideWarningIfPresent()
    private hideWarningIfPresent(): void
    {
        const warning = this._window?.findChildByName('warning');

        if(warning) warning.visible = false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::setOrgWindowSize()
    protected setOrgWindowSize(): void
    {
        if(!this._window) return;

        this._orgWindowWidth = this._window.width;
        this._orgWindowHeight = this._window.height;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::setupBottomSlotWidgetName()
    protected setupBottomSlotWidgetName(): void
    {
        const placeholder = this._window?.findChildByName('widget_placeholder_bottom_slot');

        if(!placeholder) return;

        const widgetType = this._landingView?.getProperty('landing.view.dynamic.slot.6.widget') ?? '';

        if(widgetType === '')
        {
            placeholder.visible = false;
        }
        else
        {
            placeholder.name = 'widget_placeholder_' + widgetType;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::getLayout()
    private getLayout(): string
    {
        if(this._landingView && this._landingView.propertyExists('landing.view.layoutxml'))
        {
            return this._landingView.getProperty('landing.view.layoutxml');
        }

        return DEFAULT_LAYOUT;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::isGenericReceptionLayout()
    private isGenericReceptionLayout(): boolean
    {
        return this.getLayout() === GENERIC_RECEPTION_LAYOUT;
    }

    /**
	 * Resize the window to fill the desktop, via the dynamic grid layout
	 * engine if one is active, otherwise the custom (fixed) layout path.
	 *
	 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::resizeWindow()
	 */
    protected resizeWindow(): void
    {
        if(this._window !== null)
        {
            if(this._dynamicWidgetLayout !== null)
            {
                this.resizeDynamicLayout();
            }
            else
            {
                this.resizeCustomLayout();
            }

            this._window.invalidate();
        }

        for(const widgetContainer of this._widgetContainers)
        {
            widgetContainer.windowResized();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::resizeDynamicLayout()
    private resizeDynamicLayout(): void
    {
        if(!this._window?.desktop || !this._dynamicWidgetLayout) return;

        const rect = this._window.desktop.rectangle;

        this._window.width = rect.width;
        this._window.height = rect.height;

        const heightDelta = this._orgWindowHeight - rect.height;
        const widthDelta = this._orgWindowWidth - rect.width;

        this._dynamicWidgetLayout.resizeTo(
            this._dynamicWidgetLayout.topItemListInitialWidth - widthDelta,
            this._dynamicWidgetLayout.topItemListInitialHeight - heightDelta
        );
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::resizeCustomLayout()
    private resizeCustomLayout(): void
    {
        if(!this._window || !this._window.desktop) return;

        this._window.x = 0;
        this._window.y = 0;

        const rect = this._window.desktop.rectangle;

        this._window.x = Math.max(0, (rect.width - this._window.width) / 2);

        if(rect.height > this._window.height || this.isGenericReceptionLayout())
        {
            this._window.y = Math.max(0, (rect.height - this._window.height) / 2);
        }
        else
        {
            this._window.y = rect.height - this._window.height;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::onDesktopResized()
    protected onDesktopResized = (_event: WindowEvent): void =>
    {
        this.resizeWindow();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::setBackgroundGraphics()
    private setBackgroundGraphics(code: string | null): void
    {
        if(!this._window || !this._landingView) return;

        const prefix = code === null || code === '' ? '' : code + '.';

        for(const name of BACKGROUND_ELEMENT_NAMES)
        {
            const element = this._window.findChildByName(name) as IStaticBitmapWrapperWindow | null;

            if(!element) continue;

            if(this._landingView.getProperty(`landing.view.${prefix}${name}.visible`) === 'false')
            {
                element.visible = false;
            }
            else
            {
                element.visible = true;

                const uri = this._landingView.getProperty(`landing.view.${prefix}${name}.uri`);

                if(element.assetUri !== uri && uri !== '')
                {
                    element.assetUri = uri;
                }
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::registerFixedWidgets()
    private registerFixedWidgets(): void
    {
        for(const type of FIXED_WIDGET_TYPES)
        {
            this.registerPlaceholderAnchoredWidget(type);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::registerPlaceholderAnchoredWidget()
    private registerPlaceholderAnchoredWidget(type: string): void
    {
        if(!this._landingView) return;

        // AS3 pushes unconditionally, even though `_settings` (here `this._settings`) is still
        // null at this point - registerFixedWidgets() runs before `_settings` is assigned in the
        // constructor, in both AS3 and here. That's harmless there (WidgetContainer accepts a null
        // settings, and none of the 15 fixed widget types implement ISettingsAwareWidget), but an
        // added `!this._settings` guard here made this a silent no-op for every fixed-placeholder
        // widget - avatarimage/dailyquest/catalogpromo/etc. never got created, so their
        // `widget_placeholder_*` XML placeholders were never swapped for the real widget.
        const widget = LandingViewWidgetType.getWidgetForType(type, this._landingView);

        if(!widget) return;

        this._widgetContainers.push(new WidgetContainer(widget, WIDGET_PLACEHOLDER_PREFIX + type, this._settings));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::registerDynamicWidgets()
    private registerDynamicWidgets(): void
    {
        if(!this._window || !this._landingView || !this._settings) return;

        if(this._window.findChildByName('placeholder_dynamic_widget_slots') === null)
        {
            log.error('ERROR! Tried to initialize dynamic widget list for landing view without the dynamic element present');
            return;
        }

        this._dynamicWidgetLayout = new DynamicLayoutManager(this, this._settings);

        for(let i = 0; i < DYNAMIC_SLOT_COUNT; i++)
        {
            const widgetType = this._landingView.getProperty(`landing.view.dynamic.slot.${i + 1}.widget`);
            const widget = LandingViewWidgetType.getWidgetForType(widgetType, this._landingView);

            if(widget)
            {
                if('slot' in widget)
                {
                    (widget as ISlotAwareWidget).slot = i + 1;
                }

                this._widgetContainers.push(
                    new WidgetContainer(widget, null, this._settings, this._dynamicWidgetLayout.getDynamicSlotContainer(i))
                );
            }
        }

        if(this._landingView.getBoolean('landing.view.dynamic.slot.5.ignore'))
        {
            this._dynamicWidgetLayout.ignoreBottomRightSlot = true;
        }

        if(this._landingView.getBoolean('landing.view.dynamic.slot.4.separator'))
        {
            this._dynamicWidgetLayout.enableSeparator(4, this._landingView.getProperty('landing.view.dynamic.slot.4.title'));
        }

        if(this._landingView.getBoolean('landing.view.dynamic.slot.5.separator'))
        {
            this._dynamicWidgetLayout.enableSeparator(5, this._landingView.getProperty('landing.view.dynamic.slot.5.title'));
        }
    }

    get window(): IWindowContainer | null
    {
        return this._window;
    }

    get landingView(): HabboLandingView | null
    {
        return this._landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainerLayout.as::onTimingCode()
    private onTimingCode = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CurrentTimingCodeMessageEventParser | null;

        if(!parser || !this._landingView) return;

        if(parser.schedulingStr === this._schedulingStr)
        {
            this.setBackgroundGraphics(parser.code);

            if(this._movingBackgroundObjects && this._window)
            {
                this._movingBackgroundObjects.timingCode = parser.code;
                this._movingBackgroundObjects.initialize(this._window);
            }
        }
    };
}
