/**
 * Session data event forwarded to widgets.
 *
 * @see sources/win63_version/habbo/session/events/SessionDataToWidgetEvent.as
 */
export class SessionDataToWidgetEvent
{
    static readonly PURCHASABLE_STYLES_UPDATED: string = 'SDTWE_PURCHASABLE_STYLES_UPDATED';

    constructor(
        public readonly type: string,
        public readonly bubbles: boolean = false,
        public readonly cancelable: boolean = false
    )
    {
    }
}
