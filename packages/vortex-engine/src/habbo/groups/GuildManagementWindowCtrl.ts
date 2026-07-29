import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {IGuildManagementData} from '@habbo/communication/messages/incoming/users/IGuildManagementData';
import type {GuildCreationInfoData} from '@habbo/communication/messages/incoming/users/GuildCreationInfoData';
import type {GuildEditInfoData} from '@habbo/communication/messages/incoming/users/GuildEditInfoData';
import {GuildOwnedRoomData} from '@habbo/communication/messages/incoming/users/GuildOwnedRoomData';
import {CreateGuildMessageComposer} from '@habbo/communication/messages/outgoing/users/CreateGuildMessageComposer';
import {UpdateGuildIdentityMessageComposer} from '@habbo/communication/messages/outgoing/users/UpdateGuildIdentityMessageComposer';
import {UpdateGuildBadgeMessageComposer} from '@habbo/communication/messages/outgoing/users/UpdateGuildBadgeMessageComposer';
import {UpdateGuildColorsMessageComposer} from '@habbo/communication/messages/outgoing/users/UpdateGuildColorsMessageComposer';
import {UpdateGuildSettingsMessageComposer} from '@habbo/communication/messages/outgoing/users/UpdateGuildSettingsMessageComposer';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from './HabboGroupsManager';
import {ColorGridCtrl} from './ColorGridCtrl';
import {GuildSettingsCtrl} from './GuildSettingsCtrl';
import {GuildSettingsChangedInManageEvent} from './events/GuildSettingsChangedInManageEvent';
import {BadgeEditorCtrl} from './badge/BadgeEditorCtrl';

const log = Logger.getLogger('habbo.groups.GuildManagementWindowCtrl');

/**
 * GuildManagementWindowCtrl
 *
 * One window driving two flows off the same layout, told apart by `data.exists`:
 *
 * - **Creation** (`exists === false`, fed by `GuildCreationInfoData`): four steps —
 *   identity, badge, colours, confirm — with a header strip, a next/previous footer and
 *   a buy button that sends `CreateGuild`. Nothing is sent until the buy.
 * - **Editing** (`exists === true`, fed by `GuildEditInfoData`): the same five panes as
 *   tabs, no footer, and each pane saved on the way out of it — leaving a tab, closing
 *   the window, or the window losing focus all call `saveView()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/GuildManagementWindowCtrl.as
 */
export class GuildManagementWindowCtrl
{
    // AS3: .../GuildManagementWindowCtrl.as::VIEW_IDENTITY
    private static readonly VIEW_IDENTITY: number = 1;
    // AS3: .../GuildManagementWindowCtrl.as::VIEW_BADGE
    private static readonly VIEW_BADGE: number = 2;
    // AS3: .../GuildManagementWindowCtrl.as::VIEW_COLORS
    private static readonly VIEW_COLORS: number = 3;
    // AS3: .../GuildManagementWindowCtrl.as::VIEW_CONFIRM
    private static readonly VIEW_CONFIRM: number = 4;
    // AS3: .../GuildManagementWindowCtrl.as::VIEW_SETTINGS
    private static readonly VIEW_SETTINGS: number = 5;

    /**
     * Base Y of the header caption. AS3 constant is obfuscated (`_SafeStr_10926`), so
     * the name is DERIVED from its only use site in `refresh()`.
     *
     * AS3: .../GuildManagementWindowCtrl.as::_SafeStr_10926
     */
    private static readonly HEADER_CAPTION_Y: number = 43;
    /**
     * Base Y of the header description. AS3 constant is obfuscated (`_SafeStr_10723`),
     * so the name is DERIVED from its only use site in `refresh()`.
     *
     * AS3: .../GuildManagementWindowCtrl.as::_SafeStr_10723
     */
    private static readonly HEADER_DESC_Y: number = 69;
    // AS3: .../GuildManagementWindowCtrl.as::EDIT_HEADER_TEXTS_OFFSET
    private static readonly EDIT_HEADER_TEXTS_OFFSET: number = -20;
    // AS3: .../GuildManagementWindowCtrl.as::CREATE_HEADER_BITMAP_OFFSET
    private static readonly CREATE_HEADER_BITMAP_OFFSET: number = 36;
    // AS3: .../GuildManagementWindowCtrl.as::STEP_TITLE_Y_OFFSET_ACTIVE
    private static readonly STEP_TITLE_Y_OFFSET_ACTIVE: number = 5;
    // AS3: .../GuildManagementWindowCtrl.as::STEP_TITLE_Y_OFFSET_INACTIVE
    private static readonly STEP_TITLE_Y_OFFSET_INACTIVE: number = 9;
    // AS3: .../GuildManagementWindowCtrl.as::STEP_TITLE_CREDIT_Y_OFFSET_ACTIVE
    private static readonly STEP_TITLE_CREDIT_Y_OFFSET_ACTIVE: number = 6;
    // AS3: .../GuildManagementWindowCtrl.as::STEP_TITLE_CREDIT_Y_OFFSET_INACTIVE
    private static readonly STEP_TITLE_CREDIT_Y_OFFSET_INACTIVE: number = 10;
    // AS3: .../GuildManagementWindowCtrl.as::MAX_DESCRIPTION_LENGTH
    private static readonly MAX_DESCRIPTION_LENGTH: number = 255;
    // AS3: .../GuildManagementWindowCtrl.as::MAX_NAME_LENGTH
    private static readonly MAX_NAME_LENGTH: number = 30;

    /**
     * Highest step the creation wizard goes to. Editing shows a fifth pane as a tab, but
     * the stepped footer never walks past confirm. AS3 inlines the bound in `limitStep()`.
     *
     * AS3: .../GuildManagementWindowCtrl.as::limitStep()
     */
    private static readonly LAST_CREATE_STEP: number = 4;

    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../GuildManagementWindowCtrl.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_4746
    private _badgeEditorCtrl: BadgeEditorCtrl | null;
    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_4823
    private _primaryColorGrid: ColorGridCtrl | null;
    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_4826
    private _secondaryColorGrid: ColorGridCtrl | null;
    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_5227
    private _settingsCtrl: GuildSettingsCtrl;
    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_7792
    private _alertOpen: boolean = false;
    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_6017
    private _controllersWarningRoomId: number = 0;
    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_4556
    private _data: IGuildManagementData | null = null;
    // AS3: .../GuildManagementWindowCtrl.as::_SafeStr_4634
    private _currentStep: number = GuildManagementWindowCtrl.VIEW_IDENTITY;

    // AS3: .../GuildManagementWindowCtrl.as::GuildManagementWindowCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
        this._badgeEditorCtrl = new BadgeEditorCtrl(groupsManager);
        this._primaryColorGrid = new ColorGridCtrl(groupsManager, this.onPrimaryColorSelected);
        this._secondaryColorGrid = new ColorGridCtrl(groupsManager, this.onSecondaryColorSelected);
        this._settingsCtrl = new GuildSettingsCtrl();
    }

    // AS3: .../GuildManagementWindowCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: .../GuildManagementWindowCtrl.as::get data()
    get data(): IGuildManagementData | null
    {
        return this._data;
    }

    // AS3: .../GuildManagementWindowCtrl.as::prepare()
    private prepare(): void
    {
        if(this._window !== null) return;

        const window = this._groupsManager?.getXmlWindow('group_management_window') as IWindowContainer | null;

        if(!window)
        {
            log.error('prepare: getXmlWindow("group_management_window") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const closeButton = window.findChildByTag('close');

        if(closeButton) closeButton.procedure = this.onCloseWindow;

        window.center();

        this.bindProcedure('create_room_link_region', this.onCreateRoomLink);
        this.bindProcedure('cancel_link_region', this.onCancelLink);
        this.bindProcedure('next_step_button', this.onNextStep);
        this.bindProcedure('previous_step_link_region', this.onPreviousStep);
        this.bindProcedure('buy_button', this.onBuy);
        this.bindProcedure('vip_required_region', this.onGetVip);

        window.addEventListener('WE_DEACTIVATED', this.onWindowUnActivated);

        this.bindProcedure('edit_tab_1', this.onTab);
        this.bindProcedure('edit_tab_2', this.onTab);
        this.bindProcedure('edit_tab_3', this.onTab);
        this.bindProcedure('edit_tab_5', this.onTab);
        this.bindProcedure('reset_badge', this.onBadgeReset);
        this.bindProcedure('reset_colors', this.onColorReset);
        this.bindProcedure('step_1_members_region', this.onMembersClick);

        this._settingsCtrl.prepare(window);
    }

    private bindProcedure(name: string, procedure: (event: WindowEvent, window: IWindow) => void): void
    {
        const child = this._window?.findChildByName(name);

        if(child) child.procedure = procedure;
        else log.warn(`prepare: the group management window has no "${name}" child`);
    }

    private child(name: string): IWindow | null
    {
        return this._window?.findChildByName(name) ?? null;
    }

    /**
     * A room was created while the wizard sat open on step 1 — it goes to the head of
     * the base-room menu and is selected, so the player can carry straight on.
     *
     * AS3: .../GuildManagementWindowCtrl.as::onFlatCreated()
     */
    onFlatCreated(flatId: number, flatName: string): void
    {
        if(this._window !== null && this._window.visible && this._data !== null && !this._data.exists)
        {
            this._data.ownedRooms.splice(0, 0, new GuildOwnedRoomData(flatId, flatName, false));
            this.prepareRoomSelection();

            const dropMenu = this.getBaseDropMenu();

            if(dropMenu) dropMenu.selection = 0;
        }
    }

    /**
     * HC status changed while the wizard sat on the confirm step, where the buy button
     * is gated on it — redraw so it enables or disables to match.
     *
     * AS3: .../GuildManagementWindowCtrl.as::onSubscriptionChange()
     */
    onSubscriptionChange(): void
    {
        if(this._window !== null && this._window.visible && this._data !== null && !this._data.exists && this._currentStep === GuildManagementWindowCtrl.VIEW_CONFIRM)
        {
            this.refresh();
        }
    }

    // AS3: .../GuildManagementWindowCtrl.as::refresh()
    refresh(): void
    {
        this.prepare();

        const data = this._data;
        const groupsManager = this._groupsManager;

        if(!this._window || !data || !groupsManager) return;

        const ownerControls = !data.exists || data.isOwner;

        for(const tab of ['edit_tab_1', 'edit_tab_2', 'edit_tab_3', 'edit_tab_5'])
        {
            const tabWindow = this.child(tab);

            if(tabWindow) tabWindow.visible = ownerControls;
        }

        for(let step = 1; step <= GuildManagementWindowCtrl.VIEW_SETTINGS; step++)
        {
            const container = this.getStepContainer(step);

            if(container) container.visible = this._currentStep === step;

            const headerPic = this.child(`header_pic_bitmap_step_${step}`);

            if(headerPic)
            {
                headerPic.y = data.exists ? 0 : GuildManagementWindowCtrl.CREATE_HEADER_BITMAP_OFFSET;
                headerPic.visible = this._currentStep === step;
            }
        }

        const headerCaption = this.child('header_caption_txt');
        const headerDesc = this.child('header_desc_txt');

        if(headerCaption)
        {
            headerCaption.caption = this.getStepCaption();
            headerCaption.y = GuildManagementWindowCtrl.HEADER_CAPTION_Y + this.getHeaderTextOffset();
        }

        if(headerDesc)
        {
            headerDesc.caption = this.getStepDesc();
            headerDesc.y = GuildManagementWindowCtrl.HEADER_DESC_Y + this.getHeaderTextOffset();
        }

        const tabContext = this.child('edit_guild_tab_context');

        if(tabContext) tabContext.visible = data.exists;

        const footer = this.child('footer_cont');

        if(footer) footer.visible = !data.exists;

        const resetBadge = this.child('reset_badge');
        const resetColors = this.child('reset_colors');

        if(resetBadge) resetBadge.visible = false;
        if(resetColors) resetColors.visible = false;

        if(this._currentStep === GuildManagementWindowCtrl.VIEW_BADGE)
        {
            if(!data.exists) groupsManager.trackGoogle('groupPurchase', 'step2_badge');

            if(this._badgeEditorCtrl && !this._badgeEditorCtrl.isIntialized)
            {
                this._badgeEditorCtrl.createWindow(this.getStepContainer(GuildManagementWindowCtrl.VIEW_BADGE), data.badgeSettings);
                this._badgeEditorCtrl.resetLayerOptions(data.badgeSettings);
            }

            if(resetBadge) resetBadge.visible = data.exists;
        }

        if(this._currentStep === GuildManagementWindowCtrl.VIEW_COLORS)
        {
            if(!data.exists) groupsManager.trackGoogle('groupPurchase', 'step3_colors');

            const editorData = groupsManager.guildEditorData;
            const colorsContainer = this.getStepContainer(GuildManagementWindowCtrl.VIEW_COLORS);

            if(this._primaryColorGrid && !this._primaryColorGrid.isInitialized && editorData)
            {
                this._primaryColorGrid.createAndAttach(colorsContainer, 'guild_primary_color_selector', editorData.guildPrimaryColors);

                if(data.exists) this._primaryColorGrid.setSelectedColorById(data.primaryColorId);
                else this._primaryColorGrid.setSelectedColorById(editorData.findMatchingPrimaryColorId(this._badgeEditorCtrl?.primaryColorIndex ?? 0));
            }

            if(this._secondaryColorGrid && !this._secondaryColorGrid.isInitialized && editorData)
            {
                this._secondaryColorGrid.createAndAttach(colorsContainer, 'guild_secondary_color_selector', editorData.guildSecondaryColors);

                if(data.exists) this._secondaryColorGrid.setSelectedColorById(data.secondaryColorId);
                else this._secondaryColorGrid.setSelectedColorById(editorData.findMatchingSecondaryColorId(this._badgeEditorCtrl?.secondaryColorIndex ?? 0));
            }

            if(resetColors) resetColors.visible = data.exists;
        }

        if(this._currentStep === GuildManagementWindowCtrl.VIEW_SETTINGS)
        {
            if(!this._settingsCtrl.isInitialized) this._settingsCtrl.refresh(data);
        }

        if(this._currentStep === GuildManagementWindowCtrl.VIEW_CONFIRM)
        {
            if(!data.exists) groupsManager.trackGoogle('groupPurchase', 'step4_confirm');

            this.updateConfirmPreview();
        }

        if(this._currentStep === GuildManagementWindowCtrl.VIEW_IDENTITY)
        {
            if(!data.exists)
            {
                groupsManager.trackGoogle('groupPurchase', 'step1_identity');
            }
            else
            {
                groupsManager.windowManager?.registerLocalizationParameter('group.membercount', 'totalMembers', `${data.membershipCount}`);

                const membersText = this.child('step_1_members_txt');

                if(membersText) membersText.caption = groupsManager.localization?.getLocalization('group.membercount') ?? '';
            }

            for(const name of ['base_label', 'base_dropmenu', 'base_warning', 'create_room_link_region'])
            {
                const window = this.child(name);

                if(window) window.visible = !data.exists;
            }

            const membersRegion = this.child('step_1_members_region');

            if(membersRegion) membersRegion.visible = data.exists;
        }

        this.refreshCreateHeader();
    }

    // AS3: .../GuildManagementWindowCtrl.as::updateConfirmPreview()
    private updateConfirmPreview(): void
    {
        const groupsManager = this._groupsManager;

        if(!groupsManager || groupsManager.guildEditorData === null || this._window === null) return;

        if(this._badgeEditorCtrl?.isIntialized)
        {
            const badge = this._badgeEditorCtrl.getBadgeBitmap();
            const preview = this.child('badge_preview_image') as IBitmapWrapperWindow | null;

            if(badge !== null && preview !== null) preview.bitmap = badge;
        }

        if(this._primaryColorGrid?.isInitialized)
        {
            const color = this._primaryColorGrid.getSelectedColorData();
            const swatch = this.child('badge_preview_primary_color_top');

            if(color !== null && swatch !== null) swatch.color = color.color;
        }

        if(this._secondaryColorGrid?.isInitialized)
        {
            const color = this._secondaryColorGrid.getSelectedColorData();
            const swatch = this.child('badge_preview_secondary_color_top');

            if(color !== null && swatch !== null) swatch.color = color.color;
        }

        const buyButton = this.child('buy_button');
        const buyBorder = this.child('buy_border');

        if(groupsManager.hasVip)
        {
            buyButton?.enable();

            if(buyBorder) buyBorder.color = 16761600;
        }
        else
        {
            if(buyBorder) buyBorder.color = 11184810;

            buyButton?.disable();
        }

        const vipBorder = this.child('vip_required_border');

        if(vipBorder) vipBorder.visible = !groupsManager.hasVip;

        const confirmationCaption = this.child('confirmation_caption');
        const nameField = this.child('name_txt') as unknown as ITextWindow | null;

        if(confirmationCaption && nameField) confirmationCaption.caption = nameField.text;
    }

    // AS3: .../GuildManagementWindowCtrl.as::getHeaderTextOffset()
    private getHeaderTextOffset(): number
    {
        return this._data?.exists ? GuildManagementWindowCtrl.EDIT_HEADER_TEXTS_OFFSET : 0;
    }

    // AS3: .../GuildManagementWindowCtrl.as::refreshCreateHeader()
    private refreshCreateHeader(): void
    {
        const data = this._data;

        if(!data) return;

        const stepsHeader = this.child('steps_header_cont');

        if(stepsHeader) stepsHeader.visible = !data.exists;

        if(data.exists) return;

        const nextButton = this.child('next_step_button');
        const previousRegion = this.child('previous_step_link_region');
        const cancelRegion = this.child('cancel_link_region');
        const buyBorder = this.child('buy_border');

        if(nextButton) nextButton.visible = this.hasNextStep();
        if(previousRegion) previousRegion.visible = this.hasPreviousStep();
        if(cancelRegion) cancelRegion.visible = !this.hasPreviousStep();
        if(buyBorder) buyBorder.visible = !this.hasNextStep();

        for(let step = 1; step <= GuildManagementWindowCtrl.LAST_CREATE_STEP; step++)
        {
            const inactive = this.getStepHeader(step, false);
            const active = this.getStepHeader(step, true);

            if(inactive) inactive.visible = step !== this._currentStep;
            if(active) active.visible = step === this._currentStep;

            const title = this.child(`step_title_${step}`);

            if(title)
            {
                title.y = step === this._currentStep
                    ? GuildManagementWindowCtrl.STEP_TITLE_Y_OFFSET_ACTIVE
                    : GuildManagementWindowCtrl.STEP_TITLE_Y_OFFSET_INACTIVE;
            }
        }

        const creditIcon = this.child('gcreate_icon_credit');

        if(creditIcon)
        {
            creditIcon.y = this._currentStep === GuildManagementWindowCtrl.VIEW_CONFIRM
                ? GuildManagementWindowCtrl.STEP_TITLE_CREDIT_Y_OFFSET_ACTIVE
                : GuildManagementWindowCtrl.STEP_TITLE_CREDIT_Y_OFFSET_INACTIVE;
        }
    }

    // AS3: .../GuildManagementWindowCtrl.as::getStepHeader()
    private getStepHeader(step: number, active: boolean): IWindow | null
    {
        return this.child(`gcreate_${step}_${active ? '1' : '0'}`);
    }

    // AS3: .../GuildManagementWindowCtrl.as::getStepContainer()
    private getStepContainer(step: number): IWindowContainer | null
    {
        return this.child(`step_cont_${step}`) as IWindowContainer | null;
    }

    // AS3: .../GuildManagementWindowCtrl.as::getStepCaption()
    private getStepCaption(): string
    {
        const key = (this._data?.exists ? 'group.edit.tabcaption.' : 'group.create.stepcaption.') + this._currentStep;

        return this._groupsManager?.localization?.getLocalization(key, key) ?? key;
    }

    // AS3: .../GuildManagementWindowCtrl.as::getStepDesc()
    private getStepDesc(): string
    {
        const key = (this._data?.exists ? 'group.edit.tabdesc.' : 'group.create.stepdesc.') + this._currentStep;

        return this._groupsManager?.localization?.getLocalization(key, key) ?? key;
    }

    // AS3: .../GuildManagementWindowCtrl.as::onGuildCreationInfo()
    onGuildCreationInfo(data: GuildCreationInfoData): void
    {
        this._data = data;
        this._currentStep = GuildManagementWindowCtrl.VIEW_IDENTITY;
        this._controllersWarningRoomId = 0;

        this.refresh();
        this.refreshBadgeImage();
        this.setupInputs();

        this._groupsManager?.localization?.registerParameter('group.create.confirm.buyinfo', 'amount', `${data.costInCredits}`);

        if(!this._window) return;

        this._window.visible = true;
        this._window.activate();
    }

    // AS3: .../GuildManagementWindowCtrl.as::onGuildEditInfo()
    onGuildEditInfo(data: GuildEditInfoData): void
    {
        this._data = data;
        this._currentStep = GuildManagementWindowCtrl.VIEW_IDENTITY;
        this._controllersWarningRoomId = 0;

        this.refresh();
        this.refreshBadgeImage();
        this.setupInputs();

        if(!this._window) return;

        const tabContext = this.child('edit_guild_tab_context') as ITabContextWindow | null;
        const tab = this.child(`edit_tab_${this._currentStep}`) as ISelectableWindow | null;

        if(tabContext?.selector && tab) tabContext.selector.setSelected(tab);

        this._window.visible = true;
        this._window.activate();
    }

    // AS3: .../GuildManagementWindowCtrl.as::setupInputs()
    private setupInputs(): void
    {
        const data = this._data;

        if(!data) return;

        const nameField = this.child('name_txt') as unknown as ITextWindow | null;
        const descField = this.child('desc_txt') as unknown as ITextWindow | null;

        if(nameField) nameField.text = data.groupName;
        if(descField) descField.text = data.groupDesc;

        this.prepareRoomSelection();

        this._badgeEditorCtrl?.resetLayerOptions(data.badgeSettings);
        this._primaryColorGrid?.setSelectedColorById(data.primaryColorId);
        this._secondaryColorGrid?.setSelectedColorById(data.secondaryColorId);
        this._settingsCtrl.refresh(data);
    }

    // AS3: .../GuildManagementWindowCtrl.as::onTab()
    private onTab = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WE_SELECT' || window.id === this._currentStep) return;

        if(!this.validateView())
        {
            event.preventDefault();

            return;
        }

        this.saveView();
        this._currentStep = window.id;
        this.refresh();
    };

    // AS3: .../GuildManagementWindowCtrl.as::onColorReset()
    private onColorReset = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._data) return;

        if(this._primaryColorGrid?.isInitialized) this._primaryColorGrid.setSelectedColorById(this._data.primaryColorId);
        if(this._secondaryColorGrid?.isInitialized) this._secondaryColorGrid.setSelectedColorById(this._data.secondaryColorId);
    };

    // AS3: .../GuildManagementWindowCtrl.as::onBadgeReset()
    private onBadgeReset = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK' && this._badgeEditorCtrl?.isIntialized && this._data)
        {
            this._badgeEditorCtrl.resetLayerOptions(this._data.badgeSettings);
        }
    };

    // AS3: .../GuildManagementWindowCtrl.as::onMembersClick()
    private onMembersClick = (event: WindowEvent, _window: IWindow): void =>
    {
        const groupsManager = this._groupsManager;

        if(event.type !== 'WME_CLICK' || !this._data?.exists || !groupsManager) return;

        const membersCtrl = groupsManager.guildMembersWindowCtrl;

        if(membersCtrl === null) return;

        groupsManager.trackGoogle('groupManagement', 'groupMembers');
        membersCtrl.onMembersClick(this._data.groupId, 0);
    };

    // AS3: .../GuildManagementWindowCtrl.as::onCancelLink()
    private onCancelLink = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.close();
    };

    // AS3: .../GuildManagementWindowCtrl.as::onCreateRoomLink()
    private onCreateRoomLink = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._groupsManager?.navigator?.startRoomCreation();
    };

    // AS3: .../GuildManagementWindowCtrl.as::onNextStep()
    private onNextStep = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(!this.validateView()) return;

        this._currentStep = GuildManagementWindowCtrl.limitStep(this._currentStep + 1);
        this.refresh();
    };

    // AS3: .../GuildManagementWindowCtrl.as::onPreviousStep()
    private onPreviousStep = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(!this.validateView()) return;

        this._currentStep = GuildManagementWindowCtrl.limitStep(this._currentStep - 1);
        this.refresh();
    };

    // AS3: .../GuildManagementWindowCtrl.as::onBuy()
    private onBuy = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(!this._data?.exists) this._groupsManager?.trackGoogle('groupPurchase', 'buyGroup');

        this.sendCreateGuildMessage();
    };

    // AS3: .../GuildManagementWindowCtrl.as::onGetVip()
    private onGetVip = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(!this._data?.exists) this._groupsManager?.trackGoogle('groupPurchase', 'buyVip');

        this._groupsManager?.openVipPurchase('GuildManagementWindowCtrl');
    };

    /**
     * At most one alert at a time — validation runs on every step change and on window
     * deactivation, so without the latch a stuck field would stack dialogs.
     *
     * AS3: .../GuildManagementWindowCtrl.as::showAlert()
     */
    private showAlert(title: string, message: string): void
    {
        if(this._alertOpen) return;

        this._alertOpen = true;
        this._groupsManager?.windowManager?.alert(title, message, 0, this.onAlertClose);
    }

    // AS3: .../GuildManagementWindowCtrl.as::onAlertClose()
    private onAlertClose = (dialog: IDisposable, _event: WindowEvent): void =>
    {
        dialog.dispose();
        this._alertOpen = false;
    };

    /**
     * True when the current pane may be left. Identity checks the name and description;
     * badge just tells the editor the view is changing; colours insists both grids have a
     * selection. Confirm and settings have nothing to refuse.
     *
     * AS3: .../GuildManagementWindowCtrl.as::validateView()
     */
    private validateView(): boolean
    {
        const data = this._data;

        if(!data) return true;

        switch(this._currentStep - 1)
        {
            case 0:
            {
                const name = (this.child('name_txt') as unknown as ITextWindow | null)?.text ?? null;

                if(!data.exists)
                {
                    const baseRoom = this.resolveBaseRoom();

                    if(name === null || name.length === 0 || baseRoom === null || baseRoom.roomId === 0)
                    {
                        this.showAlert('${group.edit.error.title}', '${group.edit.error.no.name.or.room.selected}');

                        return false;
                    }

                    // Warn once per room: a base room that already has rights holders will
                    // hand them group admin, which is rarely what the player expects.
                    if(baseRoom.hasControllers && this._controllersWarningRoomId !== baseRoom.roomId)
                    {
                        this._controllersWarningRoomId = baseRoom.roomId;
                        this.showAlert('${group.edit.error.warning}', '${group.edit.error.controllers}');

                        return false;
                    }
                }

                if((name?.length ?? 0) > GuildManagementWindowCtrl.MAX_NAME_LENGTH)
                {
                    this.showAlert('${group.edit.error.title}', '${group.edit.error.name.length}');

                    return false;
                }

                const description = (this.child('desc_txt') as unknown as ITextWindow | null)?.text ?? null;

                if(description !== null && description.length >= GuildManagementWindowCtrl.MAX_DESCRIPTION_LENGTH)
                {
                    this.showAlert('${group.edit.error.title}', '${group.edit.error.desc.length}');

                    return false;
                }

                return true;
            }
            case 1:
                this._badgeEditorCtrl?.onViewChange();

                return true;
            case 2:
                if(this._primaryColorGrid?.getSelectedColorData() === null || this._secondaryColorGrid?.getSelectedColorData() === null)
                {
                    this.showAlert('${group.edit.error.title}', '${group.edit.error.no.color.selected}');

                    return false;
                }

                return true;
            default:
                return true;
        }
    }

    /**
     * Persists the pane being left. Only an owner sends anything, but the visual-settings
     * event fires either way so the rest of the UI redraws the badge it just saw change.
     *
     * Nothing is saved while creating: the whole group is sent in one go by
     * `sendCreateGuildMessage()`, and `saveView()` is only ever reached from the edit
     * window's tabs, close button and deactivation.
     *
     * AS3: .../GuildManagementWindowCtrl.as::saveView()
     */
    private saveView(): void
    {
        const data = this._data;
        const groupsManager = this._groupsManager;

        if(!data || !groupsManager) return;

        switch(this._currentStep - 1)
        {
            case 0:
            {
                const name = (this.child('name_txt') as unknown as ITextWindow | null)?.text ?? '';
                const description = (this.child('desc_txt') as unknown as ITextWindow | null)?.text ?? '';

                if(data.isOwner) groupsManager.send(new UpdateGuildIdentityMessageComposer(data.groupId, name, description));

                groupsManager.events.emit(
                    GuildSettingsChangedInManageEvent.GUILD_VISUAL_SETTINGS_CHANGED,
                    new GuildSettingsChangedInManageEvent(data.groupId)
                );

                return;
            }
            case 1:
            {
                const badgeSettings = this._badgeEditorCtrl?.isIntialized
                    ? this._badgeEditorCtrl.getBadgeSettings()
                    : GuildManagementWindowCtrl.flattenBadgeSettings(data);

                if(data.isOwner) groupsManager.send(new UpdateGuildBadgeMessageComposer(data.groupId, badgeSettings));

                groupsManager.events.emit(
                    GuildSettingsChangedInManageEvent.GUILD_VISUAL_SETTINGS_CHANGED,
                    new GuildSettingsChangedInManageEvent(data.groupId)
                );

                break;
            }
            case 2:
            {
                const primaryColorId = this._primaryColorGrid?.isInitialized ? this._primaryColorGrid.getSelectedColorId() : data.primaryColorId;
                const secondaryColorId = this._secondaryColorGrid?.isInitialized ? this._secondaryColorGrid.getSelectedColorId() : data.secondaryColorId;

                if(data.isOwner) groupsManager.send(new UpdateGuildColorsMessageComposer(data.groupId, primaryColorId, secondaryColorId));

                groupsManager.events.emit(
                    GuildSettingsChangedInManageEvent.GUILD_VISUAL_SETTINGS_CHANGED,
                    new GuildSettingsChangedInManageEvent(data.groupId)
                );

                break;
            }
            case 4:
                if(data.isOwner) groupsManager.send(new UpdateGuildSettingsMessageComposer(data.groupId, this._settingsCtrl.guildType, this._settingsCtrl.rightsLevel));

                this._settingsCtrl.resetModified();
                break;
        }
    }

    /**
     * The server's badge, flattened to the same (part, colour, position) run the badge
     * editor produces — used when the editor never opened, so the group keeps whatever
     * default the server sent.
     *
     * AS3 passes `data.badgeSettings` straight through because AS3's array already *is*
     * that flat run on both sides; this port keeps the parsed triplets, so the flattening
     * that AS3 gets for free happens here.
     *
     * AS3: .../GuildManagementWindowCtrl.as::saveView() / sendCreateGuildMessage()
     */
    private static flattenBadgeSettings(data: IGuildManagementData): number[]
    {
        const flat: number[] = [];

        for(const setting of data.badgeSettings)
        {
            flat.push(setting.partId);
            flat.push(setting.colorId);
            flat.push(setting.position);
        }

        return flat;
    }

    // AS3: .../GuildManagementWindowCtrl.as::sendCreateGuildMessage()
    private sendCreateGuildMessage(): void
    {
        const data = this._data;
        const groupsManager = this._groupsManager;

        if(!data || !groupsManager) return;

        const name = (this.child('name_txt') as unknown as ITextWindow | null)?.text ?? '';
        const description = (this.child('desc_txt') as unknown as ITextWindow | null)?.text ?? '';
        const baseRoom = this.resolveBaseRoom();
        const badgeSettings = this._badgeEditorCtrl?.isIntialized
            ? this._badgeEditorCtrl.getBadgeSettings()
            : GuildManagementWindowCtrl.flattenBadgeSettings(data);
        const primaryColorId = this._primaryColorGrid?.isInitialized ? this._primaryColorGrid.getSelectedColorId() : data.primaryColorId;
        const secondaryColorId = this._secondaryColorGrid?.isInitialized ? this._secondaryColorGrid.getSelectedColorId() : data.secondaryColorId;

        this._controllersWarningRoomId = 0;

        if(!baseRoom)
        {
            // AS3 dereferences the base room here unguarded; validateView() has already
            // refused to leave step 1 without one, so this is only reachable if the
            // layout lost its drop-menu - log rather than send a group with no base.
            log.warn('sendCreateGuildMessage: no base room selected, refusing to send CreateGuild');

            return;
        }

        groupsManager.send(new CreateGuildMessageComposer(name, description, baseRoom.roomId, primaryColorId, secondaryColorId, badgeSettings));
    }

    // AS3: .../GuildManagementWindowCtrl.as::hasPreviousStep()
    private hasPreviousStep(): boolean
    {
        return this._currentStep !== GuildManagementWindowCtrl.limitStep(this._currentStep - 1);
    }

    // AS3: .../GuildManagementWindowCtrl.as::hasNextStep()
    private hasNextStep(): boolean
    {
        return this._currentStep !== GuildManagementWindowCtrl.limitStep(this._currentStep + 1);
    }

    // AS3: .../GuildManagementWindowCtrl.as::limitStep()
    private static limitStep(step: number): number
    {
        return Math.max(GuildManagementWindowCtrl.VIEW_IDENTITY, Math.min(step, GuildManagementWindowCtrl.LAST_CREATE_STEP));
    }

    // AS3: .../GuildManagementWindowCtrl.as::getBaseDropMenu()
    private getBaseDropMenu(): IDropMenuWindow | null
    {
        return this.child('base_dropmenu') as IDropMenuWindow | null;
    }

    /**
     * Fills the base-room menu, headed by a "select a room" placeholder — which is why
     * every index into `ownedRooms` is one lower than the menu's own selection.
     *
     * AS3: .../GuildManagementWindowCtrl.as::prepareRoomSelection()
     */
    private prepareRoomSelection(): void
    {
        const dropMenu = this.getBaseDropMenu();
        const data = this._data;

        if(!dropMenu || !data) return;

        const items: string[] = [];
        let selection: number = 0;

        items.push(this._groupsManager?.localization?.getLocalization('group.edit.base.select.room', 'group.edit.base.select.room') ?? '');

        for(let i = 0; i < data.ownedRooms.length; i++)
        {
            const room = data.ownedRooms[i];

            items.push(room.roomName);

            if(room.roomId === data.baseRoomId) selection = i + 1;
        }

        dropMenu.populate(items);

        if(items.length > 0) dropMenu.selection = selection;
    }

    // AS3: .../GuildManagementWindowCtrl.as::resolveBaseRoom()
    private resolveBaseRoom(): GuildOwnedRoomData | null
    {
        const dropMenu = this.getBaseDropMenu();
        const data = this._data;

        if(!dropMenu || !data) return null;

        const index = dropMenu.selection - 1;

        if(index >= 0 && index < data.ownedRooms.length && data.ownedRooms[index] !== null) return data.ownedRooms[index];

        return null;
    }

    // AS3: .../GuildManagementWindowCtrl.as::onCloseWindow()
    private onCloseWindow = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(this._data?.exists)
        {
            if(!this.validateView()) return;

            this.saveView();
        }

        this.close();
    };

    // AS3: .../GuildManagementWindowCtrl.as::close()
    close(): void
    {
        if(this._window !== null) this._window.visible = false;
    }

    // AS3: .../GuildManagementWindowCtrl.as::onPrimaryColorSelected()
    onPrimaryColorSelected = (colorGrid: ColorGridCtrl): void =>
    {
        const editorData = this._groupsManager?.guildEditorData;
        const swatch = this.child('guild_color_primary_color_top');

        if(swatch !== null && editorData && colorGrid.selectedColorIndex >= 0 && colorGrid.selectedColorIndex < editorData.guildPrimaryColors.length)
        {
            swatch.color = editorData.guildPrimaryColors[colorGrid.selectedColorIndex].color;
        }
    };

    // AS3: .../GuildManagementWindowCtrl.as::onSecondaryColorSelected()
    onSecondaryColorSelected = (colorGrid: ColorGridCtrl): void =>
    {
        const editorData = this._groupsManager?.guildEditorData;
        const swatch = this.child('guild_color_secondary_color_top');

        if(swatch !== null && editorData && colorGrid.selectedColorIndex >= 0 && colorGrid.selectedColorIndex < editorData.guildSecondaryColors.length)
        {
            swatch.color = editorData.guildSecondaryColors[colorGrid.selectedColorIndex].color;
        }
    };

    /**
     * The little badge next to the group name on the identity pane — hidden while
     * creating, since there is no badge code to render until the group exists.
     *
     * AS3: .../GuildManagementWindowCtrl.as::refreshBadgeImage()
     */
    private refreshBadgeImage(): void
    {
        const data = this._data;
        const badgeSlot = this.child('step_1_badge');
        const logoWindow = this.child('group_logo') as IWidgetWindow | null;
        const badgeWidget = (logoWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(!data || badgeWidget === null || badgeSlot === null) return;

        if(!data.exists)
        {
            badgeSlot.visible = false;
            badgeSlot.invalidate();

            return;
        }

        badgeWidget.badgeId = data.badgeCode;
        badgeWidget.groupId = data.groupId;
        badgeSlot.visible = true;
        badgeSlot.invalidate();
    }

    /**
     * Clicking away from an open edit window saves it, so a change is never lost by
     * simply not closing the window properly.
     *
     * AS3: .../GuildManagementWindowCtrl.as::onWindowUnActivated()
     */
    private onWindowUnActivated = (_event: WindowEvent): void =>
    {
        if(this._data !== null && this._data.exists && this._window !== null && this._window.visible) this.saveView();
    };

    // AS3: .../GuildManagementWindowCtrl.as::dispose()
    dispose(): void
    {
        this._groupsManager = null;

        if(this._window)
        {
            this._window.removeEventListener('WE_DEACTIVATED', this.onWindowUnActivated);
            this._window.dispose();
            this._window = null;
        }

        if(this._badgeEditorCtrl)
        {
            this._badgeEditorCtrl.dispose();
            this._badgeEditorCtrl = null;
        }

        if(this._primaryColorGrid)
        {
            this._primaryColorGrid.dispose();
            this._primaryColorGrid = null;
        }

        if(this._secondaryColorGrid)
        {
            this._secondaryColorGrid.dispose();
            this._secondaryColorGrid = null;
        }
    }
}
