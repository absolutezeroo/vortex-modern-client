/**
 * A single node in the catalog category tree.
 *
 * @see sources/win63_version/habbo/catalog/navigation/class_1917.as
 */
export interface ICatalogNode
{
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::dispose()
    dispose(): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get isOpen()
    readonly isOpen: boolean;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get depth()
    readonly depth: number;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get isBranch()
    readonly isBranch: boolean;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get isLeaf()
    readonly isLeaf: boolean;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get visible()
    readonly visible: boolean;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get localization()
    readonly localization: string;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get pageId()
    readonly pageId: number;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get pageName()
    readonly pageName: string;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get children()
    readonly children: ICatalogNode[];
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get offerIds()
    readonly offerIds: number[];

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::activate()
    activate(): void;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::deactivate()
    deactivate(): void;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::addChild()
    addChild(child: ICatalogNode): void;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::open()
    open(): void;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::close()
    close(): void;

    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get parent()
    readonly parent: ICatalogNode | null;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get iconName()
    readonly iconName: string;
    // AS3: sources/win63_version/habbo/catalog/navigation/class_1917.as::get offsetV()
    readonly offsetV: number;
}
