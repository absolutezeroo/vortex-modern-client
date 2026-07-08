import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the currently-active scheduled campaign code for a `landing.view.dynamic.slot.N.conf`
 * schedule string, used by `WidgetContainerWidget`/`CommunityGoalHallOfFameWidget`
 * to swap their content when a scheduled campaign changes.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/competition/CurrentTimingCodeMessageEventParser.as
 */
export class CurrentTimingCodeMessageEventParser implements IMessageParser
{
    private _schedulingStr: string = '';
    private _code: string = '';

    flush(): boolean
    {
        this._schedulingStr = '';
        this._code = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._schedulingStr = wrapper.readString();
        this._code = wrapper.readString();
        return true;
    }

    get schedulingStr(): string
    {
        return this._schedulingStr;
    }

    get code(): string
    {
        return this._code;
    }
}
