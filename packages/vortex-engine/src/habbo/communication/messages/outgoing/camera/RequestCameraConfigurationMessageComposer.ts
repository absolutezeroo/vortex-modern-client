import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for the camera's prices; answered by InitCamera (2768).
 *
 * Sends no payload: both AS3 trees declare a no-argument constructor and an array that is never
 * filled. The server identifies the request by its header alone.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/camera/RequestCameraConfigurationMessageComposer.as
 * (`_SafeCls_3555` in the primary tree, which agrees field-for-field; header 3010 from WIN63's registry)
 */
export class RequestCameraConfigurationMessageComposer extends MessageComposer<[]>
{
    // AS3: .../outgoing/camera/RequestCameraConfigurationMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
