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
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::dispose()
    dispose(): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::get catalog()
    readonly catalog: IHabboCatalog;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::buildCatalogIndex()
    buildCatalogIndex(root: NodeData): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::showIndex()
    showIndex(): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::activateNode()
    activateNode(node: ICatalogNode): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::loadFrontPage()
    loadFrontPage(): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::get initialized()
    readonly initialized: boolean;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::getNodesByOfferId()
    getNodesByOfferId(offerId: number, visibleOnly?: boolean): ICatalogNode[] | null;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::getNodeByName()
    getNodeByName(name: string): ICatalogNode | null;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::getOptionalNodeByName()
    getOptionalNodeByName(name: string): ICatalogNode | null;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::getNodeById()
    getNodeById(pageId: number, root?: ICatalogNode | null): ICatalogNode | null;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::openPage()
    openPage(name: string): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::openPageById()
    openPageById(pageId: number, offerId: number): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::openPageByOfferId()
    openPageByOfferId(offerId: number): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::deactivateCurrentNode()
    deactivateCurrentNode(): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::filter()
    filter(query: string, extraTerms: string[]): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::get listTemplate()
    readonly listTemplate: IWindow;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::getItemTemplate()
    getItemTemplate(depth: number): IWindow;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1737.as::get isDeepHierarchy()
    readonly isDeepHierarchy: boolean;
}
