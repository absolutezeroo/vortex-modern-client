import type {EventEmitter} from 'eventemitter3';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ICatalogPage} from '../ICatalogPage';

/**
 * A single widget attached to a catalog page's layout window.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/class_2612.as
 */
export interface ICatalogWidget
{
    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/class_2612.as::get page()
    page: ICatalogPage;

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/class_2612.as::get events()
    events: EventEmitter;

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/class_2612.as::get window()
    readonly window: IWindowContainer;

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/class_2612.as::dispose()
    dispose(): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/class_2612.as::init()
    init(): boolean;

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/class_2612.as::closed()
    closed(): void;
}
