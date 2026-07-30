/**
 * PetCommandTool
 *
 * The pet-training window: the pet's portrait and name, a grid of its trained commands, and (for
 * horses, when pet enhancements are on) a skill-progress bar.
 *
 * Clicking a command does not send a packet of its own. AS3 posts a
 * RoomWidgetPetCommandMessage("RWPCM_PET_COMMAND", petId, "<pet name> <localised command>") and the
 * infostand handler forwards that string to roomSession.sendChatMessage() — the pet obeys because
 * the room heard its owner say its name. That is why there is no IssuePetCommand composer anywhere
 * in the source.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/PetCommandTool.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {RoomWidgetPetCommandMessage} from '../messages/RoomWidgetPetCommandMessage';
import {RoomWidgetUserActionMessage} from '../messages/RoomWidgetUserActionMessage';
import type {CommandConfiguration} from './CommandConfiguration';
import type {InfoStandWidget} from './InfoStandWidget';

// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/PetCommandTool.as::STATUS_BAR_WIDTH
const STATUS_BAR_WIDTH = 162;
const STATUS_BAR_HEIGHT = 16;
const STATUS_BAR_HIGHLIGHT_HEIGHT = 4;
const STATUS_BAR_BORDER_COLOR = 14342874;
const STATUS_BAR_BG_COLOR = 3815994;

// AS3: .../PetCommandTool.as::STATUS_BAR_SKILL_HIGHLIGHT_COLOR / STATUS_BAR_SKILL_CONTENT_COLOR
const STATUS_BAR_SKILL_HIGHLIGHT_COLOR = 10513106;
const STATUS_BAR_SKILL_CONTENT_COLOR = 8734654;

// AS3: .../PetCommandTool.as::STATE_SKILL
const STATE_SKILL = 'skill';

// AS3: .../PetCommandTool.as::PET_TYPE_HORSE
const PET_TYPE_HORSE = 15;

// AS3: .../PetCommandTool.as::DEFAULT_LOCATION
const DEFAULT_LOCATION = {x: 100, y: 70};

// AS3: .../PetCommandTool.as::BUTTONS_DISABLED_MS
const BUTTONS_DISABLED_MS = 1100;

// AS3 lays the command buttons out in two columns; the second column starts at x = 86 and each pair
// advances one row. Both numbers are AS3's own literals in updateCommandButtonsViewState().
const COMMAND_BUTTON_COLUMN_X = 86;
const COMMAND_BUTTON_ROW_HEIGHT = 25;

// AS3 sizes the window as the command grid's height plus a fixed chrome allowance, larger when pet
// enhancements add the skill bar.
const WINDOW_CHROME_HEIGHT_WITH_ENHANCEMENTS = 180;
const WINDOW_CHROME_HEIGHT = 160;

// AS3 keeps its colours as uint literals for BitmapData.fillRect(); a canvas needs the CSS form.
function toCssColor(value: number): string
{
    return `#${value.toString(16).padStart(6, '0')}`;
}

export class PetCommandTool
{
    private _widget: InfoStandWidget | null;

    private _window: IWindow | null = null;

    // The command button removed from the layout at build time and cloned per command.
    private _buttonTemplate: IWindow | null = null;

    private _commandConfigurations: Map<number, CommandConfiguration> = new Map();

    private _petId: number = 0;

    private _currentPetName: string = '';

    // AS3 uses a flash.utils.Timer that fires once BUTTONS_DISABLED_MS after a command is issued and
    // then stops itself; a self-clearing timeout is the same thing without the tick machinery.
    private _buttonDisableTimeout: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../PetCommandTool.as::PetCommandTool()
    constructor(widget: InfoStandWidget)
    {
        this._widget = widget;
    }

    // AS3: .../PetCommandTool.as::hideChildren()
    public static hideChildren(container: IWindowContainer): void
    {
        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child) child.visible = false;
        }
    }

    // AS3: .../PetCommandTool.as::getLowestPoint()
    public static getLowestPoint(container: IWindowContainer): number
    {
        let lowest = 0;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child?.visible) lowest = Math.max(lowest, child.y + child.height);
        }

        return lowest;
    }

    // AS3: .../PetCommandTool.as::createPercentageBar()
    private static createPercentageBar(value: number, max: number, contentColor: number, highlightColor: number): ImageBitmap | null
    {
        max = Math.max(max, 1);
        value = Math.max(value, 0);

        if(value > max) value = max;

        const ratio = value / max;
        const canvas = new OffscreenCanvas(STATUS_BAR_WIDTH, STATUS_BAR_HEIGHT);
        const context = canvas.getContext('2d');

        if(!context) return null;

        context.fillStyle = toCssColor(STATUS_BAR_BORDER_COLOR);
        context.fillRect(0, 0, STATUS_BAR_WIDTH, STATUS_BAR_HEIGHT);

        context.fillStyle = toCssColor(STATUS_BAR_BG_COLOR);
        context.fillRect(1, 1, STATUS_BAR_WIDTH - 2, STATUS_BAR_HEIGHT - 2);

        context.fillStyle = toCssColor(contentColor);
        context.fillRect(
            1, 1 + STATUS_BAR_HIGHLIGHT_HEIGHT,
            ratio * (STATUS_BAR_WIDTH - 2), STATUS_BAR_HEIGHT - 2 - STATUS_BAR_HIGHLIGHT_HEIGHT
        );

        context.fillStyle = toCssColor(highlightColor);
        context.fillRect(1, 1, ratio * (STATUS_BAR_WIDTH - 2), STATUS_BAR_HIGHLIGHT_HEIGHT);

        return canvas.transferToImageBitmap();
    }

    // AS3: .../PetCommandTool.as::getPetId()
    public getPetId(): number
    {
        return this._petId;
    }

    // AS3: .../PetCommandTool.as::isVisible()
    public isVisible(): boolean
    {
        if(this._window === null) return false;

        return this._window.visible;
    }

    // AS3: .../PetCommandTool.as::showCommandToolForPet()
    // The skill bar is refreshed on every call, but the rest of the window is only rebuilt when the
    // pet actually changed — AS3 returns early otherwise, which is what keeps a re-selected pet from
    // re-requesting its commands.
    public showCommandToolForPet(
        petId: number,
        petName: string,
        image: ImageBitmap | null,
        petType: number,
        levelInSkill: number,
        experienceRatio: number,
        skillRange: number,
        _skillTresholds: number[]
    ): void
    {
        if(this._window === null) return;

        this.updateStateElement(
            STATE_SKILL,
            (levelInSkill + experienceRatio) * 100,
            skillRange * 100,
            STATUS_BAR_SKILL_CONTENT_COLOR,
            STATUS_BAR_SKILL_HIGHLIGHT_COLOR,
            petType
        );

        if(this._petId === petId) return;

        this._petId = petId;
        this._currentPetName = petName;

        const nameText = (this._window as IWindowContainer).findChildByName('pet_name') as ITextWindow | null;

        if(nameText !== null) nameText.text = petName;

        this.updatePetImage(image);

        const configuration = this._commandConfigurations.get(petId);

        if(configuration === undefined)
        {
            this.disableAllButtons();
            this.requestEnabledCommands(this._petId);
        }
        else
        {
            this.updateCommandButtonsViewState(configuration);
        }
    }

    // AS3: .../PetCommandTool.as::updatePetImage()
    public updatePetImage(image: ImageBitmap | null): void
    {
        if(this._window === null) return;

        const target = (this._window as IWindowContainer).findChildByName('avatar_image') as IBitmapWrapperWindow | null;

        if(target === null) return;

        if(image !== null)
        {
            // AS3 copyPixels() the pet into a transparent bitmap the size of the slot, centred — it
            // does not scale. A canvas drawImage at the same offset is the equivalent.
            const canvas = new OffscreenCanvas(target.width, target.height);
            const context = canvas.getContext('2d');

            if(!context) return;

            context.drawImage(
                image,
                Math.round((target.width - image.width) / 2),
                Math.round((target.height - image.height) / 2)
            );

            target.bitmap = canvas.transferToImageBitmap();
        }
        else
        {
            target.bitmap = null;
        }

        target.invalidate();
    }

    // AS3: .../PetCommandTool.as::setEnabledCommands()
    public setEnabledCommands(petId: number, configuration: CommandConfiguration): void
    {
        this._commandConfigurations.delete(petId);
        this._commandConfigurations.set(petId, configuration);

        if(petId !== this._petId) return;

        this.updateCommandButtonsViewState(configuration);
        this.stopButtonDisableTimer();
    }

    // AS3: .../PetCommandTool.as::showWindow()
    public showWindow(visible: boolean): void
    {
        if(visible)
        {
            if(this._window === null) this.createCommandWindow();

            if(this._window !== null) this._window.visible = true;
        }
        else if(this._window !== null)
        {
            this._window.visible = false;
        }

        this.stopButtonDisableTimer();
    }

    // AS3: .../PetCommandTool.as::dispose()
    public dispose(): void
    {
        this.stopButtonDisableTimer();

        this._widget = null;

        this._window?.dispose();
        this._window = null;

        this._buttonTemplate = null;
        this._commandConfigurations.clear();
    }

    // AS3: .../PetCommandTool.as::onButtonDisableTimeout()
    private onButtonDisableTimeout = (): void =>
    {
        const configuration = this._commandConfigurations.get(this._petId);

        // AS3 passes the lookup straight through even when it is null, and
        // updateCommandButtonsViewState() then dereferences it; guarding here instead keeps the
        // buttons disabled until the real command list lands, which is the same visible outcome
        // without the throw.
        if(configuration !== undefined) this.updateCommandButtonsViewState(configuration);

        this.stopButtonDisableTimer();
    };

    // AS3: .../PetCommandTool.as::requestEnabledCommands()
    private requestEnabledCommands(petId: number): void
    {
        this._widget?.messageListener?.processWidgetMessage(
            new RoomWidgetPetCommandMessage(RoomWidgetPetCommandMessage.REQUEST_COMMANDS, petId)
        );
    }

    // AS3: .../PetCommandTool.as::createCommandWindow()
    // AS3 fetches the "pet_commands" XmlAsset and calls windowManager.buildFromXML(); this port's
    // buildWidgetLayout() does both steps for a registered layout name.
    private createCommandWindow(): void
    {
        const widget = this._widget;

        if(!widget) return;

        this._window = widget.windowManager.buildWidgetLayout('pet_commands');

        if(this._window === null)
        {
            throw new Error('Failed to construct command window from XML!');
        }

        const container = this._window as IWindowContainer;
        const commandsContainer = container.findChildByName('commands_container') as IWindowContainer | null;

        // AS3 takes the single button the layout ships with out of the container and keeps it as the
        // clone source, so the container starts empty.
        this._buttonTemplate = commandsContainer?.removeChildAt(0) ?? null;

        container.findChildByName('header_button_close')?.addEventListener(
            WindowMouseEvent.CLICK, this.onCommandWindowClose
        );
        container.findChildByName('description_link')?.addEventListener(
            WindowMouseEvent.CLICK, this.onCommandWindowDescriptionLink
        );
        container.findChildByName('avatar_image')?.addEventListener(
            WindowMouseEvent.CLICK, this.onCommandWindowAvatarImageClick
        );

        // AS3 also copies the "icon_pet_skill" BitmapDataAsset into status_skill_icon here. The
        // layout already binds that icon through its own `bitmap_asset_name` variable in this port,
        // so there is nothing to assign.

        this._window.position = {x: DEFAULT_LOCATION.x, y: DEFAULT_LOCATION.y};
    }

    // AS3: .../PetCommandTool.as::updateCommandButtonsViewState()
    private updateCommandButtonsViewState(configuration: CommandConfiguration): void
    {
        const widget = this._widget;

        if(this._window === null || !widget) return;

        const commandsContainer = (this._window as IWindowContainer).findChildByName('commands_container') as IWindowContainer | null;

        if(commandsContainer === null) return;

        PetCommandTool.hideChildren(commandsContainer);

        const commandIds = configuration.allCommandIds;
        let y = 0;

        for(let i = 0; i < commandIds.length; i++)
        {
            let button = commandsContainer.getChildAt(i);

            if(button === null)
            {
                button = this._buttonTemplate?.clone() ?? null;

                if(button === null) break;

                button.addEventListener(WindowMouseEvent.CLICK, this.onTrainButtonMouseClick);
                commandsContainer.addChild(button);
            }

            const commandId = commandIds[i];

            button.visible = true;
            button.id = commandId;
            button.caption = widget.localizations?.getLocalization(`pet.command.${commandId}`) ?? '';

            if(configuration.isEnabled(commandId))
            {
                button.enable();
            }
            else
            {
                button.disable();
            }

            button.y = y;

            // AS3 advances the row on odd indices, so the pair sits side by side and the next pair
            // drops a row.
            if(i % 2 === 1)
            {
                y += COMMAND_BUTTON_ROW_HEIGHT;
                button.x = COMMAND_BUTTON_COLUMN_X;
            }
            else
            {
                button.x = 0;
            }
        }

        const enhancementsEnabled = widget.config?.getBoolean('pet.enhancements.enabled') ?? false;
        const chromeHeight = enhancementsEnabled ? WINDOW_CHROME_HEIGHT_WITH_ENHANCEMENTS : WINDOW_CHROME_HEIGHT;

        commandsContainer.height = PetCommandTool.getLowestPoint(commandsContainer);
        this._window.height = commandsContainer.height + chromeHeight;

        this.stopButtonDisableTimer();
    }

    // AS3: .../PetCommandTool.as::disableAllButtons()
    private disableAllButtons(): void
    {
        if(this._window === null) return;

        const commandsContainer = (this._window as IWindowContainer).findChildByName('commands_container') as IWindowContainer | null;

        if(commandsContainer === null) return;

        for(let i = 0; i < commandsContainer.numChildren; i++)
        {
            commandsContainer.getChildAt(i)?.disable();
        }
    }

    // AS3: .../PetCommandTool.as::onCommandWindowClose()
    private onCommandWindowClose = (): void =>
    {
        if(this._window !== null) this._window.visible = false;
    };

    // AS3: .../PetCommandTool.as::onCommandWindowDescriptionLink()
    private onCommandWindowDescriptionLink = (): void =>
    {
        this._widget?.windowManager.openHelpPage('help/pets/training');
    };

    // AS3: .../PetCommandTool.as::onCommandWindowAvatarImageClick()
    private onCommandWindowAvatarImageClick = (): void =>
    {
        this._widget?.messageListener?.processWidgetMessage(
            new RoomWidgetUserActionMessage(RoomWidgetUserActionMessage.REQUEST_PET_UPDATE, this._petId)
        );
    };

    // AS3: .../PetCommandTool.as::onTrainButtonMouseClick()
    // The command is issued as chat: "<pet name> <localised command>". Every button is then disabled
    // until the server's fresh command list arrives, or BUTTONS_DISABLED_MS passes.
    private onTrainButtonMouseClick = (event: WindowMouseEvent): void =>
    {
        const target = event.target as IWindow | null;

        if(!target) return;

        const commandName = this._widget?.localizations?.getLocalization(`pet.command.${target.id}`) ?? '';

        this._widget?.messageListener?.processWidgetMessage(
            new RoomWidgetPetCommandMessage(
                RoomWidgetPetCommandMessage.PET_COMMAND,
                this._petId,
                `${this._currentPetName} ${commandName}`
            )
        );

        this.disableAllButtons();
        this.startButtonDisableTimer();
    };

    // AS3: .../PetCommandTool.as::updateStateElement()
    // The skill panel only exists for horses, and only when pet enhancements are configured on.
    private updateStateElement(
        state: string,
        value: number,
        max: number,
        contentColor: number,
        highlightColor: number,
        petType: number
    ): void
    {
        const widget = this._widget;

        if(this._window === null || !widget) return;

        const container = (this._window as IWindowContainer).findChildByName(`status_${state}_container`) as IWindowContainer | null;

        if(container === null) return;

        container.visible = (widget.config?.getBoolean('pet.enhancements.enabled') ?? false) && petType === PET_TYPE_HORSE;

        const valueText = container.findChildByName(`status_${state}_value_text`) as ITextWindow | null;

        if(valueText !== null) valueText.text = `${value}/${max}`;

        const stateText = container.findChildByName(`status_${state}_text`) as ITextWindow | null;

        if(stateText !== null) stateText.caption = `\${infostand.pet.text.skill.next.${petType}}`;

        const bitmap = container.findChildByName(`status_${state}_bitmap`) as IBitmapWrapperWindow | null;

        if(bitmap !== null)
        {
            const bar = PetCommandTool.createPercentageBar(value, max, contentColor, highlightColor);

            if(bar !== null)
            {
                bitmap.bitmap = bar;
                bitmap.width = bar.width;
                bitmap.height = bar.height;
                bitmap.invalidate();
            }
        }
    }

    // AS3 starts/stops a Timer; these two wrap the timeout equivalent so the call sites read the
    // same as the source.
    private startButtonDisableTimer(): void
    {
        this.stopButtonDisableTimer();

        this._buttonDisableTimeout = setTimeout(this.onButtonDisableTimeout, BUTTONS_DISABLED_MS);
    }

    private stopButtonDisableTimer(): void
    {
        if(this._buttonDisableTimeout === null) return;

        clearTimeout(this._buttonDisableTimeout);
        this._buttonDisableTimeout = null;
    }
}
