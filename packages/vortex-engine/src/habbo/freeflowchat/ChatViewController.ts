import {Container} from 'pixi.js';
import type {IDisposable} from '@core/runtime';
import type {ChatFlowViewer} from './viewer/ChatFlowViewer';

/**
 * ChatViewController
 *
 * Thin root-container wrapper exposed as HabboFreeFlowChat.displayObject -
 * RoomUI mounts this into the room's "room_new_chat" layout slot. AS3 also
 * bundles the drag-down chat-history tray (ChatHistoryTray) as a second
 * child here; that's explicitly out of scope for this pass (a distinct
 * scrollback-panel feature, not part of chat-style rendering) - see
 * docs/IMPLEMENTATION_STATUS.md. The `pulldown` param is already shaped for
 * it so wiring the tray in later doesn't need to change this constructor.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/ChatViewController.as
 */
export class ChatViewController implements IDisposable
{
    private _rootDisplayObject: Container | null;
    private readonly _flowViewerDisplayObject: Container;
    private readonly _pulldownDisplayObject: Container | null;
    private readonly onResize = (): void =>
    {
        this._chatFlowViewer?.resize(window.innerWidth, window.innerHeight);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/ChatViewController.as::ChatViewController()
    // TODO(AS3): 3rd AS3 param (ChatHistoryTray) omitted - see class header.
    constructor(private readonly _chatFlowViewer: ChatFlowViewer, pulldown: {rootDisplayObject: Container} | null = null)
    {
        this._flowViewerDisplayObject = _chatFlowViewer.rootDisplayObject;
        this._pulldownDisplayObject = pulldown?.rootDisplayObject ?? null;

        const root = new Container();

        root.addChild(this._flowViewerDisplayObject);

        if(this._pulldownDisplayObject) root.addChild(this._pulldownDisplayObject);

        this._rootDisplayObject = root;

        if(typeof window !== 'undefined') window.addEventListener('resize', this.onResize);
    }

    get disposed(): boolean
    {
        return this._rootDisplayObject === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/ChatViewController.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        if(typeof window !== 'undefined') window.removeEventListener('resize', this.onResize);

        this._rootDisplayObject?.removeChild(this._flowViewerDisplayObject);

        if(this._pulldownDisplayObject) this._rootDisplayObject?.removeChild(this._pulldownDisplayObject);

        this._rootDisplayObject = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/ChatViewController.as::get rootDisplayObject()
    get rootDisplayObject(): Container | null
    {
        return this._rootDisplayObject;
    }
}
