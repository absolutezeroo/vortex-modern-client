import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {CommandBotComposer} from '@habbo/communication/messages/outgoing/room/bot/CommandBotComposer';

import type {AvatarInfoWidget} from '../AvatarInfoWidget';
import {BotSkillConfigurationViewBase} from './BotSkillConfigurationViewBase';
import {BotSkillEnum} from './BotSkillEnum';

/**
 * BotChangeNameConfiguration — the "rename this bot" editor, opened from the bot's context menu.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/botskills/BotChangeNameConfiguration.as
 */
export class BotChangeNameConfiguration extends BotSkillConfigurationViewBase
{
    // AS3: .../BotChangeNameConfiguration.as::_newName
    private _newName: string = '';

    // AS3: .../BotChangeNameConfiguration.as::BotChangeNameConfiguration()
    constructor(widget: AvatarInfoWidget)
    {
        super(widget);
    }

    // AS3: .../BotChangeNameConfiguration.as::get windowAssetName()
    protected override get windowAssetName(): string
    {
        return 'name_configuration_xml';
    }

    // AS3: .../BotChangeNameConfiguration.as::get skillType()
    protected override get skillType(): number
    {
        return BotSkillEnum.CHANGE_NAME;
    }

    // AS3: .../BotChangeNameConfiguration.as::open()
    public override open(botId: number, position: {x: number; y: number} | null = null): void
    {
        super.open(botId, position);

        if(this._window !== null) this._window.procedure = this.procedure;
    }

    // AS3: .../BotChangeNameConfiguration.as::parseConfiguration()
    public override parseConfiguration(data: string): void
    {
        this.setNameInput(data);
    }

    // AS3: .../BotChangeNameConfiguration.as::set nameInput()
    private setNameInput(value: string): void
    {
        this._newName = value;

        const input = this._window?.findChildByName('name_input') as ITextWindow | null;

        if(input === null || input === undefined) return;

        input.text = this._newName;
        (input as unknown as IWindow).activate();
    }

    // AS3: .../BotChangeNameConfiguration.as::deactivateInputs()
    protected override deactivateInputs(): void
    {
        this._window?.findChildByName('name_input')?.deactivate();
    }

    // AS3: .../BotChangeNameConfiguration.as::procedure()
    private procedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            switch(window.name)
            {
                case 'save_button':
                    this._widget?.handler?.container?.connection?.send(
                        new CommandBotComposer(this._botId, BotSkillEnum.CHANGE_NAME, this._newName)
                    );
                    this.close();
                    break;
                case 'cancel_button':
                    this.close();
                    break;
            }
        }

        // AS3 re-reads the field on every key-up rather than on save, so a click straight onto the
        // save button (which blurs the input first) still sends what was typed.
        if(event.type === 'WKE_KEY_UP')
        {
            const input = this._window?.findChildByName('name_input') as ITextWindow | null;

            if(input !== null && input !== undefined) this._newName = input.text;
        }
    };

    // AS3: .../BotChangeNameConfiguration.as::dispose()
    public override dispose(): void
    {
        this.close();
        super.dispose();
    }
}
