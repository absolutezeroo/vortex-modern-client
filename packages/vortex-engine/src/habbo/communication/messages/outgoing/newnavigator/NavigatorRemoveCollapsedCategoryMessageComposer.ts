import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Removes a collapsed category from the navigator
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/newnavigator/NavigatorRemoveCollapsedCategoryMessageComposer.as
 */
export class NavigatorRemoveCollapsedCategoryMessageComposer extends MessageComposer<ConstructorParameters<typeof NavigatorRemoveCollapsedCategoryMessageComposer>>
{
    private _data: ConstructorParameters<typeof NavigatorRemoveCollapsedCategoryMessageComposer>;

    constructor(category: string)
    {
        super();

        this._data = [category];
    }

    getMessageArray()
    {
        return this._data;
    }
}
