import type {NavigatorSavedSearch} from '../../communication/messages/incoming/newnavigator';
import type {NavigatorMetaDataMessageParser} from '../../communication/messages/parser/newnavigator';

/**
 * Container for navigator contexts and saved searches
 *
 */
export class ContextContainer
{
    // AS3: .../src/com/sulake/habbo/navigator/context/ContextContainer.as::_navigator
    private readonly _navigator: unknown | null;
    private _topLevelContexts: Map<string, NavigatorSavedSearch[]> | null = null;

    constructor(navigator: unknown | null = null)
    {
        this._navigator = navigator;
        void this._navigator;
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/ContextContainer.as::_savedSearches
    private _savedSearches: NavigatorSavedSearch[] = [];

    // AS3: .../src/com/sulake/habbo/navigator/context/ContextContainer.as::get savedSearches()
    get savedSearches(): NavigatorSavedSearch[]
    {
        return this._savedSearches;
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/ContextContainer.as::set savedSearches()
    set savedSearches(value: NavigatorSavedSearch[])
    {
        this._savedSearches = value;
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/ContextContainer.as::hasContextFor()
    hasContextFor(searchCode: string): boolean
    {
        return this._topLevelContexts !== null && this._topLevelContexts.has(searchCode);
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/ContextContainer.as::initialize()
    initialize(parser: NavigatorMetaDataMessageParser): void
    {
        this._topLevelContexts = new Map();

        for(const context of parser.topLevelContexts)
        {
            this._topLevelContexts.set(context.searchCode, context.quickLinks);
        }
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/ContextContainer.as::getTopLevelSearches()
    getTopLevelSearches(): string[]
    {
        if(this._topLevelContexts === null)
        {
            return [];
        }

        return Array.from(this._topLevelContexts.keys());
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/ContextContainer.as::isReady()
    isReady(): boolean
    {
        return this._topLevelContexts !== null;
    }
}
