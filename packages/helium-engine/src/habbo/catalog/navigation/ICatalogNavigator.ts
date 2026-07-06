import type {IWindow} from '@core/window/IWindow';
import type {IHabboCatalog} from '../IHabboCatalog';
import type {NodeData} from '../../communication/messages/incoming/catalog/NodeData';
import type {ICatalogNode} from './ICatalogNode';

/**
 * Interface for the catalog category navigator (tree + open/activate flows).
 *
 * @see sources/win63_version/habbo/catalog/navigation/class_1737.as
 */
export interface ICatalogNavigator
{
    dispose(): void;

    readonly catalog: IHabboCatalog;

    buildCatalogIndex(root: NodeData): void;

    showIndex(): void;

    activateNode(node: ICatalogNode): void;

    loadFrontPage(): void;

    readonly initialized: boolean;

    getNodesByOfferId(offerId: number, visibleOnly?: boolean): ICatalogNode[] | null;

    getNodeByName(name: string): ICatalogNode | null;

    getOptionalNodeByName(name: string): ICatalogNode | null;

    getNodeById(pageId: number, root?: ICatalogNode | null): ICatalogNode | null;

    openPage(name: string): void;

    openPageById(pageId: number, offerId: number): void;

    openPageByOfferId(offerId: number): void;

    deactivateCurrentNode(): void;

    filter(query: string, extraTerms: string[]): void;

    readonly listTemplate: IWindow;

    getItemTemplate(depth: number): IWindow;

    readonly isDeepHierarchy: boolean;
}
