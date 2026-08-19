import {createIID} from '@core/runtime/IID';
import type {NewModerationTool} from '@habbo/moderation/NewModerationTool';

/**
 * IID for the hidden joke mod tool.
 *
 * `ModerationManager` attaches `NewModerationTool` under this from its own constructor, exactly as
 * AS3 does. The tool declares no interface in any tree — AS3 registers the concrete class — so this
 * IID is typed on the class itself rather than on an `I*`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/iid/IIDNewModerationTool.as
 */
export const IID_NewModerationTool = createIID<NewModerationTool>('NewModerationTool');
