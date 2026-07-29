/**
 * FurnitureContextInfoView — the base every furniture context-menu bubble extends.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/contextmenu/FurnitureContextInfoView.as
 *
 * It adds two things to ButtonMenuView: the room object the bubble belongs to, and a caption
 * string the caller passes through `setup()`. Only the guild menu uses that second field (it is
 * the guild's name); every other caller leaves it empty.
 *
 * Both backing fields are obfuscated in all three trees — `_SafeStr_5216`/`_SafeStr_5263` here,
 * `_Str_2731`/`_Str_2495` in the 2016 build. `_roomObject` is named after the readable
 * `get roomObject()` accessor; **`_caption` is DERIVED** from its only call site
 * (`showGuildFurnitureContextMenu()` passes the guild name).
 */
import type {IRoomObject} from '@room/object/IRoomObject';
import {ButtonMenuView} from '@habbo/ui/widget/contextmenu/ButtonMenuView';

export class FurnitureContextInfoView extends ButtonMenuView
{
    // AS3: FurnitureContextInfoView.as::_SafeStr_5216
    protected _roomObject: IRoomObject | null = null;

    // AS3: FurnitureContextInfoView.as::_SafeStr_5263 (name DERIVED — see class doc)
    protected _caption: string = '';

    // AS3: FurnitureContextInfoView.as::setup()
    public static setup(view: FurnitureContextInfoView, object: IRoomObject, caption: string = ''): void
    {
        view._roomObject = object;
        view._caption = caption;

        ButtonMenuView.setupContext(view);
    }

    // AS3: FurnitureContextInfoView.as::get roomObject()
    protected get roomObject(): IRoomObject | null
    {
        return this._roomObject;
    }

    // AS3: FurnitureContextInfoView.as::dispose()
    public override dispose(): void
    {
        this._roomObject = null;

        super.dispose();
    }
}
