/**
 * IOnBoardingHcContext
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/onBoardingHc/_SafeCls_2378.as
 *
 * What the onboarding steps may ask of `OnBoardingHcFlow`. Like `ILoginContext` it extends
 * `IUIContext`, so a step also gets the stage (for input focus) and the debug field.
 *
 * The AS3 interface name is obfuscated in every available tree; it is named here for its one
 * implementor (`OnBoardingHcFlow implements _SafeCls_2378`) and its members.
 */
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IUIContext} from '../onBoardingHcUi/IUIContext';

export interface IOnBoardingHcContext extends IUIContext
{
    // AS3: function getLocalization(_arg_1:String, _arg_2:String=null):String
    getLocalization(key: string, defaultValue?: string | null): string;

    // AS3: function getProperty(_arg_1:String, _arg_2:String=null):String
    getProperty(key: string, defaultValue?: string | null): string;

    // AS3: function nameChangeCompleted(_arg_1:Boolean=true):void
    nameChangeCompleted(claimed?: boolean): void;

    // AS3: function showHideButtons(_arg_1:Boolean):void
    showHideButtons(visible: boolean): void;

    // AS3: function setNameGender(_arg_1:String, _arg_2:Boolean):void
    setNameGender(name: string, isFemale: boolean): void;

    // AS3: function editorFinished():void
    editorFinished(): void;

    // AS3: function get communicationManager():IHabboCommunicationManager
    readonly communicationManager: IHabboCommunicationManager | null;
}
