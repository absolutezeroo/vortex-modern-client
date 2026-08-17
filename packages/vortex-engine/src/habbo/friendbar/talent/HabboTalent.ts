/**
 * HabboTalent — the talent-track component: the track window, the level-up window, the toolbar
 * promo, and (when the hotel runs citizenship) the welcome popup.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/talent/HabboTalent.as
 *
 * `initComponent()` returns immediately when `talent.track.enabled` is off, which leaves all four
 * controllers null and the link tracker unregistered — the whole feature is a hotel switch.
 *
 * Everything below the component is a plain controller reaching back through these accessors, so
 * this class is mostly the surface those four need: the managers, the two feature switches, and the
 * two window builders.
 */
import {ComponentDependency, type IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IWindow} from '@core/window/IWindow';
import {Logger} from '@core/utils/Logger';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboAvatarEditor} from '@iid/IIDHabboAvatarEditor';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboHelp} from '@habbo/help/IHabboHelp';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboAvatarEditor} from '@habbo/avatar/IHabboAvatarEditor';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import {GetTalentTrackMessageComposer} from '@habbo/communication/messages/outgoing/talent/GetTalentTrackMessageComposer';
import type {TalentTrackRewardPerk} from '@habbo/communication/messages/parser/talent/TalentTrackRewardPerk';
import type {
    TalentTrackRewardProduct
} from '@habbo/communication/messages/parser/talent/TalentTrackRewardProduct';
import type {TalentTrackLevel} from '@habbo/communication/messages/parser/talent/TalentTrackLevel';
import {TalentEnum} from '@habbo/session/enum/TalentEnum';

import {AbstractView} from '../view/AbstractView';
import type {IHabboTalent} from '../IHabboTalent';
import {TalentTrackController} from './TalentTrackController';
import {TalentLevelUpController} from './TalentLevelUpController';
import {TalentPromoCtrl} from './TalentPromoCtrl';
import {CitizenshipPopupController} from './CitizenshipPopupController';

const log = Logger.getLogger('habbo.friendbar.talent.HabboTalent');

export class HabboTalent extends AbstractView implements IHabboTalent, ILinkEventTracker
{
    // AS3: HabboTalent.as::_talentTrack
    private _talentTrack: TalentTrackController | null = null;

    // AS3: HabboTalent.as::_talentLevelUp
    private _talentLevelUp: TalentLevelUpController | null = null;

    // AS3: HabboTalent.as::_talentPromo
    private _talentPromo: TalentPromoCtrl | null = null;

    // AS3: HabboTalent.as::_citizenshipPopup
    private _citizenshipPopup: CitizenshipPopupController | null = null;

    // AS3: HabboTalent.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: HabboTalent.as::_habboHelp
    private _habboHelp: IHabboHelp | null = null;

    // AS3: HabboTalent.as::_navigator
    private _navigator: IHabboNavigator | null = null;

    // AS3: HabboTalent.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;

    // AS3: HabboTalent.as::_avatarEditor
    private _avatarEditor: IHabboAvatarEditor | null = null;

    // AS3: HabboTalent.as::HabboTalent()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    // AS3: HabboTalent.as::get communicationManager()
    public get communicationManager(): IHabboCommunicationManager | null
    {
        return this._communicationManager;
    }

    // AS3: HabboTalent.as::get localizationManager()
    public get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: HabboTalent.as::get sessionManager()
    public get sessionManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: HabboTalent.as::get tracking()
    public get tracking(): IHabboTracking | null
    {
        return this._tracking;
    }

    // AS3: HabboTalent.as::get windowManager()
    public get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: HabboTalent.as::get habboHelp()
    public get habboHelp(): IHabboHelp | null
    {
        return this._habboHelp;
    }

    // AS3: HabboTalent.as::get navigator()
    public get navigator(): IHabboNavigator | null
    {
        return this._navigator;
    }

    // AS3: HabboTalent.as::get habboTalentEnabled()
    public get habboTalentEnabled(): boolean
    {
        return this.getBoolean('talent.track.enabled');
    }

    // AS3: HabboTalent.as::get citizenshipEnabled()
    public get citizenshipEnabled(): boolean
    {
        return this.getBoolean('talent.track.citizenship.enabled');
    }

    // AS3: HabboTalent.as::get newUserTourEnabled()
    public get newUserTourEnabled(): boolean
    {
        return this.getBoolean('guide.help.new.user.tour.enabled');
    }

    // AS3: HabboTalent.as::get newIdentity()
    public get newIdentity(): boolean
    {
        return this.getInteger('new.identity', 0) > 0;
    }

    // AS3: HabboTalent.as::get toolbar()
    public get toolbar(): IHabboToolbar | null
    {
        return this._toolbar;
    }

    // AS3: HabboTalent.as::get avatarEditor()
    public get avatarEditor(): IHabboAvatarEditor | null
    {
        return this._avatarEditor;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return super.dependencies.concat([
            new ComponentDependency(IID_HabboCommunicationManager, (manager: IHabboCommunicationManager | null) =>
            {
                this._communicationManager = manager;
            }),
            new ComponentDependency(IID_HabboHelp, (help: IHabboHelp | null) =>
            {
                this._habboHelp = help;
            }),
            new ComponentDependency(IID_HabboNavigator, (navigator: IHabboNavigator | null) =>
            {
                this._navigator = navigator;
            }),
            new ComponentDependency(IID_HabboToolbar, (toolbar: IHabboToolbar | null) =>
            {
                this._toolbar = toolbar;
            }),
            new ComponentDependency(IID_HabboAvatarEditor, (editor: IHabboAvatarEditor | null) =>
            {
                this._avatarEditor = editor;
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
        ] as Array<ComponentDependency<any>>);
    }

    // AS3: HabboTalent.as::initComponent()
    protected override initComponent(): void
    {
        if(!this.habboTalentEnabled)
        {
            log.debug('talent.track.enabled is off - the talent track is not built.');

            return;
        }

        this._talentTrack = new TalentTrackController(this);
        this._talentLevelUp = new TalentLevelUpController(this);
        this._talentPromo = new TalentPromoCtrl(this);

        if(this.citizenshipEnabled)
        {
            this._citizenshipPopup = new CitizenshipPopupController(this);
        }

        this.context.addLinkEventTracker(this);

        this._talentTrack.initialize();
        this._talentLevelUp.initialize();
        this._talentPromo.initialize();
    }

    // AS3: HabboTalent.as::send()
    public send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    /**
     * AS3 reads `assets.getAssetByName(name + "_xml")` and builds from the XML; this port keeps the
     * layouts in the window manager's registry, the substitution `AvatarEditorView` documents.
     */
    // AS3: HabboTalent.as::getXmlWindow()
    public getXmlWindow(name: string, layer: number = 1): IWindow | null
    {
        const window = this._windowManager?.buildWidgetLayout(`${name}_xml`, layer) ?? null;

        if(window === null)
        {
            log.warn(`Failed to build window ${name}_xml`);
        }

        return window;
    }

    // AS3: HabboTalent.as::getModalXmlWindow()
    public getModalXmlWindow(name: string): IModalDialog | null
    {
        const modal = this._windowManager?.buildModalWidgetLayout(`${name}_xml`) ?? null;

        if(modal === null)
        {
            log.warn(`Failed to build modal window ${name}_xml`);
        }

        return modal;
    }

    /** A debug entry point in AS3 too — nothing in the client calls it. */
    // AS3: HabboTalent.as::testLevelUp()
    public testLevelUp(talentTrackName: string, level: TalentTrackLevel): void
    {
        this._talentLevelUp?.showWindow(
            talentTrackName, level.level, level.rewardPerks, level.rewardProducts
        );
    }

    // AS3: HabboTalent.as::get linkPattern()
    public get linkPattern(): string
    {
        return 'talent/';
    }

    // AS3: HabboTalent.as::linkReceived()
    public linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] !== 'open')
        {
            log.warn(`Talent unknown link-type receive: ${parts[1]}`);

            return;
        }

        if(parts.length <= 2) return;

        switch(parts[2])
        {
            case TalentEnum.CITIZENSHIP:
                this._tracking?.trackTalentTrackOpen(TalentEnum.CITIZENSHIP, 'citizenshiplink');
                this.send(new GetTalentTrackMessageComposer(TalentEnum.CITIZENSHIP));
                break;

            case TalentEnum.HELPER:
                this._tracking?.trackTalentTrackOpen(TalentEnum.HELPER, 'helperlink');
                this.send(new GetTalentTrackMessageComposer(TalentEnum.HELPER));
                break;
        }
    }

    // TS-only: kept so `TalentLevelUpController.showWindow()` can be typed against the reward DTOs
    // without importing them at every call site.
    public showLevelUp(
        talentTrackName: string,
        level: number,
        rewardPerks: TalentTrackRewardPerk[],
        rewardProducts: TalentTrackRewardProduct[]
    ): void
    {
        this._talentLevelUp?.showWindow(talentTrackName, level, rewardPerks, rewardProducts);
    }

    // AS3: HabboTalent.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        if(this._talentLevelUp !== null)
        {
            this._talentLevelUp.dispose();
            this._talentLevelUp = null;
        }

        if(this._talentTrack !== null)
        {
            this._talentTrack.dispose();
            this._talentTrack = null;
        }

        if(this._talentPromo !== null)
        {
            this._talentPromo.dispose();
            this._talentPromo = null;
        }

        if(this._citizenshipPopup !== null)
        {
            this._citizenshipPopup.dispose();
            this._citizenshipPopup = null;
        }

        this.context.removeLinkEventTracker(this);

        super.dispose();
    }
}
