/**
 * IUIContext
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/IUIContext.as
 *
 * What a widget needs from whoever hosts it: the stage (so `InputField` can move focus) and the
 * debug text field (which `LoginFlow` returns null for).
 */
import type {Stage} from './display/Stage';
import type {TextField} from './display/TextField';

export interface IUIContext
{
    // AS3: function get stage():Stage
    get stage(): Stage | null;

    // AS3: function get debugText():TextField
    get debugText(): TextField | null;
}
