import type {IWindow} from '@core/window/IWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import type {IFloatableElementHandler} from '../../interfaces/elements/IFloatableElementHandler';
import type {ConcurrentUsersGoalProgressMessageParser} from '@habbo/communication/messages/parser/quest/ConcurrentUsersGoalProgressMessageParser';
import {ConcurrentUsersGoalProgressMessageEvent} from '@habbo/communication/messages/incoming/quest/ConcurrentUsersGoalProgressMessageEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ConcurrentUsersMeterElementHandler');

/**
 * Progress-meter image that swaps its asset in 10%-of-goal increments as the
 * community goal's concurrent-user challenge progresses.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4539.as
 */
export class ConcurrentUsersMeterElementHandler implements IElementHandler, IFloatableElementHandler
{
    private _sprite: IStaticBitmapWrapperWindow | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4539.as::initialize()
    initialize(landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        this._sprite = window as IStaticBitmapWrapperWindow;

        const assetUri = params[1];

        this._sprite.assetUri = assetUri;
        this._sprite.x = params.length > 2 ? parseInt(params[2], 10) : 0;
        this._sprite.y = params.length > 3 ? parseInt(params[3], 10) : 0;

        log.debug('Init Concurrent users meter: ' + assetUri);

        landingView.communicationManager?.addHabboConnectionMessageEvent(new ConcurrentUsersGoalProgressMessageEvent(this.onConcurrentUsersGoalProgress));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4539.as::refresh()
    refresh(): void
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4539.as::isFloating()
    isFloating(_value: boolean): boolean
    {
        return true;
    }

    private onConcurrentUsersGoalProgress = (event: IMessageEvent): void =>
    {
        const parser = event.parser as ConcurrentUsersGoalProgressMessageParser | null;

        if(!parser || !this._sprite) return;

        let percent = (parser.userCount / parser.userCountGoal) * 100;

        percent = Math.max(20, Math.min(100, percent));
        percent = Math.floor(percent / 10) * 10;

        const frame = 'challenge_meter_' + percent;

        this._sprite.assetUri = '${image.library.url}reception/' + frame + '.png';

        log.debug('Updating meter: ' + frame);
    };
}
