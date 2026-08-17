/**
 * TalentPromoCtrl — the small "carry on with your talent track" panel that docks into the toolbar.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/talent/TalentPromoCtrl.as
 *
 * Which track it promotes is a hotel setting (`talentpromo.track`); an empty value disables the
 * whole controller, which is what `enabled` means everywhere below. It asks for the promoted
 * track's level on every user-object arrival, and detaches itself the moment that level reaches the
 * track's maximum.
 */
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {TalentLevelUpMessageEvent} from '@habbo/communication/messages/incoming/talent/TalentLevelUpMessageEvent';
import {TalentTrackLevelMessageEvent} from '@habbo/communication/messages/incoming/talent/TalentTrackLevelMessageEvent';
import {
    GetTalentTrackLevelMessageComposer
} from '@habbo/communication/messages/outgoing/talent/GetTalentTrackLevelMessageComposer';
import {GetTalentTrackMessageComposer} from '@habbo/communication/messages/outgoing/talent/GetTalentTrackMessageComposer';
import type {HabboTalent} from './HabboTalent';

export class TalentPromoCtrl
{
    /** AS3's `uint` literal 4286084205 = 0xFF78746D — the hovered background. */
    // AS3: TalentPromoCtrl.as::BG_COLOR_LIGHT
    private static readonly BG_COLOR_LIGHT: number = 0xFF78746D;

    /** AS3's `uint` literal 4283781966 = 0xFF55534E — the resting background. */
    // AS3: TalentPromoCtrl.as::BG_COLOR_DARK
    private static readonly BG_COLOR_DARK: number = 0xFF55534E;

    /** The name the panel docks under; AS3 repeats the literal at all three call sites. */
    // AS3: TalentPromoCtrl.as::refresh()
    private static readonly EXTENSION_NAME: string = 'talent_promo';

    /** AS3's literal `7` — the toolbar slot the panel attaches to. */
    // AS3: TalentPromoCtrl.as::refresh()
    private static readonly EXTENSION_SLOT: number = 7;

    /** Derived name — `_SafeStr_4571`: the owning component. */
    // AS3: TalentPromoCtrl.as::_SafeStr_4571
    private _habboTalent: HabboTalent | null;

    // AS3: TalentPromoCtrl.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6012`: the promoted track's current level. */
    // AS3: TalentPromoCtrl.as::_SafeStr_6012
    private _level: number = 0;

    /** Derived name — `_SafeStr_8797`: the promoted track's maximum level. */
    // AS3: TalentPromoCtrl.as::_SafeStr_8797
    private _maxLevel: number = 0;

    /**
     * Derived name — `_SafeStr_9118`. AS3 records the panel's designed height in `prepareWindow()`
     * and then never reads it; kept because the assignment exists.
     */
    // AS3: TalentPromoCtrl.as::_SafeStr_9118
    private _designedHeight: number = 0;

    // AS3: TalentPromoCtrl.as::TalentPromoCtrl()
    constructor(habboTalent: HabboTalent)
    {
        this._habboTalent = habboTalent;
    }

    // AS3: TalentPromoCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._habboTalent === null;
    }

    // AS3: TalentPromoCtrl.as::initialize()
    public initialize(): void
    {
        if(!this.enabled) return;

        const communication = this._habboTalent?.communicationManager ?? null;

        if(communication === null) return;

        communication.addMessageEvent(new UserObjectMessageEvent(this.onUserObject));
        communication.addMessageEvent(new TalentLevelUpMessageEvent(this.onTalentLevelUp));
        communication.addMessageEvent(new TalentTrackLevelMessageEvent(this.onTalentTrackLevel));
    }

    // AS3: TalentPromoCtrl.as::onUserObject()
    private onUserObject = (): void =>
    {
        this._habboTalent?.send(new GetTalentTrackLevelMessageComposer(this.promotedTalentTrack));
    };

    // AS3: TalentPromoCtrl.as::onTalentTrackLevel()
    private onTalentTrackLevel = (event: IMessageEvent): void =>
    {
        const parser = (event as TalentTrackLevelMessageEvent).talentParser;

        if(parser.talentTrackName === this.promotedTalentTrack)
        {
            this._maxLevel = parser.maxLevel;
            this._level = parser.level;

            this.refresh();
        }
    };

    // AS3: TalentPromoCtrl.as::onTalentLevelUp()
    private onTalentLevelUp = (event: IMessageEvent): void =>
    {
        const parser = (event as TalentLevelUpMessageEvent).talentParser;

        if(parser.talentTrackName === this.promotedTalentTrack)
        {
            this._level = parser.level;

            this.refresh();
        }
    };

    // AS3: TalentPromoCtrl.as::refresh()
    private refresh(): void
    {
        if(!this.enabled || this.maxLevelReached)
        {
            this.close();

            return;
        }

        this.prepareWindow();

        if(this._window === null) return;

        this.setText('title');

        const window = this._window as unknown as IWindow;

        window.x = 0;
        window.y = 0;

        if(this.toolbarAttachAllowed())
        {
            this._habboTalent?.toolbar?.extensionView?.attachExtension(
                TalentPromoCtrl.EXTENSION_NAME, window, TalentPromoCtrl.EXTENSION_SLOT
            );
        }
    }

    // AS3: TalentPromoCtrl.as::setText()
    private setText(name: string): void
    {
        const text = this._window?.findChildByName(name + '_txt') ?? null;

        if(text !== null)
        {
            text.caption = `\${talentpromo.${this.promotedTalentTrack}.${name}}`;
        }
    }

    // AS3: TalentPromoCtrl.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null) return;

        this._window = (this._habboTalent?.getXmlWindow('track_promo') ?? null) as IWindowContainer | null;

        if(this._window === null) return;

        const window = this._window as unknown as IWindow;

        window.addEventListener('WME_CLICK', this.onCheckProgress);
        window.addEventListener('WME_OVER', this.onContainerMouseOver);
        window.addEventListener('WME_OUT', this.onContainerMouseOut);

        this._designedHeight = window.height;
    }

    /**
     * AS3 detaches but does not dispose — the panel is rebuilt from the same window on the next
     * `refresh()`.
     */
    // AS3: TalentPromoCtrl.as::close()
    public close(): void
    {
        if(this._window !== null && this.toolbarAttachAllowed())
        {
            this._habboTalent?.toolbar?.extensionView?.detachExtension(TalentPromoCtrl.EXTENSION_NAME);
        }
    }

    // AS3: TalentPromoCtrl.as::onCheckProgress()
    private onCheckProgress = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK' && this.enabled)
        {
            this._habboTalent?.tracking?.trackTalentTrackOpen(this.promotedTalentTrack, 'talentpromo');
            this._habboTalent?.send(new GetTalentTrackMessageComposer(this.promotedTalentTrack));
        }
    };

    // AS3: TalentPromoCtrl.as::toolbarAttachAllowed()
    private toolbarAttachAllowed(): boolean
    {
        return this._habboTalent !== null
            && this._habboTalent.toolbar !== null
            && this._habboTalent.toolbar.extensionView !== null
            && this.enabled;
    }

    // AS3: TalentPromoCtrl.as::get enabled()
    private get enabled(): boolean
    {
        return this.promotedTalentTrack !== '';
    }

    // AS3: TalentPromoCtrl.as::get promotedTalentTrack()
    private get promotedTalentTrack(): string
    {
        return this._habboTalent?.getProperty('talentpromo.track') ?? '';
    }

    // AS3: TalentPromoCtrl.as::get maxLevelReached()
    private get maxLevelReached(): boolean
    {
        return this._level >= this._maxLevel;
    }

    // AS3: TalentPromoCtrl.as::onContainerMouseOver()
    private onContainerMouseOver = (): void =>
    {
        const background = (this._window as unknown as IWindowContainer | null)?.findChildByTag('BGCOLOR') ?? null;

        if(background !== null) background.color = TalentPromoCtrl.BG_COLOR_LIGHT;
    };

    // AS3: TalentPromoCtrl.as::onContainerMouseOut()
    private onContainerMouseOut = (): void =>
    {
        const background = (this._window as unknown as IWindowContainer | null)?.findChildByTag('BGCOLOR') ?? null;

        if(background !== null) background.color = TalentPromoCtrl.BG_COLOR_DARK;
    };

    // AS3: TalentPromoCtrl.as::dispose()
    public dispose(): void
    {
        if(this.toolbarAttachAllowed())
        {
            this._habboTalent?.toolbar?.extensionView?.detachExtension(TalentPromoCtrl.EXTENSION_NAME);
        }

        this._habboTalent = null;

        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
        }
    }
}
