import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * "I have seen the new additions" — header 3835 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[3835]`). Empty payload.
 *
 * Sent once, the first time the catalog is opened while the server has flagged new additions.
 * It is what stops the toolbar badge coming back on the next login, so the client's own
 * `CATALOG_NEW_ITEMS_HIDE` is only half the job.
 *
 * Name RECOVERED from `vortex-emulator`'s `MarkCatalogNewAdditionsPageOpenedEvent`, which handles
 * this header.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2072.as
 */
export class MarkCatalogNewAdditionsPageOpenedComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_2072.as::_SafeCls_2072()
    constructor()
    {
        super();
    }

    // AS3: _SafeCls_2072.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
