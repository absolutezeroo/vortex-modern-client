import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Buys the photo just taken.
 *
 * Sends no payload: both AS3 trees declare a no-argument constructor and an array that is never
 * filled. The server identifies the request by its header alone.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/camera/PurchasePhotoMessageComposer.as
 * (`_SafeCls_3166` in the primary tree, which agrees field-for-field; header 753 from WIN63's registry)
 */
export class PurchasePhotoMessageComposer extends MessageComposer<[]>
{
    // AS3: .../outgoing/camera/PurchasePhotoMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
