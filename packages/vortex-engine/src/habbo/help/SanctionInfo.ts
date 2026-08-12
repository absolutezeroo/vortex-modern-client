import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {SanctionRecord} from '@habbo/communication/messages/parser/help/SanctionRecord';
import type {SanctionTypeData} from '@habbo/communication/messages/parser/help/SanctionTypeData';
import type {HabboHelp} from './HabboHelp';

/**
 * The "sanction information" window — the player's own record of alerts, mutes and bans.
 *
 * One row per sanction, cloned from the layout's single text element. A sanction that says it
 * shows probation details expands into several lines: the reminder, how many days are left, and
 * what the next sanction would be.
 *
 * **Rewritten on 2026-08-12.** The previous version took nine flat parameters, logged them and
 * opened nothing — it was built on `win63_version`'s `SanctionStatusEventParser`, a 13-field
 * message that does not exist in the primary tree. See that parser's own note.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/SanctionInfo.as
 */
export class SanctionInfo
{
    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::_habboHelp
    private _habboHelp: HabboHelp;

    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::SanctionInfo()
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
    }

    /**
	 * Whether this handler has been disposed
	 */
    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Builds and shows the window.
     *
     * Note the first line: AS3 calls `dispose()` and then clears the flag again, which is how
     * re-opening works at all — the window is rebuilt from scratch every time rather than being
     * updated in place.
     */
    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::openWindow()
    openWindow(sanctions: SanctionRecord[] | null): void
    {
        this.dispose();
        this._disposed = false;

        this._window = this._habboHelp.getXmlWindow('sanction_info') as IWindowContainer | null;

        if(this._window == null) return;

        this._window.center();
        this._window.procedure = this.windowEventHandler;

        const list = this._window.findChildByName('main_contents_list') as unknown as IItemListWindow | null;
        const template = this._window.findChildByName('sanction_info') as unknown as ITextWindow | null;
        const divider = this._window.findChildByName('divider');

        if(!list || !template) return;

        const descriptions = this.buildSanctionDescriptions(sanctions);

        list.removeListItems();

        // A clean record still opens the window — it just says so.
        if(descriptions.length === 0)
        {
            const row = template.clone() as unknown as ITextWindow;

            row.caption = this._habboHelp.localization?.getLocalization('settings.help.sanction_information.description') ?? '';
            (row as unknown as IWindow).height = row.textHeight + 10;

            list.addListItem(row as unknown as IWindow);

            return;
        }

        for(let i = 0; i < descriptions.length; i++)
        {
            const row = template.clone() as unknown as ITextWindow;

            // The blank lines are padding between rows, not part of the text: every row but the
            // first is preceded by one, and every row but the last is followed by one.
            let caption = descriptions[i];

            if(i > 0) caption = `\n${caption}\n`;
            if(i < descriptions.length - 1) caption += '\n';

            row.caption = caption;
            (row as unknown as IWindow).height = row.textHeight + 10;

            list.addListItem(row as unknown as IWindow);

            if(i < descriptions.length - 1 && divider) list.addListItem(divider.clone());
        }
    }

    /**
     * One string per sanction that has something to say. A record with an empty description is
     * skipped entirely rather than printed blank.
     */
    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::buildSanctionDescriptions()
    private buildSanctionDescriptions(sanctions: SanctionRecord[] | null): string[]
    {
        const descriptions: string[] = [];

        if(!sanctions || sanctions.length === 0) return descriptions;

        for(const sanction of sanctions)
        {
            const description = sanction?.description ?? '';

            if(description.trim().length === 0) continue;

            const lines = [description];

            if(sanction?.showsProbationDetails) this.appendGradualSanctionDetails(lines, sanction);

            descriptions.push(lines.join('\n'));
        }

        return descriptions;
    }

    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::appendGradualSanctionDetails()
    private appendGradualSanctionDetails(lines: string[], sanction: SanctionRecord): void
    {
        const hasProbation = sanction.probationHoursLeft > 0;
        const nextName = sanction.nextSanctionType?.name ?? '';

        // Nothing to add when the player is off probation *and* no next step is named — the row
        // stays a single line.
        if(!hasProbation && nextName.trim().length === 0) return;

        const localization = this._habboHelp.localization ?? null;

        lines.push('');
        lines.push(localization?.getLocalization('help.sanction.probation.reminder') ?? '');

        if(hasProbation)
        {
            lines.push(`${localization?.getLocalization('help.sanction.probation.days.left') ?? ''} ${this.getProbationDaysLeft(sanction)}`);
        }

        if(nextName.trim().length > 0)
        {
            lines.push('');
            lines.push(this.getNextSanctionDescription(sanction.nextSanctionType));
            lines.push('');
        }
    }

    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::getProbationDaysLeft()
    // Rounds *up*: one hour left is still a day of probation.
    private getProbationDaysLeft(sanction: SanctionRecord): number
    {
        if(sanction.probationHoursLeft <= 0) return 0;

        return Math.ceil(sanction.probationHoursLeft / 24);
    }

    /**
     * What the next sanction would be, phrased in the unit that suits it — a mute in hours, a long
     * ban in days, a permanent ban not at all.
     */
    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::getNextSanctionDescription()
    private getNextSanctionDescription(type: SanctionTypeData | null): string
    {
        if(!type || type.name.trim().length === 0) return '';

        const localization = this._habboHelp.localization ?? null;

        switch(type.name)
        {
            case 'ALERT':
                return localization?.getLocalization('help.sanction.next.alert') ?? '';
            case 'MUTE':
                return localization?.registerParameter('help.sanction.next.mute', 'hours', type.durationHours.toString()) ?? '';
            case 'BAN_PERMANENT':
                return localization?.getLocalization('help.sanction.next.permban') ?? '';
            default:
                if(type.durationHours > 24)
                {
                    const days = Math.trunc(type.durationHours / 24);

                    return localization?.registerParameter('help.sanction.next.ban.days', 'days', days.toString()) ?? '';
                }

                return localization?.registerParameter('help.sanction.next.ban', 'hours', type.durationHours.toString()) ?? '';
        }
    }

    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::windowEventHandler()
    private windowEventHandler = (event: WindowEvent, target: IWindow): void =>
    {
        if(this._disposed || !this._window || event.type !== 'WME_CLICK' || !target) return;

        switch(target.name)
        {
            case 'faq_link':
                this._habboHelp.openCfhFaq();
                break;
            case 'header_button_close':
            case 'ok_button':
                this.dispose();
        }
    };

    // AS3: .../src/com/sulake/habbo/help/SanctionInfo.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._disposed = true;
    }
}
