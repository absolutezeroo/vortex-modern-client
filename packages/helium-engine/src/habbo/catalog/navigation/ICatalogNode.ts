/**
 * A single node in the catalog category tree.
 *
 * @see sources/win63_version/habbo/catalog/navigation/class_1917.as
 */
export interface ICatalogNode
{
    dispose(): void;

    readonly isOpen: boolean;
    readonly depth: number;
    readonly isBranch: boolean;
    readonly isLeaf: boolean;
    readonly visible: boolean;
    readonly localization: string;
    readonly pageId: number;
    readonly pageName: string;
    readonly children: ICatalogNode[];
    readonly offerIds: number[];

    activate(): void;
    deactivate(): void;
    addChild(child: ICatalogNode): void;
    open(): void;
    close(): void;

    readonly parent: ICatalogNode | null;
    readonly iconName: string;
    readonly offsetV: number;
}
