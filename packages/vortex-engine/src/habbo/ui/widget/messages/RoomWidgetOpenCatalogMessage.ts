import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * "Open the catalogue at this page".
 *
 * Four page keys are declared and only `CATALOG_CLUB` is ever acted on — `MeMenuWidgetHandler`
 * tests for it and ignores the rest, so the three currency pages resolve to nothing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetOpenCatalogMessage.as
 */
export class RoomWidgetOpenCatalogMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetOpenCatalogMessage.as::OPEN_CATALOG
    // Name DERIVED (`_SafeStr_11193`), from its value.
    public static readonly OPEN_CATALOG: string = 'RWGOI_MESSAGE_OPEN_CATALOG';

    // AS3: .../widget/messages/RoomWidgetOpenCatalogMessage.as::CATALOG_CLUB
    // The only key any handler acts on.
    public static readonly CATALOG_CLUB: string = 'RWOCM_CLUB_MAIN';

    // AS3: .../widget/messages/RoomWidgetOpenCatalogMessage.as::PIXELS
    public static readonly PIXELS: string = 'RWOCM_PIXELS';

    // AS3: .../widget/messages/RoomWidgetOpenCatalogMessage.as::CREDITS
    public static readonly CREDITS: string = 'RWOCM_CREDITS';

    // AS3: .../widget/messages/RoomWidgetOpenCatalogMessage.as::SHELLS
    public static readonly SHELLS: string = 'RWOCM_SHELLS';

    // AS3: .../widget/messages/RoomWidgetOpenCatalogMessage.as::_pageKey
    private _pageKey: string = '';

    // AS3: .../widget/messages/RoomWidgetOpenCatalogMessage.as::RoomWidgetOpenCatalogMessage()
    // The constructor takes the *page key*, not the type — the type is fixed.
    constructor(pageKey: string)
    {
        super(RoomWidgetOpenCatalogMessage.OPEN_CATALOG);

        this._pageKey = pageKey;
    }

    // AS3: .../widget/messages/RoomWidgetOpenCatalogMessage.as::get pageKey()
    public get pageKey(): string
    {
        return this._pageKey;
    }
}
