import type {HabboToolbar} from '../HabboToolbar';
import type {BottomBarLeft} from '../BottomBarLeft';
import type {MeMenuSettingsMenuView} from './MeMenuSettingsMenuView';
import {MeMenuNewIconLoader} from './MeMenuNewIconLoader';
import type {HabboToolbarEvent} from '../events/HabboToolbarEvent';
import {AbstractSubMenuController} from '../abstractsubmenu/AbstractSubMenuController';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {GetTalentTrackMessageComposer} from '@habbo/communication/messages/outgoing/talent';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

/**
 * The "me menu" popup for the new horizontal bottom bar: profile, minimail, rooms,
 * talents, settings, achievements, guide, clothes, forums, collectibles.
 *
 * Note: this build's shipped `me_menu_new_view_xml` layout has no "achievements"
 * region at all (verified against the raw AS3 dump too - not a stale-asset gap), so
 * achievements is not reachable through this menu here; see ProgMenuController
 * (the "PROGRESSION" bottom-bar icon), which is the real entry point in this build.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/MeMenuNewController.as
 */
export class MeMenuNewController extends AbstractSubMenuController
{
    public static readonly USE_GUIDE_TOOL: string = 'USE_GUIDE_TOOL';

    private _iconLoader: MeMenuNewIconLoader | null;
    private _settingsView: MeMenuSettingsMenuView | null = null;

    // AS3: MeMenuNewController.as::MeMenuNewController()
    constructor(toolbar: HabboToolbar, bottomBarLeft: BottomBarLeft)
    {
        super(toolbar, bottomBarLeft, 'me_menu_new_view_xml', 'HTIE_ICON_MEMENU');

        if(!toolbar.getBoolean('guides.enabled'))
        {
            this.setGuideToolVisibility(false);
        }

        if(!toolbar.getBoolean('classic.collectibles.hub.enabled') || !toolbar.getBoolean('collectibles.hub.enabled'))
        {
            this.setCollectiblesVisibility(false);
        }

        this.setMinimailVisibility(false);

        this._iconLoader = new MeMenuNewIconLoader(toolbar);
    }

    /**
	 * Set the unseen achievements count
	 */
    set unseenAchievementsCount(value: number)
    {
        this.setUnseenItemCount('achievements', value);
    }

    /**
	 * Set the unseen minimails count
	 */
    // AS3: MeMenuNewController.as::set unseenMinimailsCount()
    set unseenMinimailsCount(value: number)
    {
        this.setUnseenItemCount('minimail', value);
    }

    /**
	 * Set the unseen forums count
	 */
    // AS3: MeMenuNewController.as::set unseenForumsCount()
    set unseenForumsCount(value: number)
    {
        this.setUnseenItemCount('forums', value);
    }

    // AS3: MeMenuNewController.as::onSubMenuItemClick()
    protected override onSubMenuItemClick(itemName: string): void
    {
        switch(itemName)
        {
            case 'profile': {
                const userId = this.toolbar?.sessionDataManager?.userId;

                if(userId !== undefined)
                {
                    this.toolbar?.communicationManager?.connection?.send(new GetExtendedProfileMessageComposer(userId));
                }
                break;
            }
            case 'minimail':
                HabboWebTools.openMinimail('#mail/inbox/');
                break;
            case 'rooms':
                this.toolbar?.navigator?.showOwnRooms();
                break;
            case 'talents': {
                const trackName = this.toolbar?.sessionDataManager?.currentTalentTrack;

                if(trackName !== undefined)
                {
                    this.toolbar?.communicationManager?.connection?.send(new GetTalentTrackMessageComposer(trackName));
                }
                break;
            }
            case 'settings':
                // TODO(AS3): MeMenuSettingsMenuView itself is still a data-only stub
                // (no real window), so opening it here would do nothing visible yet.
                break;
            case 'achievements':
                this.toolbar?.questEngine?.showAchievements();
                break;
            case 'guide':
                this.toolbar?.toggleWindowVisibility('GUIDE');
                break;
            case 'clothes':
                this.toolbar?.context.createLinkEvent('avatareditor/open');
                break;
            case 'forums':
                this.toolbar?.context.createLinkEvent('groupforum/list/my');
                break;
            case 'collectibles':
                this.toolbar?.context.createLinkEvent('collectibles/open');
                break;
        }
    }

    // AS3: MeMenuNewController.as::onToolbarClick()
    protected override onToolbarClick(event: HabboToolbarEvent): void
    {
        super.onToolbarClick(event);

        if(event.iconId !== 'HTIE_ICON_MEMENU' && this._settingsView)
        {
            this._settingsView.dispose();
            this._settingsView = null;
        }
    }

    // AS3: MeMenuNewController.as::setGuideToolVisibility()
    private setGuideToolVisibility(visible: boolean): void
    {
        const guide = this.window?.findChildByName('guide');
        const profile = this.window?.findChildByName('profile');

        if(guide) guide.visible = visible;

        if(this.window && guide && profile)
        {
            this.window.height = visible ? guide.bottom + 5 : profile.bottom + 5;
        }
    }

    // AS3: MeMenuNewController.as::setCollectiblesVisibility()
    private setCollectiblesVisibility(visible: boolean): void
    {
        const collectibles = this.window?.findChildByName('collectibles');

        if(collectibles) collectibles.visible = visible;
    }

    // AS3: MeMenuNewController.as::setMinimailVisibility()
    private setMinimailVisibility(visible: boolean): void
    {
        const minimail = this.window?.findChildByName('minimail');

        if(minimail) minimail.visible = visible;
    }

    // AS3: MeMenuNewController.as::toggleVisibility()
    override toggleVisibility(): void
    {
        super.toggleVisibility();

        if(this._settingsView)
        {
            this._settingsView.dispose();
            this._settingsView = null;
        }

        if(this.window?.visible)
        {
            const talents = this.window.findChildByName('talents');

            if(talents && !this.toolbar?.getBoolean('talent.track.enabled'))
            {
                talents.visible = false;
            }

            if(this.toolbar?.getBoolean('guides.enabled') && this.toolbar.sessionDataManager)
            {
                const hasPerk = this.toolbar.sessionDataManager.isPerkAllowed(MeMenuNewController.USE_GUIDE_TOOL);

                this.setGuideToolVisibility(hasPerk);
            }
        }
    }

    // AS3: MeMenuNewController.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._settingsView)
        {
            this._settingsView.dispose();
            this._settingsView = null;
        }

        if(this._iconLoader)
        {
            this._iconLoader.dispose();
            this._iconLoader = null;
        }

        super.dispose();
    }
}
