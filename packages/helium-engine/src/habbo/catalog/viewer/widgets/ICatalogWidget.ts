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
    page: ICatalogPage;

    events: EventEmitter;

    readonly window: IWindowContainer;

    dispose(): void;

    init(): boolean;

    closed(): void;
}
