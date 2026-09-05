/**
 * ExtendedProfileWindowCtrl
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as
 *
 * Phase 1 (basic profile) port: header (name/motto/avatar/online-friend
 * status/last-login/activity-points/friend-count/level/badge-count),
 * badges with their rarity glow, add-as-friend, block/unblock (with confirm
 * dialogs), the "search rooms by owner" and change-looks/change-badges links,
 * and close.
 *
 * Explicitly deferred as TODO(AS3), matching the Phase 1 scope decision:
 * - The hover badge-details popup (`showBadgeInfo`/`hideBadgeInfo`/
 *   `populateBadgeDetails`/`disposeBadgeDetails`, AS3 l.435-530). It needs
 *   AS3's `_selectedBadges` slot array, which this controller does not keep —
 *   `onUserBadges()` writes straight to the widgets — plus a second window
 *   built from the badge-details layout and positioned against the hovered
 *   slot's rectangle.
 * - The badge-count leaderboard link (needs HabboGroups' internal link
 *   builder, low value alone).
 *
 * **Badge glow came off that list on 2026-09-05**, and the stated reason for
 * deferring it had been wrong for a while: it said InfoStandUserView skipped
 * the same thing, and it no longer does — `setBadge()` there sets `glowColor`
 * off `BadgeRarityEnum` and calls `playGlow()`. Every piece was already here.
 * `BadgeImageWidget.playGlow()` animates on the filter pipeline, the parser
 * reads `badgeRarityId` and the authoritative `slotId` off the wire, and
 * `BadgeRarityEnum.isStandaloneTier()`/`getGlowColor()` are ported. What was
 * missing was the data path: `HabboGroupsManager` handed this controller
 * `badgesEvent.badges` — the codes alone — so rarity never arrived and the
 * grid indexed slots by array position instead of by each badge's own slot.
 *
 * Two things came off that list on 2026-09-01, both for the same reason — the
 * stated blocker had stopped being true:
 * - **Relationship status** (heart/smile/bobba). The layout ships all three
 *   rows, `RelationshipStatusEnum` and the `RelationshipStatusInfo` DTO were
 *   already ported, and only this controller's half was missing — which is why
 *   `HabboGroupsManager` never subscribed to `RelationshipStatusInfoEvent`
 *   (3360) as AS3 does.
 * - **The groups list**, whose marker said `GroupDetailsCtrl` had "zero TS
 *   port". It has 461 lines and an `onGroupDetails(parent, group)` waiting for
 *   a caller; only the list, its selection, the favourite pair and the
 *   no-groups panel were missing.
 *
 * Porting the first found the second: `refresh()` sent only
 * `GetSelectedBadges`, where AS3 sends `GetRelationshipStatusInfo` beside it,
 * so the relationship rows would have waited forever on a message nobody had
 * asked for.
 *
 * The online-status tri-state used to be on that list. It is no longer: the
 * parser was reading AS3's `onlineStatus` byte as a boolean and throwing the
 * third state away. It now reads the byte, so all three icons switch off it
 * exactly as AS3 does. `vortex-emulator` still writes that slot as a plain
 * `bool` and so cannot yet send state 2 — the client side is done, the server
 * side is the remaining half.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {ISelectedBadge} from '@habbo/communication/messages/parser/users/HabboUserBadgesMessageParser';
import {BadgeRarityEnum} from '@habbo/communication/enum/BadgeRarityEnum';
import {ExtendedProfileData} from '@habbo/communication/messages/incoming/users/ExtendedProfileData';
import type {RelationshipStatusInfo} from '@habbo/communication/messages/incoming/users/RelationshipStatusInfo';
import {RelationshipStatusEnum} from '@habbo/friendlist/RelationshipStatusEnum';
import {GetSelectedBadgesMessageComposer} from '@habbo/communication/messages/outgoing/users/GetSelectedBadgesMessageComposer';
import {GetRelationshipStatusInfoMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/GetRelationshipStatusInfoMessageComposer';
import {GetHabboGroupDetailsMessageComposer} from '@habbo/communication/messages/outgoing/users/GetHabboGroupDetailsMessageComposer';
import {SelectFavouriteHabboGroupMessageComposer} from '@habbo/communication/messages/outgoing/users/SelectFavouriteHabboGroupMessageComposer';
import {DeselectFavouriteHabboGroupMessageComposer} from '@habbo/communication/messages/outgoing/users/DeselectFavouriteHabboGroupMessageComposer';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import type {HabboGroupEntryData} from '@habbo/communication/messages/incoming/users/HabboGroupEntryData';
import type {HabboGroupDetailsData} from '@habbo/communication/messages/incoming/users/HabboGroupDetailsData';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import {GroupDetailsCtrl} from './GroupDetailsCtrl';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('habbo.groups.ExtendedProfileWindowCtrl');
export class ExtendedProfileWindowCtrl
{
    private static readonly BADGE_SLOT_COUNT = 5;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_4556
    private _profile: ExtendedProfileData | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_7764
    private _badgeUpdateExpected: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_playGlowOnNextBadgeUpdate
    private _playGlowOnNextBadgeUpdate: boolean = true;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_8041
    private _relationshipUpdateExpected: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_5493
    private _relationshipStatuses: Map<number, RelationshipStatusInfo> = new Map();
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_5964
    private _groupsList: IItemListWindow | null = null;
    // The prototype every row is cloned from, built once. Name DERIVED — `_SafeStr_8371`.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_groupEntryTemplate
    private _groupEntryTemplate: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_4935
    private _selectedGroupId: number = 0;
    // The panel that replaces the list when the user is in no group. Name DERIVED — `_SafeStr_6927`.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_noGroupsWindow
    private _noGroupsWindow: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_6738
    private _groupDetailsCtrl: GroupDetailsCtrl | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::_SafeStr_7676
    // Set when onProfileChanged() silently re-requests an already-open profile,
    // so the next onProfile() doesn't steal window focus/activation.
    private _skipActivateOnNextProfile: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::ExtendedProfileWindowCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
        // AS3 passes `false` here where DetailsWindowCtrl passes `true`; the flag is never read.
        this._groupDetailsCtrl = new GroupDetailsCtrl(groupsManager, false);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::dispose()
    dispose(): void
    {
        // Before the window goes, and before `_groupsManager` is dropped: AS3 calls this first in
        // its own dispose() for the same reason.
        this.clearBadgeGlowEffects();

        this._groupsManager = null;
        this._window?.dispose();
        this._window = null;
        this._profile = null;
        // AS3 disposes the relationship map here; the port's is a plain Map, so it is cleared.
        this._relationshipStatuses.clear();

        this._groupDetailsCtrl?.dispose();
        this._groupDetailsCtrl = null;
        this._groupEntryTemplate?.dispose();
        this._groupEntryTemplate = null;
        this._noGroupsWindow?.dispose();
        this._noGroupsWindow = null;
        this._groupsList = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::get linkPattern()
    get linkPattern(): string
    {
        return 'profile/';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::linkReceived()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::get badgeUpdateExpected() / set badgeUpdateExpected()
    get badgeUpdateExpected(): boolean
    {
        return this._badgeUpdateExpected;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::set badgeUpdateExpected()
    set badgeUpdateExpected(value: boolean)
    {
        this._badgeUpdateExpected = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::get relationshipUpdateExpected()
    get relationshipUpdateExpected(): boolean
    {
        return this._relationshipUpdateExpected;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::set relationshipUpdateExpected()
    set relationshipUpdateExpected(value: boolean)
    {
        this._relationshipUpdateExpected = value;
    }

    /**
	 * `userId` is unused, exactly as in AS3: the flag set alongside the profile request is what
	 * decides whether this snapshot belongs to the profile on screen.
	 *
	 * The `new Map(...)` copy is AS3's `clone()` and is not optional here: the parser owns one
	 * `Map` instance for the life of the connection and `flush()` clears it, so keeping the
	 * reference would leave this controller holding an empty map after the next message.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onRelationshipStatusInfo()
    onRelationshipStatusInfo(userId: number, statuses: Map<number, RelationshipStatusInfo>): void
    {
        if(!this._profile || !this._relationshipUpdateExpected) return;

        this._relationshipStatuses = new Map(statuses);

        this.refreshRelationships();

        this._relationshipUpdateExpected = false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window) return;

        const groupsManager = this._groupsManager;

        if(!groupsManager) return;

        // Both are built before the profile window and survive it: AS3 keeps the row template and
        // the no-groups panel across every profile this controller shows.
        if(this._groupEntryTemplate === null)
        {
            this._groupEntryTemplate = groupsManager.getXmlWindow('group_entry') as IWindowContainer | null;
        }

        if(this._noGroupsWindow === null)
        {
            this._noGroupsWindow = groupsManager.getXmlWindow('no_groups') as IWindowContainer | null;

            const viewGroupsButton = this._noGroupsWindow?.findChildByName('view_groups_button') ?? null;

            if(viewGroupsButton) viewGroupsButton.procedure = this.onViewGroups;
        }

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

        this._groupsList = window.findChildByName('groups_list') as IItemListWindow | null;

        const changeLooks = window.findChildByName('change_looks');

        if(changeLooks) changeLooks.procedure = this.onChangeLooks;

        const changeBadges = window.findChildByName('change_badges');

        if(changeBadges) changeBadges.procedure = this.onChangeBadges;

        const blockButton = window.findChildByName('block_button');

        if(blockButton) blockButton.procedure = this.onBlock;

        const userActivityPoints = window.findChildByName('user_activity_points');

        if(userActivityPoints) userActivityPoints.visible = groupsManager.isActivityDisplayEnabled;

        for(const status of RelationshipStatusEnum.displayableStatuses)
        {
            const region = window.findChildByName(`${RelationshipStatusEnum.statusAsString(status)}_friend_name_link_region`);

            if(region) region.procedure = this.onRelationshipLink;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onProfile()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onProfileChanged()
    onProfileChanged(userId: number): void
    {
        if(this._profile && this._profile.userId === userId && this._window?.visible)
        {
            this._groupsManager?.send(new GetExtendedProfileMessageComposer(userId));
            this._skipActivateOnNextProfile = true;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refresh()
    private refresh(isSameUserAlreadyShown: boolean): void
    {
        this.prepareWindow();

        if(!isSameUserAlreadyShown) this.clearSelectedBadges();

        // A profile being reopened on the same user is a repaint, not an arrival: its badges must
        // not re-animate. Only a fresh profile plays the rarity glow.
        this._playGlowOnNextBadgeUpdate = !isSameUserAlreadyShown;

        this._relationshipUpdateExpected = true;
        this._badgeUpdateExpected = true;

        if(this._profile)
        {
            // Both, in AS3's order. The relationship request was missing, which left
            // onRelationshipStatusInfo() waiting on a message nothing had asked for.
            this._groupsManager?.send(new GetRelationshipStatusInfoMessageComposer(this._profile.userId));
            this._groupsManager?.send(new GetSelectedBadgesMessageComposer(this._profile.userId));
        }

        this.refreshHeader();
        this.refreshGroupList();
    }

    /** The entry in the profile's own guild list matching the selected id, or null. */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::getSelectedGroup()
    private getSelectedGroup(): HabboGroupEntryData | null
    {
        for(const guild of this._profile?.guilds ?? [])
        {
            if(guild.groupId === this._selectedGroupId) return guild;
        }

        return null;
    }

    /**
	 * One row per guild, cloned from the template. The favourite pair is only ever *offered* on
	 * your own profile — on someone else's both buttons stay hidden, whatever the flag says.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refreshGroupList()
    private refreshGroupList(): void
    {
        const window = this._window;
        const profile = this._profile;
        const groupsManager = this._groupsManager;
        const list = this._groupsList;

        if(!window || !profile || !groupsManager || !list) return;

        const isOwnProfile = profile.userId === groupsManager.avatarId;

        list.visible = profile.guilds.length > 0;
        list.destroyListItems();

        for(const guild of profile.guilds)
        {
            const row = this._groupEntryTemplate?.clone() as IWindowContainer | null;

            if(row === null) continue;

            row.id = guild.groupId;

            const region = row.findChildByName('bg_region');

            if(region)
            {
                region.procedure = this.onSelectGroup;
                region.id = guild.groupId;
            }

            const clearFavourite = row.findChildByName('clear_favourite');

            if(clearFavourite)
            {
                clearFavourite.procedure = this.onClearFavourite;
                clearFavourite.visible = guild.favourite && isOwnProfile;
                clearFavourite.id = guild.groupId;
            }

            const makeFavourite = row.findChildByName('make_favourite');

            if(makeFavourite)
            {
                makeFavourite.procedure = this.onMakeFavourite;
                makeFavourite.visible = !guild.favourite && isOwnProfile;
                makeFavourite.id = guild.groupId;
            }

            const badgeWindow = row.findChildByName('group_pic_bitmap') as IWidgetWindow | null;
            const badgeWidget = (badgeWindow?.widget ?? null) as IBadgeImageWidget | null;

            if(badgeWidget)
            {
                badgeWidget.type = 'group';
                badgeWidget.badgeId = guild.badgeCode;
                badgeWidget.groupId = guild.groupId;
            }

            list.addListItem(row);
        }

        this.refreshGroupListSelection();

        groupsManager.localization?.registerParameter(
            'extendedprofile.groups.count',
            'count',
            profile.guilds.length.toString()
        );

        if(profile.guilds.length < 1)
        {
            const container = window.findChildByName('group_cont') as IWindowContainer | null;
            const noGroups = this._noGroupsWindow;

            if(container === null || noGroups === null) return;

            container.removeChildAt(0);
            container.addChild(noGroups);

            const caption = noGroups.findChildByName('no_groups_caption');

            if(caption)
            {
                caption.caption = groupsManager.localization?.getLocalization(
                    isOwnProfile ? 'extendedprofile.nogroups.me' : 'extendedprofile.nogroups.user'
                ) ?? '';
            }

            const viewGroupsButton = noGroups.findChildByName('view_groups_button');

            if(viewGroupsButton) viewGroupsButton.visible = true;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refreshGroupListSelection()
    private refreshGroupListSelection(): void
    {
        const list = this._groupsList;

        if(!list) return;

        for(let i = 0; i < list.numListItems; i++)
        {
            const row = list.getListItemAt(i) as IWindowContainer | null;

            if(row === null) continue;

            const selected = row.findChildByName('bg_selected_bitmap');
            const unselected = row.findChildByName('bg_unselected_bitmap');

            if(selected) selected.visible = this._selectedGroupId === row.id;
            if(unselected) unselected.visible = this._selectedGroupId !== row.id;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refreshHeader()
    private refreshHeader(): void
    {
        const window = this._window;
        const profile = this._profile;
        const groupsManager = this._groupsManager;

        if(!window || !profile || !groupsManager) return;

        const isOwnProfile = profile.userId === groupsManager.avatarId;
        const isFriendOrOwn = profile.isFriend || isOwnProfile;
        // Your own profile is never hidden from you, whatever the flag says.
        const isHiddenFromViewer = profile.isHidden && !isOwnProfile;

        // Both assignments are mandatory, and the port had neither. `full_profile_hidden` ships in
        // the layout with no `visible` attribute, so it renders by default: the banner sat over
        // every profile permanently while `bottom` was never shown. The hidden-profile *feature*
        // was the deliberate cut; dropping the two lines that switch between them was not.
        const bottom = window.findChildByName('bottom');
        const fullProfileHidden = window.findChildByName('full_profile_hidden');

        if(bottom) bottom.visible = !isHiddenFromViewer;
        if(fullProfileHidden) fullProfileHidden.visible = isHiddenFromViewer;

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

        // AS3 switches all three off one tri-state, not off a boolean. `hidden_icon` can still
        // never light up against `vortex-emulator`, whose `ExtendedProfileMessageComposer` writes
        // this slot as a plain `bool` and so can only send 0 or 1 — but the client no longer
        // throws the state away, and the day the server sends 2 this shows it.
        if(onlineIcon) onlineIcon.visible = profile.onlineStatus === ExtendedProfileData.ONLINE_STATUS_ONLINE;
        if(offlineIcon) offlineIcon.visible = profile.onlineStatus === ExtendedProfileData.ONLINE_STATUS_OFFLINE;
        if(hiddenIcon) hiddenIcon.visible = profile.onlineStatus === ExtendedProfileData.ONLINE_STATUS_HIDDEN;

        window.findChildByName('status')?.invalidate();

        const localization = groupsManager.localization;

        localization?.registerParameter('extendedprofile.username', 'username', profile.userName);
        localization?.registerParameter('extendedprofile.created', 'created', profile.creationDate);
        localization?.registerParameter('extendedprofile.activitypoints', 'activitypoints', profile.achievementScore.toString());
        localization?.registerParameter(
            'extendedprofile.last.login', 'lastlogin',
            profile.lastAccessSinceInSeconds === -1 ? '-' : FriendlyTime.getFriendlyTime(localization, profile.lastAccessSinceInSeconds, '.ago')
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

        const badgeCount = window.findChildByName('badgeCount');

        if(badgeCount) badgeCount.caption = profile.totalBadges.toString();

        // The rank row hides entirely below zero rather than showing "(#-1)": a server that does
        // not rank badges sends -1, and every profile would otherwise carry a nonsense rank.
        const badgeRank = window.findChildByName('badgeRank');

        if(badgeRank)
        {
            badgeRank.visible = profile.totalBadgesRank >= 0;

            if(badgeRank.visible) badgeRank.caption = `(#${profile.totalBadgesRank})`;
        }

        const blockedContainer = window.findChildByName('blocked_container');

        if(blockedContainer) blockedContainer.visible = groupsManager.sessionDataManager?.isBlocked(profile.userId) ?? false;

        const blockButton = window.findChildByName('block_button');

        if(blockButton) blockButton.visible = !isOwnProfile;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refreshRelationships()
    private refreshRelationships(): void
    {
        const window = this._window;

        if(!window || !this._groupsManager?.getBoolean('relationship.status.enabled')) return;

        const label = window.findChildByName('rel_status_label_txt');

        if(label) label.visible = true;

        for(const status of RelationshipStatusEnum.displayableStatuses)
        {
            this.setRelationshipDetails(status);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::setRelationshipDetails()
    private setRelationshipDetails(status: number): void
    {
        const window = this._window;

        if(!window) return;

        const info = this._relationshipStatuses.get(status) ?? null;
        const name = RelationshipStatusEnum.statusAsString(status);
        const othersText = window.findChildByName(`${name}_txt`);
        const nameLink = window.findChildByName(`${name}_friend_name_link_text`);
        const head = window.findChildByName(`${name}_head`) as IWidgetWindow | null;

        if(info && info.friendCount > 0)
        {
            if(nameLink) nameLink.caption = info.randomFriendName;

            if(head)
            {
                head.visible = true;

                const widget = (head.widget ?? null) as IAvatarImageWidget | null;

                if(widget) widget.figure = info.randomFriendFigure;
            }

            if(othersText)
            {
                if(info.friendCount > 1)
                {
                    othersText.visible = true;
                    othersText.invalidate();
                    othersText.caption = this._groupsManager?.localization?.getLocalizationWithParams(
                        `extendedprofile.relstatus.others.${name}`,
                        '',
                        'count',
                        `${info.friendCount - 1}`
                    ) ?? '';
                }
                else
                {
                    othersText.visible = false;
                }
            }
        }
        else
        {
            if(head) head.visible = false;

            if(nameLink) nameLink.caption = '${extendedprofile.add.friends}';

            if(othersText)
            {
                othersText.caption = '${extendedprofile.no.friends.in.this.category}';
                othersText.visible = true;
            }
        }
    }

    /**
	 * Swaps the `group_cont` child for the selected group's details panel. Ignores details for any
	 * group other than the selected one — the manager broadcasts them to three controllers.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onGroupDetails()
    onGroupDetails(group: HabboGroupDetailsData): void
    {
        if(this._selectedGroupId !== group.groupId) return;

        const container = this._window?.findChildByName('group_cont') as IWindowContainer | null;

        if(container === null) return;

        container.removeChildAt(0);
        container.invalidate();

        this._groupDetailsCtrl?.onGroupDetails(container, group);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::refreshAvatarImage()
    private refreshAvatarImage(): void
    {
        const widgetWindow = this._window?.findChildByName('avatar_image') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IAvatarImageWidget | null;

        if(widget && this._profile) widget.figure = this._profile.figure;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onUserBadges()
    /**
     * The wire slot is authoritative: AS3 indexes by each badge's own `slotIndex`, bounds-checked
     * to [0,4], rather than by its position in the array. A badge list that skips a slot therefore
     * leaves that slot empty instead of shifting everything left.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onUserBadges()
    onUserBadges(userId: number, badges: ISelectedBadge[]): void
    {
        if(!this._profile || !this._badgeUpdateExpected || !this._window || this._profile.userId !== userId) return;

        // Read then reset, as AS3 does: the flag applies to this update only, and `refresh()`
        // clears it for a profile that is merely being repainted with the same badges.
        const playGlow = this._playGlowOnNextBadgeUpdate;

        this._playGlowOnNextBadgeUpdate = true;

        this.clearSelectedBadges();

        for(const badge of badges)
        {
            if(badge.slotId < 0 || badge.slotId >= ExtendedProfileWindowCtrl.BADGE_SLOT_COUNT) continue;

            this.setSelectedBadge(badge.slotId, badge, playGlow);
        }

        this._badgeUpdateExpected = false;
    }

    /**
     * Puts one badge in one of the five slots, with its rarity glow.
     *
     * Only a *standalone* rarity tier gets a colour — the tiers that share one with a neighbour
     * get -1, which `glowColor`'s setter reads as "no glow". Having a colour and animating are
     * separate: `playGlow` decides the second, so reopening the same profile does not re-animate.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::setSelectedBadge()
    private setSelectedBadge(index: number, badge: ISelectedBadge | null, playGlow: boolean): void
    {
        const widget = this.getBadgeWidget(index);

        if(!widget) return;

        const uncommonEnabled = this.isUncommonBadgeRarityEnabled();

        widget.type = 'normal';
        widget.badgeId = badge?.badgeCode ?? '';
        widget.glowColor = badge !== null && BadgeRarityEnum.isStandaloneTier(badge.badgeRarityId, uncommonEnabled)
            ? BadgeRarityEnum.getGlowColor(badge.badgeRarityId, uncommonEnabled)
            : -1;

        if(widget.badgeId !== '' && playGlow && widget.glowColor >= 0) widget.playGlow(widget.glowColor);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::getBadgeWidget()
    private getBadgeWidget(index: number): IBadgeImageWidget | null
    {
        if(!this._window) return null;

        const widgetWindow = this._window.findChildByName(`badge_${index}`) as IWidgetWindow | null;

        return (widgetWindow?.widget ?? null) as IBadgeImageWidget | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::isUncommonBadgeRarityEnabled()
    private isUncommonBadgeRarityEnabled(): boolean
    {
        return this._groupsManager?.getBoolean('badge_rarity.uncommon') ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::clearSelectedBadges()
    private clearSelectedBadges(): void
    {
        if(!this._window) return;

        for(let i = 0; i < ExtendedProfileWindowCtrl.BADGE_SLOT_COUNT; i++)
        {
            this.setSelectedBadge(i, null, false);
        }
    }

    /**
     * Stops any running glow animation before the window goes away — a glow ticking against a
     * disposed window has nothing to draw into.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::clearBadgeGlowEffects()
    private clearBadgeGlowEffects(): void
    {
        for(let i = 0; i < ExtendedProfileWindowCtrl.BADGE_SLOT_COUNT; i++)
        {
            this.getBadgeWidget(i)?.clearGlow();
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onAddAsFriend()
    private onAddAsFriend = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const groupsManager = this._groupsManager;
        const profile = this._profile;

        if(!groupsManager || !profile) return;

        // `askForAFriend()` carries the three guards AS3 relies on here — friendlist
        // initialized, request not already sent, `canBeAskedForAFriend()` — and sends the
        // quest ping alongside the request, so the click must go through it.
        if(!groupsManager.friendlist?.askForAFriend(profile.userId, profile.userName)) return;

        profile.isFriendRequestSent = true;
        this.refreshHeader();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onRooms()
    private onRooms = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const profile = this._profile;

        if(!profile) return;

        this._groupsManager?.newNavigator?.performSearch('hotel_view', `owner:${profile.userName}`);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onBlock()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onConfirmBlock()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onConfirmUnblock()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.close();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::close()
    close(): void
    {
        if(this._window) this._window.visible = false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onChangeLooks()
    private onChangeLooks = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._groupsManager?.context.createLinkEvent('avatareditor/open');
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onChangeBadges()
    private onChangeBadges = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._groupsManager?.context.createLinkEvent('inventory/open/badges');
    };

    /**
	 * The clicked region is named `<status>_friend_name_link_region`, so the status is whatever
	 * precedes the first underscore — AS3 reads it back off the window's own name rather than
	 * closing over the status it bound.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onRelationshipLink()
    private onRelationshipLink = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        if(!event.target || !window.name) return;

        const name = window.name.substr(0, window.name.indexOf('_'));
        const info = this._relationshipStatuses.get(RelationshipStatusEnum.stringAsStatus(name)) ?? null;

        if(info)
        {
            // AS3 tests the id for truthiness: a category whose random friend is 0 opens nothing.
            if(info.randomFriendId) this._groupsManager?.showExtendedProfile(info.randomFriendId);
        }
        else
        {
            this._groupsManager?.windowManager?.alert(
                '${extendedprofile.add.friends.alert.title}',
                '${extendedprofile.add.friends.alert.body}',
                0,
                this.addFriendsAlertCallback
            );
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onViewGroups()
    private onViewGroups = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._groupsManager?.navigator?.performGuildBaseSearch();
    };

    /**
	 * Selecting a group asks the server for its details — `onGroupDetails()` above is the answer —
	 * and repaints the selection immediately rather than waiting for it.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onSelectGroup()
    private onSelectGroup = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._selectedGroupId = window.id;

        this._groupsManager?.send(new GetHabboGroupDetailsMessageComposer(this._selectedGroupId, false));
        this._groupsManager?.send(new EventLogMessageComposer('HabboGroups', `${window.id}`, 'select'));

        this.refreshGroupListSelection();
    };

    /**
	 * AS3 tracks `window.parent.id` here while sending `window.id` — the button carries the group
	 * id and so does the row it sits in, and the two are the same value. Kept verbatim.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onMakeFavourite()
    private onMakeFavourite = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._groupsManager?.send(new SelectFavouriteHabboGroupMessageComposer(window.id));
        this._groupsManager?.send(new EventLogMessageComposer('HabboGroups', `${window.parent?.id ?? 0}`, 'make favourite'));

        this._selectedGroupId = window.id;
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::onClearFavourite()
    private onClearFavourite = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._groupsManager?.send(new DeselectFavouriteHabboGroupMessageComposer(window.id));
        this._groupsManager?.send(new EventLogMessageComposer('HabboGroups', `${window.parent?.id ?? 0}`, 'clear favourite'));

        this._selectedGroupId = window.id;
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::addFriendsAlertCallback()
    private addFriendsAlertCallback = (dialog: IDisposable, event: WindowEvent): void =>
    {
        if(event.type === WindowEvent.WE_OK)
        {
            this._groupsManager?.context.createLinkEvent('friendbar/findfriends');
            this.close();
        }

        dialog.dispose();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ExtendedProfileWindowCtrl.as::updateVisibleExtendedProfile()
    updateVisibleExtendedProfile(userId: number): void
    {
        if(this._window?.visible && this._profile && this._profile.userId !== userId)
        {
            this._groupsManager?.send(new GetExtendedProfileMessageComposer(userId));
        }
    }
}
