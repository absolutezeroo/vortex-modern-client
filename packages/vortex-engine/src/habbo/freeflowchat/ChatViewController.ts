import {Container} from 'pixi.js';
import type {IDisposable} from '@core/runtime';
import type {ChatFlowViewer} from './viewer/ChatFlowViewer';
import type {ChatHistoryTray} from './history/visualization/ChatHistoryTray';

/**
 * ChatViewController
 *
 * Thin root-container wrapper exposed as HabboFreeFlowChat.displayObject -
 * RoomUI mounts this into the room's "room_new_chat" layout slot. It holds two
 * children: the live bubble viewer, and the drag-down chat-history tray
 * (`ChatHistoryTray`) on top of it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/ChatViewController.as
 */
export class ChatViewController implements IDisposable
{
    // AS3: .../src/com/sulake/habbo/freeflowchat/ChatViewController.as::_rootDisplayObject
    private _rootDisplayObject: Container | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/ChatViewController.as::_flowViewerDisplayObject
    private readonly _flowViewerDisplayObject: Container;
    // AS3: .../src/com/sulake/habbo/freeflowchat/ChatViewController.as::_pulldownDisplayObject
    private readonly _pulldownDisplayObject: Container | null;
    /**
     * DEVIATION: AS3 waits for `addedToStage`, keeps the stage's own `resize` event, and reads
     *   `stage.stageWidth/stageHeight`. This port has one canvas sized to the window, so the size
     *   comes from `window` and so does the event.
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/ChatViewController.as::onStageResized()
     */
    private readonly onResize = (): void =>
    {
        this._chatFlowViewer?.resize(window.innerWidth, window.innerHeight);
        this._pulldown?.resize(window.innerWidth, window.innerHeight);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/ChatViewController.as::ChatViewController()
    // AS3 takes the owning HabboFreeFlowChat as its first parameter and never reads it; that one is
    // dropped here rather than carried as an unused field.
    constructor(private readonly _chatFlowViewer: ChatFlowViewer, private readonly _pulldown: ChatHistoryTray | null = null)
    {
        this._flowViewerDisplayObject = _chatFlowViewer.rootDisplayObject;
        this._pulldownDisplayObject = _pulldown?.rootDisplayObject ?? null;

        const root = new Container();

        root.addChild(this._flowViewerDisplayObject);

        if(this._pulldownDisplayObject) root.addChild(this._pulldownDisplayObject);

        this._rootDisplayObject = root;

        if(typeof window !== 'undefined') window.addEventListener('resize', this.onResize);
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/ChatViewController.as::get disposed()
    get disposed(): boolean
    {
        return this._rootDisplayObject === null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/ChatViewController.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        if(typeof window !== 'undefined') window.removeEventListener('resize', this.onResize);

        this._rootDisplayObject?.removeChild(this._flowViewerDisplayObject);

        if(this._pulldownDisplayObject) this._rootDisplayObject?.removeChild(this._pulldownDisplayObject);

        this._rootDisplayObject = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/ChatViewController.as::get rootDisplayObject()
    get rootDisplayObject(): Container | null
    {
        return this._rootDisplayObject;
    }
}
