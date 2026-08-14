import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Enters the photo just taken into the competition.
 *
 * Sends no payload: both AS3 trees declare a no-argument constructor and an array that is never
 * filled. The server identifies the request by its header alone.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/camera/PhotoCompetitionMessageComposer.as
 * (`_SafeCls_3963` in the primary tree, which agrees field-for-field; header 2707 from WIN63's registry)
 */
export class PhotoCompetitionMessageComposer extends MessageComposer<[]>
{
    // AS3: .../outgoing/camera/PhotoCompetitionMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
