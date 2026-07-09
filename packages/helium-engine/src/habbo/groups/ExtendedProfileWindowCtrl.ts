/**
 * ExtendedProfileWindowCtrl
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as
 *
 * Phase 1 (basic profile) port: header (name/motto/avatar/online-friend
 * status/last-login/activity-points/friend-count/level/badge-count),
 * badges without glow or a hover-details popup, add-as-friend, block/
 * unblock (with confirm dialogs), the "search rooms by owner" and
 * change-looks/change-badges links, and close.
 *
 * Explicitly deferred as TODO(AS3), matching the Phase 1 scope decision:
 * - The groups list entirely, and the GroupDetailsCtrl sub-controller it
 *   drives (306 AS3 lines, zero TS port) — group selection/favourite/
 *   details.
 * - Relationship status (heart/smile/bobba categories) — same feature cut
 *   as InfoStandUserView.ts.
 * - Badge glow effects and the hover badge-details popup (same pattern as
 *   InfoStandUserView.ts/InfoStandFurniView.ts already skip for the same
 *   reason).
 * - The badge-count leaderboard link (needs HabboGroups' internal link
 *   builder, low value alone).
 * - The "hidden" online-status tri-state and full_profile_hidden banner —
 *   ExtendedProfileData (the parsed DTO) only exposes a plain `isOnline`
 *   boolean, not AS3's 3-way onlineStatus/isHidden, so this can't be
 *   faithfully reconstructed without a parser change (out of scope here,
 *   see .claude/rules/communication.md).
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {ExtendedProfileData} from '@habbo/communication/messages/incoming/users/ExtendedProfileData';
import {GetSelectedBadgesMessageComposer} from '@habbo/communication/messages/outgoing/users/GetSelectedBadgesMessageComposer';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('ExtendedProfileWindowCtrl');
const BADGE_SLOT_COUNT = 5;

export class ExtendedProfileWindowCtrl
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_4556
    private _profile: ExtendedProfileData | null = null;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_7764
    private _badgeUpdateExpected: boolean = false;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_7676
    // Set when onProfileChanged() silently re-requests an already-open profile,
    // so the next onProfile() doesn't steal window focus/activation.
    private _skipActivateOnNextProfile: boolean = false;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::ExtendedProfileWindowCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::dispose()
    dispose(): void
    {
        this._groupsManager = null;
        this._window?.dispose();
        this._window = null;
        this._profile = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::get linkPattern()
    get linkPattern(): string
    {
        return 'profile/';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length !== 2) return;

        if(parts[1] === 'unblock')
        {
            this._groupsManager?.windowManager?.confirm(
                '${extendedprofile.unblock_player.title}',
                '${extendedprofile.unblock_player.desc}',
                0,
                this.onConfirmUnblock
            );
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::get badgeUpdateExpected() / set badgeUpdateExpected()
    get badgeUpdateExpected(): boolean
    {
        return this._badgeUpdateExpected;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::set badgeUpdateExpected()
    set badgeUpdateExpected(value: boolean)
    {
        this._badgeUpdateExpected = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window) return;

        const groupsManager = this._groupsManager;

        if(!groupsManager) return;

        const window = groupsManager.getXmlWindow('new_extended_profile') as IWindowContainer | null;

        if(!window)
        {
            log.error('prepareWindow: getXmlWindow("new_extended_profile") returned null - layout not registered?');
            throw new Error('Failed to construct window from XML!');
        }

        log.debug(`prepareWindow: window built, parent=${window.parent ? 'attached' : 'NULL'}`);

        this._window = window;

        window.center();

        const closeButton = window.findChildByTag('close');

        if(closeButton) closeButton.procedure = this.onClose;

        const addAsFriendButton = window.findChildByName('addasfriend_button');

        if(addAsFriendButton) addAsFriendButton.procedure = this.onAddAsFriend;

        const roomsButton = window.findChildByName('rooms_button');

        if(roomsButton) roomsButton.procedure = this.onRooms;

        const changeLooks = window.findChildByName('change_looks');

        if(changeLooks) changeLooks.procedure = this.onChangeLooks;

        const changeBadges = window.findChildByName('change_badges');

        if(changeBadges) changeBadges.procedure = this.onChangeBadges;

        const blockButton = window.findChildByName('block_button');

        if(blockButton) blockButton.procedure = this.onBlock;

        const userActivityPoints = window.findChildByName('user_activity_points');

        if(userActivityPoints) userActivityPoints.visible = groupsManager.isActivityDisplayEnabled;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onProfile()
    onProfile(profile: ExtendedProfileData): void
    {
        const isSameUserAlreadyShown = this._profile?.userId === profile.userId && !!this._window?.visible;

        this._profile = profile;

        this.refresh(isSameUserAlreadyShown);

        if(!this._window)
        {
            log.error('onProfile: refresh() did not produce a window');
            return;
        }

        this._window.visible = true;

        log.debug(`onProfile: window visible=${this._window.visible}, x=${this._window.x}, y=${this._window.y}, width=${this._window.width}, height=${this._window.height}, parent=${this._window.parent ? 'attached' : 'NULL'}`);

        if(!this._skipActivateOnNextProfile) this._window.activate();

        this._skipActivateOnNextProfile = false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onProfileChanged()
    onProfileChanged(userId: number): void
    {
        if(this._profile && this._profile.userId === userId && this._window?.visible)
        {
            this._groupsManager?.send(new GetExtendedProfileMessageComposer(userId));
            this._skipActivateOnNextProfile = true;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refresh()
    private refresh(isSameUserAlreadyShown: boolean): void
    {
        this.prepareWindow();

        if(!isSameUserAlreadyShown) this.clearSelectedBadges();

        this._badgeUpdateExpected = true;

        if(this._profile) this._groupsManager?.send(new GetSelectedBadgesMessageComposer(this._profile.userId));

        this.refreshHeader();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refreshHeader()
    private refreshHeader(): void
    {
        const window = this._window;
        const profile = this._profile;
        const groupsManager = this._groupsManager;

        if(!window || !profile || !groupsManager) return;

        const isOwnProfile = profile.userId === groupsManager.avatarId;
        const isFriendOrOwn = profile.isFriend || isOwnProfile;

        const mottoText = window.findChildByName('motto_txt');

        if(mottoText) mottoText.caption = profile.motto;

        const statusTxt = window.findChildByName('status_txt');

        if(statusTxt)
        {
            statusTxt.visible = isFriendOrOwn;
            statusTxt.caption = groupsManager.localization?.getLocalization(
                profile.isFriend ? 'extendedprofile.friend' : 'extendedprofile.me'
            ) ?? '';
        }

        const friendRequestSentTxt = window.findChildByName('friend_request_sent_txt');

        if(friendRequestSentTxt) friendRequestSentTxt.visible = profile.isFriendRequestSent;

        const onlineIcon = window.findChildByName('online_icon');
        const offlineIcon = window.findChildByName('offline_icon');
        const hiddenIcon = window.findChildByName('hidden_icon');

        if(onlineIcon) onlineIcon.visible = profile.isOnline;
        if(offlineIcon) offlineIcon.visible = !profile.isOnline;
        // TODO(AS3): "hidden" online status isn't in the parsed ExtendedProfileData
        // (see class header) — never shown.
        if(hiddenIcon) hiddenIcon.visible = false;

        window.findChildByName('status')?.invalidate();

        const localization = groupsManager.localization;

        localization?.registerParameter('extendedprofile.username', 'username', profile.userName);
        localization?.registerParameter('extendedprofile.created', 'created', profile.creationDate);
        localization?.registerParameter('extendedprofile.activitypoints', 'activitypoints', profile.achievementScore.toString());
        localization?.registerParameter(
            'extendedprofile.last.login', 'lastlogin',
            profile.lastAccessSinceInSeconds === -1 ? '-' : FriendlyTime.getFriendlyTime(profile.lastAccessSinceInSeconds, '.ago')
        );
        localization?.registerParameter(
            'extendedprofile.friends.count', 'count',
            profile.friendCount === -1 ? '-' : profile.friendCount.toString()
        );

        this.refreshAvatarImage();

        const addAsFriendButton = window.findChildByName('addasfriend_button');

        if(addAsFriendButton)
        {
            addAsFriendButton.visible = !profile.isFriend && !profile.isFriendRequestSent && !isOwnProfile
				&& (groupsManager.friendlist?.canBeAskedForAFriend(profile.userId) ?? false);
        }

        const okIcon = window.findChildByName('ok_icon');

        if(okIcon) okIcon.visible = isFriendOrOwn;

        const changeOwnAttributes = window.findChildByName('change_own_attributes');

        if(changeOwnAttributes) changeOwnAttributes.visible = isOwnProfile;

        const levelValue = window.findChildByName('levelValue');

        if(levelValue) levelValue.caption = profile.accountLevel.toString();

        // TODO(AS3): badgeCount/badgeRank come from AS3's totalBadges/totalBadgesRank
        // fields, not present on the parsed ExtendedProfileData (see class header) —
        // left at whatever the layout defaults to.

        const blockedContainer = window.findChildByName('blocked_container');

        if(blockedContainer) blockedContainer.visible = groupsManager.sessionDataManager?.isBlocked(profile.userId) ?? false;

        const blockButton = window.findChildByName('block_button');

        if(blockButton) blockButton.visible = !isOwnProfile;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refreshAvatarImage()
    private refreshAvatarImage(): void
    {
        const widgetWindow = this._window?.findChildByName('avatar_image') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IAvatarImageWidget | null;

        if(widget && this._profile) widget.figure = this._profile.figure;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onUserBadges()
    // TS deviation: only the plain badge-code list is used (no per-slot rarity/glow
    // data or glow playback) — same simplification as InfoStandUserView.updateBadges().
    onUserBadges(userId: number, badges: string[]): void
    {
        if(!this._profile || !this._badgeUpdateExpected || !this._window || this._profile.userId !== userId) return;

        this.clearSelectedBadges();

        for(let i = 0; i < badges.length && i < BADGE_SLOT_COUNT; i++)
        {
            this.setSelectedBadge(i, badges[i]);
        }

        this._badgeUpdateExpected = false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::setSelectedBadge()
    // TS deviation: AS3 takes (index, badge data object, playGlow) — simplified to
    // (index, badgeId) since no rarity/glow data reaches this call (see onUserBadges()).
    private setSelectedBadge(index: number, badgeId: string): void
    {
        const widgetWindow = this._window?.findChildByName(`badge_${index}`) as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(widget)
        {
            widget.type = 'normal';
            widget.badgeId = badgeId;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::clearSelectedBadges()
    private clearSelectedBadges(): void
    {
        if(!this._window) return;

        for(let i = 0; i < BADGE_SLOT_COUNT; i++)
        {
            this.setSelectedBadge(i, '');
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onAddAsFriend()
    private onAddAsFriend = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const groupsManager = this._groupsManager;
        const profile = this._profile;

        if(!groupsManager || !profile) return;

        if(!groupsManager.friendlist?.canBeAskedForAFriend(profile.userId)) return;

        groupsManager.friendlist.requestFriend(profile.userName);
        profile.isFriendRequestSent = true;
        this.refreshHeader();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onRooms()
    private onRooms = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const profile = this._profile;

        if(!profile) return;

        this._groupsManager?.newNavigator?.performSearch('hotel_view', `owner:${profile.userName}`);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onBlock()
    private onBlock = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._groupsManager?.windowManager?.confirm(
            '${extendedprofile.block_player.title}',
            '${extendedprofile.block_player.desc}',
            0,
            this.onConfirmBlock
        );
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onConfirmBlock()
    private onConfirmBlock = (dialog: IDisposable, event: WindowEvent): void =>
    {
        if(!dialog || dialog.disposed) return;

        dialog.dispose();

        if(event.type === WindowEvent.WE_OK && this._profile)
        {
            this._groupsManager?.sessionDataManager?.blockUser(this._profile.userId);

            const blockedContainer = this._window?.findChildByName('blocked_container');

            if(blockedContainer) blockedContainer.visible = true;
        }
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onConfirmUnblock()
    private onConfirmUnblock = (dialog: IDisposable, event: WindowEvent): void =>
    {
        if(!dialog || dialog.disposed) return;

        dialog.dispose();

        if(event.type === WindowEvent.WE_OK && this._profile)
        {
            this._groupsManager?.sessionDataManager?.unblockUser(this._profile.userId);

            const blockedContainer = this._window?.findChildByName('blocked_container');

            if(blockedContainer) blockedContainer.visible = false;
        }
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.close();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::close()
    close(): void
    {
        if(this._window) this._window.visible = false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onChangeLooks()
    private onChangeLooks = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._groupsManager?.context.createLinkEvent('avatareditor/open');
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onChangeBadges()
    private onChangeBadges = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._groupsManager?.context.createLinkEvent('inventory/open/badges');
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::updateVisibleExtendedProfile()
    updateVisibleExtendedProfile(userId: number): void
    {
        if(this._window?.visible && this._profile && this._profile.userId !== userId)
        {
            this._groupsManager?.send(new GetExtendedProfileMessageComposer(userId));
        }
    }
}
