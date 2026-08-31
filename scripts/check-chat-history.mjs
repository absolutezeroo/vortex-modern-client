#!/usr/bin/env node
//
// The chat-history tray's arithmetic, checked by running it.
//
//   node scripts/check-chat-history.mjs
//
// Two things are guarded here, and both are the kind that fail silently.
//
// The row stacking: every row overlaps the one above it twice over — by the bubble style's own
// `overlap.y`, and by a flat 8px (`ROW_HEIGHT_OVERLAP`). The same expression is what
// `totalHeight`, `activateView()`, `setTopY()` and the overflow splice each compute, so getting it
// wrong in one of them does not throw; the scrollback simply drifts a few pixels per row and the
// scroll bar's thumb stops agreeing with the content, a thousand rows later.
//
// The scroll limits: `topY` is deliberately unclamped — over-scrolling past either end is allowed
// and a springback eases it back. The target for that springback is the one place a sign error
// turns "pull past the top" into "jump to the bottom", and nothing about it is observable from a
// unit that only reads the final position.
//
// PixiJS is stubbed rather than loaded: the scroll view holds a display list, but none of the
// numbers below go through the GPU, and pixi's own module init needs a DOM.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(import.meta.dirname, '..');
// Forward slashes: these paths are interpolated into a source string, where a Windows backslash
// would be read as an escape.
const SRC = join(ROOT, 'packages/vortex-engine/src').replaceAll('\\', '/');

// esbuild is a dependency of vortex-client, not of the root, so resolve it from there.
const require = createRequire(join(ROOT, 'packages/vortex-client/package.json'));
const esbuild = require('esbuild');

let failures = 0;

function fail(message)
{
    failures++;
    console.error(`  ✗ ${message}`);
}

function eq(actual, expected, message)
{
    if(actual === expected) return;

    fail(`${message}\n      expected ${expected}, got ${actual}`);
}

// ---------------------------------------------------------------------------------------------
// Stubs. Only what the two modules under test actually touch.
// ---------------------------------------------------------------------------------------------

const PIXI_STUB = `
export class Container
{
    constructor(){ this.children=[]; this.parent=null; this.x=0; this.y=0; this.mask=null;
        this.visible=true; this.eventMode='passive'; this.cursor=null; this.alpha=1;
        this.tint=0xFFFFFF; this._w=0; this._h=0; }
    get width(){ return this._w; }
    set width(v){ this._w=v; }
    get height(){ return this._h; }
    set height(v){ this._h=v; }
    addChild(...c){ for(const x of c){ if(x.parent) x.parent.removeChild(x); x.parent=this; this.children.push(x); } return c[0]; }
    removeChild(c){ const i=this.children.indexOf(c); if(i>=0){ this.children.splice(i,1); c.parent=null; } return c; }
    destroy(){ for(const c of this.children.slice()) this.removeChild(c); if(this.parent) this.parent.removeChild(this); }
    on(){ return this; }
    off(){ return this; }
    getBounds(){ return {x:this.x, y:this.y, width:this.width, height:this.height}; }
}
export const Texture = {
    EMPTY: {width:0, height:0},
    WHITE: {width:1, height:1},
    from(source){ return {width: source?.width ?? 1, height: source?.height ?? 1}; },
};
export class Sprite extends Container
{
    constructor(texture){ super(); this.texture = texture ?? Texture.EMPTY; }
    get width(){ return this._w || this.texture.width; }
    set width(v){ this._w = v; }
    get height(){ return this._h || this.texture.height; }
    set height(v){ this._h = v; }
}
export class NineSliceSprite extends Sprite {}
export class Graphics extends Container
{
    clear(){ this._w = 0; this._h = 0; return this; }
    rect(x,y,w,h){ this.x = x; this.y = y; this._w = w; this._h = h; return this; }
    fill(){ return this; }
}
export class Rectangle
{
    constructor(x=0,y=0,width=0,height=0){ this.x=x; this.y=y; this.width=width; this.height=height; }
    get right(){ return this.x + this.width; }
    get bottom(){ return this.y + this.height; }
}
`;

// The scroll bar reaches HabboFreeFlowChat for one static helper, which drags the whole component
// (and the DI container behind it) into the bundle. Only the helper matters here.
const CHAT_STUB = `
export class HabboFreeFlowChat
{
    static createNineSliceSprite(){ return null; }
    static createPixelPerfectNineSliceSprite(){ return null; }
    static getTimeStampNow(){ return '00:00:00'; }
}
`;

const stubPlugin = {
    name: 'chat-history-stubs',
    setup(build)
    {
        build.onResolve({filter: /^pixi\.js$/}, () => ({path: 'pixi-stub', namespace: 'stub'}));
        build.onResolve({filter: /HabboFreeFlowChat$/}, () => ({path: 'chat-stub', namespace: 'stub'}));
        build.onLoad({filter: /.*/, namespace: 'stub'}, args => ({
            contents: args.path === 'pixi-stub' ? PIXI_STUB : CHAT_STUB,
            loader: 'js',
        }));
    },
};

const dir = mkdtempSync(join(tmpdir(), 'vortex-chat-history-'));
const entry = join(dir, 'entry.ts');

writeFileSync(entry, `
export {ChatHistoryBuffer} from '${SRC}/habbo/freeflowchat/history/ChatHistoryBuffer';
export {ChatHistoryScrollView} from '${SRC}/habbo/freeflowchat/history/visualization/ChatHistoryScrollView';
export {ChatHistoryVisualizationEnum} from '${SRC}/habbo/freeflowchat/history/visualization/enum/ChatHistoryVisualizationEnum';
`);

const out = join(dir, 'bundle.mjs');

await esbuild.build({
    entryPoints: [entry],
    outfile: out,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    plugins: [stubPlugin],
    alias: {
        '@core': `${SRC}/core`,
        '@habbo': `${SRC}/habbo`,
        '@room': `${SRC}/room`,
        '@iid': `${SRC}/iid`,
    },
});

const {ChatHistoryBuffer, ChatHistoryScrollView, ChatHistoryVisualizationEnum} = await import(pathToFileURL(out).href);

const OVERLAP = ChatHistoryVisualizationEnum.ROW_HEIGHT_OVERLAP;

/** One history row, with only the six members IChatHistoryEntry declares. */
function entryOf(bitmapHeight, overlapY = 0, id = 0)
{
    return {
        bitmap: {width: 200, height: bitmapHeight},
        overlap: {x: 0, y: overlapY, width: 0, height: 0},
        userIndex: id,
        webId: id,
        roomId: 1,
        canIgnore: false,
        userName: `user${id}`,
    };
}

/** Just enough of HabboFreeFlowChat for the buffer: a factory, and the scroll view it notifies. */
function chatFlowOf(scrollView, nextEntry)
{
    return {
        chatBubbleFactory: {
            getHistoryLineEntry: item => nextEntry(item),
            getHistoryRoomChangeEntry: () => entryOf(30, 0, -1),
        },
        get chatHistoryScrollView(){ return scrollView; },
    };
}

console.log('Chat history — row stacking');
{
    const buffer = new ChatHistoryBuffer(chatFlowOf(null, () => null));

    eq(ChatHistoryBuffer.entryHeight(entryOf(50, 6)), 50 - 6 - OVERLAP, 'a row advances by height - overlap.y - 8');
    eq(ChatHistoryBuffer.entryHeight(entryOf(50, 0)), 50 - OVERLAP, 'a row with no style overlap still loses the flat 8');

    buffer.entries.push(entryOf(50, 6), entryOf(40, 0), entryOf(30, 2));
    eq(buffer.totalHeight, (50 - 6 - 8) + (40 - 8) + (30 - 2 - 8), 'totalHeight is the sum of the advances, not of the bitmaps');
}

console.log('Chat history — insert order and overflow');
{
    let n = 0;
    const spliced = [];
    const scrollView = {
        isActive: true,
        added: [],
        addHistoryEntry(entry){ this.added.push(entry); },
        scrollUpAndSpliceTopItem(height){ spliced.push(height); },
    };
    const buffer = new ChatHistoryBuffer(chatFlowOf(scrollView, () => entryOf(20, 0, n++)));

    for(let i = 0; i < 3; i++) buffer.insertChat({});

    eq(buffer.entries.map(e => e.userIndex).join(','), '0,1,2', 'rows land in the order they were said');
    eq(scrollView.added.length, 3, 'an open view is handed every new row');

    // One past the cap: the oldest goes, and the view is told to shuffle up by one row's advance.
    for(let i = 3; i < 1001; i++) buffer.insertChat({});

    eq(buffer.entries.length, 1000, 'the buffer stops at MAX_CHAT_ITEMS');
    eq(buffer.entries[0].userIndex, 1, 'the oldest row is the one dropped');
    eq(spliced.length, 1, 'the view is told exactly once');
    eq(spliced[0], 20 - OVERLAP, 'it is told the row advance, not the bitmap height');

    // A room change never reaches the view — it arrives while the tray is shut.
    const before = scrollView.added.length;

    buffer.insertRoomChange({roomName: 'x'});
    eq(scrollView.added.length, before, 'a room-change divider is not pushed to the view');
    eq(buffer.entries[buffer.entries.length - 1].userIndex, -1, 'but it is appended to the buffer');
}

console.log('Chat history — scrolling');
{
    // 10 rows of 50px, no style overlap: each advances 42, so the buffer is 420 tall.
    const entries = [];

    for(let i = 0; i < 10; i++) entries.push(entryOf(50, 0, i));

    const buffer = {entries, totalHeight: entries.length * (50 - OVERLAP)};
    const view = new ChatHistoryScrollView({assets: null}, buffer);

    eq(view.bufferHeight, 420, 'ten 50px rows stack to 420');

    view.viewPort = {x: 0, y: 0, width: 400, height: 300, right: 400, bottom: 300};
    view.viewWidth = 413;
    view.activateView();

    eq(view.isActive, true, 'activateView() marks the view live');

    const root = view.rootDisplayObject;
    const rows = root.children.filter(c => typeof c.userIndex === 'number');

    eq(rows.length, 10, 'one sprite per buffer entry');
    eq(rows[0].y, 0, 'the first row starts at -topY, which is 0');
    eq(rows[1].y, 42, 'the second starts one advance down');
    eq(rows[9].y, 9 * 42, 'and the tenth nine advances down');

    // topY moves every row by exactly the delta, and nothing else.
    view.topY = 100;
    eq(rows[0].y, -100, 'scrolling down moves the first row up by the same amount');
    eq(rows[9].y, 9 * 42 - 100, 'and every other row with it');

    // scrollToBottom lands at total - viewHeight + the default bottom padding, and follows.
    view.scrollToBottom();
    eq(view.topY, 420 - 300 + ChatHistoryVisualizationEnum.ENTRY_DEFAULT_BOTTOM_PADDING, 'scrollToBottom() leaves the newest row 300px above the floor');
    eq(view.isMostRecentHistoryMode, true, 'and turns following back on');

    // Off the bottom by more than the threshold, following stops. It takes a deliberate scroll to
    // clear the flag — writing topY alone does not, which is why a springback animation moving the
    // view past the threshold does not turn following off behind the user's back.
    view.beginUserScrollInteraction();
    view.topY = 420 - 300 + 50;
    eq(view.isMostRecentHistoryMode, false, 'scrolling back past the 100px threshold stops following');

    view.topY = 420 - 300 + 100;
    eq(view.isMostRecentHistoryMode, true, 'exactly at the threshold follows again, on position alone');

    // Springback, both ends. The margins are min(200, bufferHeight) = 200 here.
    view.beginUserScrollInteraction();
    view.topY = -1000;
    view.startSpringbackIfNeeded();
    view.update(1000);
    eq(view.topY, 200 - 300, 'over-scrolled past the top springs back to margin - viewHeight');

    view.beginUserScrollInteraction();
    view.topY = 5000;
    view.startSpringbackIfNeeded();
    view.update(1000);
    eq(view.topY, 420 - 200, 'over-scrolled past the bottom springs back to buffer - margin');

    // In range, the springback does not fire at all.
    view.beginUserScrollInteraction();
    view.topY = 0;
    view.startSpringbackIfNeeded();
    view.update(1000);
    eq(view.topY, 0, 'a position already in range is left alone');

    // The ease is monotone and lands exactly on the target, not near it.
    view.beginUserScrollInteraction();
    view.topY = 5000;
    view.startSpringbackIfNeeded();
    view.update(90);
    const halfway = view.topY;

    eq(halfway < 5000 && halfway > 420 - 200, true, `the ease is partway there after half the duration (got ${halfway})`);
    view.update(90);
    eq(view.topY, 420 - 200, 'and exactly on target at the end');

    view.dispose();
    eq(view.disposed, true, 'dispose() releases the display list');
}

if(failures > 0)
{
    console.error(`\n${failures} chat-history check(s) failed.`);
    process.exit(1);
}

console.log('Chat history OK: row stacking, insert order, the 1000-row splice, and the springback at both ends.');
