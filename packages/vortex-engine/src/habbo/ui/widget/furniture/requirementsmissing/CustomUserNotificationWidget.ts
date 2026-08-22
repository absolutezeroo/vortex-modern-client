import type {IWindow} from '@core/window/IWindow';
import {AvatarEditorIdEnum} from '@habbo/avatar/enum/AvatarEditorIdEnum';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {CustomUserNotificationWidgetHandler} from '@habbo/ui/handler/CustomUserNotificationWidgetHandler';

/**
 * The "you cannot use this" dialog: five variants behind one widget, picked by the code the
 * server sends with the refusal.
 *
 * Three of them are VIP/costume gates that offer a way to fix the problem (buy VIP, see its
 * benefits, buy costumes); the other two explain a respect vote that failed for want of a stage
 * or an audience.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/requirementsmissing/CustomUserNotificationWidget.as
 */
export class CustomUserNotificationWidget extends RoomWidgetBase
{
    // AS3: .../requirementsmissing/CustomUserNotificationWidget.as::TYPE_VIPHOPPER
    public static readonly TYPE_VIPHOPPER: string = 'viphopper';

    /**
     * AS3: .../requirementsmissing/CustomUserNotificationWidget.as::_SafeStr_10535
     *
     * **Derived name.** Obfuscated in the primary tree and absent from the other two; the value is
     * `"vipgate"` and the sibling constants are all `TYPE_*`, so this follows them.
     */
    public static readonly TYPE_VIPGATE: string = 'vipgate';

    // AS3: .../requirementsmissing/CustomUserNotificationWidget.as::TYPE_COSTUMEHOPPER
    public static readonly TYPE_COSTUMEHOPPER: string = 'costumehopper';

    // AS3: .../requirementsmissing/CustomUserNotificationWidget.as::TYPE_RESPECT_VOTE_FAILED_NO_STAGE
    public static readonly TYPE_RESPECT_VOTE_FAILED_NO_STAGE: string = 'respectfailedstage';

    /**
     * AS3: .../requirementsmissing/CustomUserNotificationWidget.as::_SafeStr_10861
     *
     * **Derived name**, for the same reason as {@link TYPE_VIPGATE}; the value is
     * `"respectfailedaudience"` and it pairs with the `NO_STAGE` constant above.
     */
    public static readonly TYPE_RESPECT_VOTE_FAILED_NO_AUDIENCE: string = 'respectfailedaudience';

    // AS3: .../requirementsmissing/CustomUserNotificationWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../requirementsmissing/CustomUserNotificationWidget.as::_SafeStr_5229
    private _notificationHandler: CustomUserNotificationWidgetHandler;

    // AS3: .../requirementsmissing/CustomUserNotificationWidget.as::CustomUserNotificationWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null
    )
    {
        super(handler, windowManager, assets);

        this.eventProc = this.eventProc.bind(this);

        this._notificationHandler = handler as CustomUserNotificationWidgetHandler;
        this._notificationHandler.widget = this;
    }

    /**
     * AS3: .../requirementsmissing/CustomUserNotificationWidget.as::open()
     *
     * Does nothing while a window is already up — the second refusal is swallowed, which is what
     * AS3 does.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/requirementsmissing/CustomUserNotificationWidget.as::open()
    public open(type: string = ''): void
    {
        if(this._window) return;

        // `buildWindow()` assigns `this._window` as AS3 does and hands the window back, so the
        // centring below reads the returned value rather than the field the guard above has
        // already narrowed away.
        let built: IWindowContainer | null = null;

        switch(type)
        {
            case CustomUserNotificationWidget.TYPE_VIPHOPPER:
                built = this.buildWindow('viprequired_xml');
                this.setVipRequiredSpecificLocalization('viphopper');
                break;
            case CustomUserNotificationWidget.TYPE_VIPGATE:
                built = this.buildWindow('viprequired_xml');
                // The localization prefix is "gate", not the "vipgate" the type is called.
                this.setVipRequiredSpecificLocalization('gate');
                break;
            case CustomUserNotificationWidget.TYPE_COSTUMEHOPPER:
                built = this.buildWindow('costumehopper_costumerequired_xml');
                break;
            case CustomUserNotificationWidget.TYPE_RESPECT_VOTE_FAILED_NO_STAGE:
                built = this.buildWindow('respect_giving_failed_notification_xml');
                this.setText('stage');
                this.setBitmapUrl('stage');
                break;
            case CustomUserNotificationWidget.TYPE_RESPECT_VOTE_FAILED_NO_AUDIENCE:
                built = this.buildWindow('respect_giving_failed_notification_xml');
                this.setText('audience');
                this.setBitmapUrl('audience');
        }

        if(!built) return;

        built.center();
        built.procedure = this.eventProc;
    }

    // AS3: .../requirementsmissing/CustomUserNotificationWidget.as::close()
    public close(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /**
     * AS3: .../requirementsmissing/CustomUserNotificationWidget.as::buildWindow()
     *
     * AS3 returns void and only assigns `_window`; the return value is a TS addition so `open()`
     * can act on the window without fighting the narrowing its own guard introduced.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/requirementsmissing/CustomUserNotificationWidget.as::buildWindow()
    private buildWindow(layoutName: string): IWindowContainer | null
    {
        this._window = this.windowManager.buildWidgetLayout(layoutName) as IWindowContainer | null;

        return this._window;
    }

    // AS3: .../requirementsmissing/CustomUserNotificationWidget.as::setVipRequiredSpecificLocalization()
    private setVipRequiredSpecificLocalization(prefix: string): void
    {
        const title = this._window?.findChildByName('title');
        const body = this._window?.findChildByName('bodytext');

        if(title) title.caption = '${' + prefix + '.viprequired.title}';
        if(body) body.caption = '${' + prefix + '.viprequired.bodytext}';
    }

    /**
     * AS3: .../requirementsmissing/CustomUserNotificationWidget.as::setText()
     *
     * `%users%` is only substituted when the config carries a minimum — AS3 leaves the token in
     * the sentence otherwise.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/requirementsmissing/CustomUserNotificationWidget.as::setText()
    private setText(variant: string): void
    {
        const key = 'respect.giving.failed.no.' + variant;
        const container = this._notificationHandler.container;

        let text = container?.localization?.getLocalization(key) ?? key;

        const minimumAudience = container?.config?.getProperty('respect.talent.show.min.audience');

        if(minimumAudience)
        {
            text = text.replace('%users%', minimumAudience);
        }

        const body = this._window?.findChildByName('body_txt');

        if(body)
        {
            body.caption = text;
        }
    }

    /**
     * AS3: .../requirementsmissing/CustomUserNotificationWidget.as::setBitmapUrl()
     *
     * The bitmap hangs off the frame's content area, not off the frame — AS3 reaches it through
     * `_window.content.getChildByName()`.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/requirementsmissing/CustomUserNotificationWidget.as::setBitmapUrl()
    private setBitmapUrl(variant: string): void
    {
        const uri = '${image.library.url}notifications/habbo_talent_show_' + variant + '.png';
        const content = (this._window as unknown as {content?: IWindowContainer} | null)?.content;
        const bitmap = content?.getChildByName('respectFailedNotificationBitmap') as unknown as IStaticBitmapWrapperWindow | null;

        if(bitmap)
        {
            bitmap.assetUri = uri;
        }
    }

    /**
     * AS3: .../requirementsmissing/CustomUserNotificationWidget.as::eventProc()
     *
     * Note the trailing tag check: any clicked child tagged `close` closes the dialog, on top of
     * the name switch above it — so `close` runs twice for a child that is both named and tagged
     * `close`. `close()` is idempotent, and this is AS3's own shape.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/requirementsmissing/CustomUserNotificationWidget.as::eventProc()
    private eventProc(event: WindowEvent, window: IWindow): void
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const container = this._notificationHandler.container;

        switch(window.name)
        {
            case 'buy_vip':
                if(this._notificationHandler != null && container != null)
                {
                    container.catalog?.openClubCenter();
                }
                this.close();
                break;
            case 'vip_benefits':
                container?.catalog?.showVipBenefits();
                break;
            case 'buy_costumes':
            {
                const effects = container?.inventory?.getAvatarEffects() ?? [];
                let ownsCostume = false;

                for(const effect of effects)
                {
                    if(effect.subType === 1)
                    {
                        ownsCostume = true;
                        break;
                    }
                }

                // Owning the costume already: the answer is the wardrobe, not the shop. The
                // editor opens straight on its effects tab, which is what the missing costume
                // would have been worn from.
                if(ownsCostume)
                {
                    const editor = container?.avatarEditor ?? null;

                    if(editor !== null)
                    {
                        editor.openEditor(AvatarEditorIdEnum.MAIN_EDITOR, null, null, true, null, 'effects');
                        editor.loadOwnAvatarInEditor(AvatarEditorIdEnum.MAIN_EDITOR);
                    }
                }
                else
                {
                    container?.catalog?.openCatalogPage('costumes');
                }

                this.close();
                break;
            }
            case 'close':
                this.close();
        }

        if(window.tags.indexOf('close') !== -1)
        {
            this.close();
        }
    }

    // AS3: RoomWidgetBase.as::dispose() — AS3 declares no override here; the window would leak.
    public override dispose(): void
    {
        if(this.disposed) return;

        this.close();

        super.dispose();
    }
}
