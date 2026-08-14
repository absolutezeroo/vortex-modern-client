import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Publishes the photo just taken.
 *
 * Sends no payload: both AS3 trees declare a no-argument constructor and an array that is never
 * filled. The server identifies the request by its header alone.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/camera/PublishPhotoMessageComposer.as
 * (`_SafeCls_3566` in the primary tree, which agrees field-for-field; header 375 from WIN63's registry)
 */
export class PublishPhotoMessageComposer extends MessageComposer<[]>
{
    // AS3: .../outgoing/camera/PublishPhotoMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
