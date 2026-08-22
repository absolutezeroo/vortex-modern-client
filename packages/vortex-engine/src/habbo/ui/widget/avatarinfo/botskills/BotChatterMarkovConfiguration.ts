import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {CommandBotComposer} from '@habbo/communication/messages/outgoing/room/bot/CommandBotComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

import type {AvatarInfoWidget} from '../AvatarInfoWidget';
import {BotSkillConfigurationViewBase} from './BotSkillConfigurationViewBase';
import {BotSkillEnum} from './BotSkillEnum';

/**
 * BotChatterMarkovConfiguration — the "what does this bot say" editor: the chat lines, whether it
 * talks on its own, how often, and whether the server may recombine the lines (markov).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/botskills/BotChatterMarkovConfiguration.as
 */
export class BotChatterMarkovConfiguration extends BotSkillConfigurationViewBase
{
    // AS3: BotChatterMarkovConfiguration.as::botCommandString() — the field separator the bot chatter
    // configuration is packed with. The single ";" form is the older one, still accepted on read.
    private static readonly FIELD_SEPARATOR = ';#;';

    // AS3: .../BotChatterMarkovConfiguration.as::BotChatterMarkovConfiguration()
    constructor(widget: AvatarInfoWidget)
    {
        super(widget);
    }

    // AS3: .../BotChatterMarkovConfiguration.as::sanitizeBotChatString()
    // The separator cannot survive inside a chat line, so it is flattened to a space on the way out.
    private static sanitizeBotChatString(value: string): string
    {
        return value.split(BotChatterMarkovConfiguration.FIELD_SEPARATOR).join(' ');
    }

    // AS3: .../BotChatterMarkovConfiguration.as::get windowAssetName()
    protected override get windowAssetName(): string
    {
        return 'chatter_configuration_xml';
    }

    // AS3: .../BotChatterMarkovConfiguration.as::get skillType()
    protected override get skillType(): number
    {
        return BotSkillEnum.CHATTER_MARKOV;
    }

    // AS3: .../BotChatterMarkovConfiguration.as::open()
    public override open(botId: number, position: {x: number; y: number} | null = null): void
    {
        super.open(botId, position);

        if(this._window !== null) this._window.procedure = this.procedure;
    }

    /**
     * AS3: .../BotChatterMarkovConfiguration.as::parseConfiguration()
     *
     * Two accepted shapes, told apart by which separator the payload uses: the three-field form has
     * no markov flag (older servers), the four-field one does. Anything else is ignored — AS3 does
     * the same rather than half-filling the editor.
     */
    public override parseConfiguration(data: string): void
    {
        const fields = data.indexOf(BotChatterMarkovConfiguration.FIELD_SEPARATOR) === -1 ? data.split(';') : data.split(BotChatterMarkovConfiguration.FIELD_SEPARATOR);

        if(this._window === null) return;

        if(fields.length === 3)
        {
            this.setText(fields[0]);
            this.setAutoChat(BotChatterMarkovConfiguration.parseFlag(fields[1]));
            this.setChatDelay(parseInt(fields[2], 10));
            this.setMarkovEnabled(false);
        }
        else if(fields.length === 4)
        {
            this.setText(fields[0]);
            this.setAutoChat(BotChatterMarkovConfiguration.parseFlag(fields[1]));
            this.setChatDelay(parseInt(fields[2], 10));
            this.setMarkovEnabled(BotChatterMarkovConfiguration.parseFlag(fields[3]));
        }
    }

    // AS3 writes this test out at each of its three call sites: `String(x).toLowerCase() == "true"
    // || x == "1"` — a server may send either form.
    // AS3: .../BotChatterMarkovConfiguration.as::parseConfiguration() (the inline flag test)
    private static parseFlag(value: string): boolean
    {
        return value.toLowerCase() === 'true' || value === '1';
    }

    // AS3: .../BotChatterMarkovConfiguration.as::deactivateInputs()
    protected override deactivateInputs(): void
    {
        this._window?.findChildByName('chat_text')?.deactivate();
        this._window?.findChildByName('auto_chat_checkbox')?.deactivate();
        this._window?.findChildByName('markov_checkbox')?.deactivate();
        this._window?.findChildByName('chat_delay_text')?.deactivate();
    }

    // AS3: .../BotChatterMarkovConfiguration.as::set text()
    private setText(value: string): void
    {
        const field = this._window?.findChildByName('chat_text') as ITextWindow | null;

        if(field === null || field === undefined) return;

        field.text = value;
        (field as unknown as IWindow).activate();
    }

    // AS3: .../BotChatterMarkovConfiguration.as::get text()
    private get text(): string
    {
        return (this._window?.findChildByName('chat_text') as ITextWindow | null)?.text ?? '';
    }

    // AS3: .../BotChatterMarkovConfiguration.as::set autoChat()
    private setAutoChat(value: boolean): void
    {
        const checkbox = this._window?.findChildByName('auto_chat_checkbox') as unknown as ISelectableWindow | null;

        if(checkbox === null || checkbox === undefined) return;

        checkbox.isSelected = value;
        (checkbox as unknown as IWindow).activate();
    }

    // AS3: .../BotChatterMarkovConfiguration.as::get autoChat()
    private get autoChat(): boolean
    {
        return (this._window?.findChildByName('auto_chat_checkbox') as unknown as ISelectableWindow | null)?.isSelected ?? false;
    }

    // AS3: .../BotChatterMarkovConfiguration.as::set markovEnabled()
    private setMarkovEnabled(value: boolean): void
    {
        const checkbox = this._window?.findChildByName('markov_checkbox') as unknown as ISelectableWindow | null;

        if(checkbox === null || checkbox === undefined) return;

        checkbox.isSelected = value;
        (checkbox as unknown as IWindow).activate();
    }

    // AS3: .../BotChatterMarkovConfiguration.as::get markovEnabled()
    private get markovEnabled(): boolean
    {
        return (this._window?.findChildByName('markov_checkbox') as unknown as ISelectableWindow | null)?.isSelected ?? false;
    }

    // AS3: .../BotChatterMarkovConfiguration.as::set chatDelay()
    private setChatDelay(value: number): void
    {
        const field = this._window?.findChildByName('chat_delay_text') as ITextWindow | null;

        if(field === null || field === undefined) return;

        field.text = String(value);
        (field as unknown as IWindow).activate();
    }

    // AS3: .../BotChatterMarkovConfiguration.as::get chatDelay()
    private get chatDelay(): number
    {
        const text = (this._window?.findChildByName('chat_delay_text') as ITextWindow | null)?.text ?? '';
        const value = parseInt(text, 10);

        // AS3's `int(...)` of an unparsable string is 0, where parseInt() gives NaN.
        return isNaN(value) ? 0 : value;
    }

    // AS3: .../BotChatterMarkovConfiguration.as::get botCommandString()
    private get botCommandString(): string
    {
        return [
            BotChatterMarkovConfiguration.sanitizeBotChatString(this.text),
            String(this.autoChat),
            String(this.chatDelay),
            String(this.markovEnabled)
        ].join(BotChatterMarkovConfiguration.FIELD_SEPARATOR);
    }

    // AS3: .../BotChatterMarkovConfiguration.as::procedure()
    private procedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'save_button':
                this._widget?.handler?.container?.connection?.send(
                    new CommandBotComposer(this._botId, BotSkillEnum.CHATTER_MARKOV, this.botCommandString)
                );
                this.close();
                break;
            case 'cancel_button':
                this.close();
                break;
            case 'help_link':
                HabboWebTools.navigateToURL(
                    this._widget?.configuration?.getProperty('link.format.bots.help') ?? '', 'habboMain'
                );
                break;
        }
    };

    // AS3: .../BotChatterMarkovConfiguration.as::dispose()
    public override dispose(): void
    {
        this.close();
        super.dispose();
    }
}
