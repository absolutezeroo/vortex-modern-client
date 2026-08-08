import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * The window side of the avatar editor, as `HabboAvatarEditor` uses it.
 *
 * TS-only: AS3's editor holds the concrete `AvatarEditorView` (657 l.). Extracted so the editor
 * core, the manager and the network handler can be ported and wired before the view exists — the
 * same technique slices 2-4 used. `AvatarEditorView` will satisfy this as written.
 *
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/AvatarEditorView.as
 * — not ported yet. The editor's `_view` is therefore null and every call through it is a no-op:
 * the figure model, the categories and the save path all work, but nothing is drawn. This is the
 * last remaining slice of the editor.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/AvatarEditorView.as
 */
export interface IAvatarEditorView
{
    // AS3: .../avatar/AvatarEditorView.as::dispose()
    dispose(): void;

    // AS3: .../avatar/AvatarEditorView.as::update()
    update(): void;

    // AS3: .../avatar/AvatarEditorView.as::hide()
    hide(): void;

    // AS3: .../avatar/AvatarEditorView.as::getFrame()
    // Builds the standalone editor window and hands it back — this is what `openEditor()` returns.
    getFrame(categories: string[] | null, title?: string | null): IWindowContainer | null;

    // AS3: .../avatar/AvatarEditorView.as::embedToContext()
    embedToContext(context: IWindowContainer | null, categories: string[] | null): boolean;

    // AS3: .../avatar/AvatarEditorView.as::toggleCategoryView()
    toggleCategoryView(categoryId: string, force?: boolean): void;

    // AS3: .../avatar/AvatarEditorView.as::get currentViewId()
    // Read by the NFT path to avoid yanking the figure out from under the NFT page.
    readonly currentViewId: string;

    // AS3: .../avatar/AvatarEditorView.as::getFigureContainer()
    // The preview slot `FigureDataView` renders the edited avatar into.
    getFigureContainer(): IWindow | null;

    /**
     * AS3: .../avatar/AvatarEditorView.as::get avatarEditorNameChangeView()
     *
     * TODO(AS3): typed `unknown` because `view/AvatarEditorNameChangeView.as` is not ported.
     * `AvatarEditorMessageHandler.onCheckUserNameResult()` is its only consumer and null-checks it,
     * so a name-check result is currently dropped rather than shown.
     */
    // AS3: .../avatar/AvatarEditorView.as::get avatarEditorNameChangeView()
    readonly avatarEditorNameChangeView: unknown;
}
