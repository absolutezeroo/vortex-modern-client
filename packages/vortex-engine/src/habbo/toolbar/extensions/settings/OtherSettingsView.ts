import type {HabboToolbar} from '../../HabboToolbar';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('OtherSettingsView');

/**
 * Other settings panel view
 *
 * In AS3 this creates a window with checkboxes for old chat preference,
 * ignore room invites, disable room camera follow, and reset phone number.
 * In Vortex, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/settings/OtherSettingsView.as
 */
export class OtherSettingsView
{
    private _toolbar: HabboToolbar | null;

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        this.initializeSettings();

        log.debug('OtherSettingsView constructed');
    }

    private _preferOldChat: boolean = false;

    /**
	 * Whether the old chat preference is selected
	 */
    get preferOldChat(): boolean
    {
        return this._preferOldChat;
    }

    set preferOldChat(value: boolean)
    {
        this._preferOldChat = value;
    }

    private _ignoreRoomInvites: boolean = false;

    /**
	 * Whether room invites are ignored
	 */
    get ignoreRoomInvites(): boolean
    {
        return this._ignoreRoomInvites;
    }

    set ignoreRoomInvites(value: boolean)
    {
        this._ignoreRoomInvites = value;
    }

    private _disableRoomCameraFollow: boolean = false;

    /**
	 * Whether room camera follow is disabled
	 */
    get disableRoomCameraFollow(): boolean
    {
        return this._disableRoomCameraFollow;
    }

    set disableRoomCameraFollow(value: boolean)
    {
        this._disableRoomCameraFollow = value;
    }

    private _showResetPhoneButton: boolean = false;

    /**
	 * Whether the reset phone number button is visible
	 */
    get showResetPhoneButton(): boolean
    {
        return this._showResetPhoneButton;
    }

    /**
	 * Handle a button click
	 *
	 * @param buttonName The name of the clicked button
	 */
    public onButtonClicked(buttonName: string): void
    {
        if(!this._toolbar) return;

        switch(buttonName)
        {
            case 'back_btn':
                this.dispose();
                break;
            case 'prefer_old_chat_checkbox':
                // In AS3: toolbar.freeFlowChat.isDisabledInPreferences = isSelected
                break;
            case 'ignore_room_invites_checkbox':
                // In AS3: toolbar.messenger.setRoomInvitesIgnored(isSelected)
                // In AS3: toolbar.connection.send(new SetIgnoreRoomInvitesMessageComposer(...))
                break;
            case 'disable_room_camera_follow_checkbox':
                // In AS3: toolbar.connection.send(new SetRoomCameraPreferencesMessageComposer(...))
                // In AS3: toolbar.sessionDataManager.setRoomCameraFollowDisabled(...)
                break;
            case 'btn_reset_phone_number_collection':
                this._showResetPhoneButton = false;
                // In AS3: toolbar.connection.send(new ResetPhoneNumberStateMessageComposer())
                break;
        }
    }

    /**
	 * Dispose of this view
	 */
    public dispose(): void
    {
        if(this._toolbar == null) return;

        this._toolbar = null;
    }

    private initializeSettings(): void
    {
        if(!this._toolbar) return;

        const roomCameraFollowEnabled = this._toolbar.getBoolean('room.camera.follow_user');
        const smsVerificationEnabled = this._toolbar.getBoolean('sms.identity.verification.enabled');
        const phoneVerificationStatus = this._toolbar.getInteger('phone.verification.status', 0);
        const phoneCollectionStatus = this._toolbar.getInteger('phone.collection.status', 0);
        const smsButtonEnabled = this._toolbar.getBoolean('sms.identity.verification.button.enabled');

        const isVerified = phoneVerificationStatus === 2;
        const isCollected = phoneCollectionStatus === 2;
        const isNotCollected = phoneCollectionStatus === 0;

        this._showResetPhoneButton = smsVerificationEnabled && !isVerified &&
			(isCollected || (smsButtonEnabled && isNotCollected));

        if(roomCameraFollowEnabled && this._toolbar.sessionDataManager)
        {
            this._disableRoomCameraFollow = this._toolbar.sessionDataManager.isRoomCameraFollowDisabled;
        }
    }
}
