import type {ISourceTypeListener} from './inputsources/ISourceTypeListener';
import type {DefaultElement} from './DefaultElement';

/**
 * WrappedSourceTypeListener — adapts a wired element + a merged-slot id into an ISourceTypeListener,
 * so a source-type picker for that slot forwards its chosen type to the element's controller.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/WrappedSourceTypeListener.as
 */
export class WrappedSourceTypeListener implements ISourceTypeListener
{
    // AS3: WrappedSourceTypeListener.as::_element
    private _element: DefaultElement;

    // AS3: WrappedSourceTypeListener.as::_id
    private _id: number;

    // AS3: WrappedSourceTypeListener.as::WrappedSourceTypeListener()
    constructor(element: DefaultElement, id: number)
    {
        this._element = element;
        this._id = id;
    }

    // AS3: WrappedSourceTypeListener.as::set sourceType()
    set sourceType(value: number)
    {
        this._element.roomEvents.wiredCtrl.setMergedSourceType(this._id, value);
    }
}
