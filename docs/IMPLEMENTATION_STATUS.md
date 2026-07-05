# Helium - Implementation Status

> **Last updated**: 2026-07-03
> **Method**: filesystem snapshot plus targeted AS3/TS directory counts.
> **Important**: this is **not** a member-level AS3 parity certification. A TS count greater than an AS3 count only means files exist; completion still requires reading the AS3 source and auditing public API, lifecycle, parser/composer behavior, and dispose paths.

---

## Snapshot

| Metric                           | Current value |
|----------------------------------|---------------|
| Primary WIN63 AS3 source files   | 4,783 `.as`   |
| Secondary Flash AS3 source files | 7,159 `.as`   |
| Engine TypeScript files          | 2,373 `.ts`   |
| Client TypeScript files          | 18 `.ts`      |
| Converted window layouts         | 1,045 `.json` |
| Converted window skins           | 97 `.json`    |
| Engine `AS3:` trace comments     | 1,727         |

There is no reliable single global percentage right now. Raw file counts undercount converted JSON layouts, overcount `index.ts`/support files, and do not prove AS3 API parity. Use the module snapshot below as the working status.

---

## Current Module Snapshot

| Area / module              | AS3 files | TS files | Current status                                                                                                                       |
|----------------------------|-----------|----------|--------------------------------------------------------------------------------------------------------------------------------------|
| `core/`                    | 360       | 308      | Advanced. `core/window` is heavily ported; runtime/assets/communication still need targeted parity audits before being called final. |
| `core/window`              | 244       | 212      | Advanced and active. Not "not started"; several AS3 parity passes landed recently.                                                   |
| `iid/`                     | 52        | 52       | Structurally aligned by file count; still verify symbols against AS3 before marking complete.                                        |
| `room/` root               | 81        | 63       | Advanced low-level room manager/renderer support.                                                                                    |
| `habbo/room`               | 317       | 312      | Advanced. Room engine/object pipeline exists; visualization and edge behavior still require parity checks.                           |
| `habbo/session`            | 82        | 89       | Advanced / likely near complete; keep auditing handlers and message wiring as new protocol gaps are found.                           |
| `habbo/navigator`          | 83        | 98       | Advanced and active. Logic plus major UI/window flows are present; recent work focused on AS3 visual parity.                         |
| `habbo/window`             | 106       | 85       | Advanced and active. Widgets/dialogs/resource management exist; do not describe this as unstarted.                                   |
| `habbo/ui`                 | 375       | 45       | Mostly missing. Room desktop/widget shell exists; infostand (furni-only) and room-tools widgets ported — see notes below.            |
| `habbo/avatar`             | 138       | 85       | Partial/advanced. Rendering data and manager work exists; editor/display coverage is still incomplete.                               |
| `habbo/inventory`          | 57        | 53       | Advanced logic. Display/user workflows still need parity checks.                                                                     |
| `habbo/toolbar`            | 41        | 45       | Advanced. Purse/bottom-bar work exists; continue AS3 behavior validation.                                                            |
| `habbo/communication`      | 1,913     | 1,001    | Partial. Large message backlog remains; see message section.                                                                         |
| `habbo/catalog`            | 239       | 11       | Early partial. Purse/catalog shell exists, but catalog logic, UI, and most messages are missing.                                     |
| `habbo/help`               | 34        | 27       | Partial/advanced. No longer zero; managers, CFH registry, and many help messages exist.                                              |
| `habbo/moderation`         | 43        | 8        | Partial. Manager/message handler shell exists; moderation UI/tools are not complete.                                                 |
| `habbo/quest`              | 39        | 15       | Partial. Some quest messages exist; full quest engine/UI remains incomplete.                                                         |
| `habbo/groups`             | 21        | 8        | Partial.                                                                                                                             |
| `habbo/friendlist`         | 40        | 3        | Early shell only; messages are more complete than the manager/UI.                                                                    |
| `habbo/friendbar`          | 143       | 7        | Early partial. Landing view shell exists; friend bar data/view is mostly missing.                                                    |
| `habbo/notifications`      | 33        | 16       | Partial. Several notification messages exist; manager/UI coverage is not complete.                                                   |
| `habbo/messenger`          | 7         | 6        | Near aligned by file count; still requires behavior parity audit.                                                                    |
| `habbo/freeflowchat`       | 32        | 13       | Partial, not full module parity.                                                                                                     |
| `habbo/advertisement`      | 5         | 7        | Small module present; verify behavior before marking complete.                                                                       |
| `habbo/campaign`           | 5         | 2        | Partial despite prior docs claiming complete.                                                                                        |
| `habbo/tracking`           | 10        | 10       | Structurally aligned by file count.                                                                                                  |
| `habbo/utils`              | 27        | 17       | Partial/advanced.                                                                                                                    |
| `habbo/game`               | 63        | 0        | Not started.                                                                                                                         |
| `habbo/sound`              | 29        | 0        | Not started.                                                                                                                         |
| `habbo/roomevents`         | 347       | 0        | Not started. Wired/user-defined room event messages are also missing.                                                                |
| `habbo/nux`                | 4         | 0        | Not started.                                                                                                                         |
| `habbo/phonenumber`        | 7         | 0        | Not started.                                                                                                                         |
| `habbo/userclassification` | 1         | 0        | Not started.                                                                                                                         |
| `helium-client/src/login`  | 6         | 10       | Advanced. Environment/Login/SsoToken/AvatarSelect/Register/AvatarCreate screens all present; ported from `vortex-client/src/onBoardingHc` (the actual vortex-client AS3 client source, not `sources/win63_version`, which has no onboarding module). AvatarCreate reuses the already-bootstrapped engine `avatarRenderManager` instead of AS3's separate onboarding-only renderer. Simplified: `RandomAvatarCloudsAnimation` cel animation not ported (CSS pulse flourish instead); AS3's granular `ILoginViewer` error callbacks (`showRegistrationError`/`showAccountError`/etc.) are collapsed into the existing `showErrorMessage()` pattern already used by this port. |

---

## Communication Messages

The previous docs underreported the message port substantially. Current filesystem counts:

| Message type       | AS3 files | TS files | Raw remaining delta |
|--------------------|-----------|----------|---------------------|
| Incoming events    | 700       | 341      | 359                 |
| Outgoing composers | 547       | 283      | 264                 |
| Parsers            | 630       | 339      | 291                 |
| **Total**          | **1,877** | **963**  | **914**             |

Top remaining gaps by category:

| Category                | Incoming gap | Outgoing gap | Parser gap | Notes                                                           |
|-------------------------|--------------|--------------|------------|-----------------------------------------------------------------|
| `userdefinedroomevents` | 55           | 25           | 31         | Biggest missing protocol surface; blocks Wired/roomevents.      |
| `catalog`               | 48           | 38           | 36         | Catalog remains an early partial module.                        |
| `room`                  | 45           | 30           | 43         | Still a large protocol gap despite room engine progress.        |
| `game`                  | 39           | 27           | 56         | SnowWar/game protocol mostly absent.                            |
| `users`                 | 29           | 25           | 18         | Several batches exist, but profile/user flows are not complete. |
| `inventory`             | 26           | 5            | 24         | Logic is advanced; incoming/parser gaps remain.                 |
| `collectibles`          | 20           | 18           | 29         | Not started at module level.                                    |
| `sound`                 | 10           | 9            | 8          | Not started.                                                    |
| `marketplace`           | 9            | 10           | 8          | Missing as separate protocol area.                              |
| `groupforums`           | 9            | 12           | 13         | Missing.                                                        |

Notable corrections from stale docs:

- `help` is not zero: incoming `33/32`, outgoing `23/34`, parser `33/33` by raw file count.
- `moderation` is not zero: incoming `14/26`, parser `25/19`, plus manager shell files.
- `quest` is not zero: incoming `12/20`, outgoing `15/18`, parser `19/16`.
- `catalog` is not zero, but it is still early partial: `habbo/catalog` has 11 TS files and catalog messages remain mostly missing.

---

## Current Priorities

1. **Make status updates part of every port batch**: update this file and `docs/MESSAGES_PORT_BACKLOG.md` when files are added, not weeks later.
2. **Resolve the largest protocol gaps**: `userdefinedroomevents`, `catalog`, `room`, `game`, `users`, and `inventory`.
3. **Do not label modules complete from file count alone**: mark complete only after AS3 member-level API/lifecycle/dispose parity is checked.
4. **Continue core/window + habbo/window parity**: this area is active and advanced, but still needs targeted AS3 audits for remaining widgets and edge cases.
5. **Catalog, sound, game, roomevents, and full `habbo/ui` remain major product gaps**.

---

## Recent Work Recorded

- 🟡 **First room widget ported: infostand (furni-only)**: `IRoomWidget`/`RoomWidgetBase` foundation, `InfoStandWidget`/`InfoStandFurniView`/`InfoStandFurniData`/`InfoStandCrackableFurniView` fully ported (click furni → info panel → move/rotate buttons still TODO, pickup/eject/use work), `InfoStandWidgetHandler` scoped to furni message/event cases. `RoomDesktop.createWidget()`/`processWidgetMessage()`/`roomObjectEventHandler()` are wired for real (previously stubs); `RoomEngine` gained click-to-select (`REOE_OBJECT_SELECTED`/`DESELECTED`), `modifyRoomObject()`, `useRoomObjectInActiveRoom()`. User/Pet/Bot/RentableBot/Jukebox/SongDisk sub-views are inert `TODO(AS3)` stubs — next widget-port session should either flesh these out or pick the next `RWE_*` type from `RoomWidgetFactory.as`. Furni thumbnail uses the catalog-type icon as a stand-in for AS3's live-object render (`RoomEngine.getRoomObjectImage`, itself an unimplemented stub elsewhere in `RoomPreviewer.ts`).
- ✅ **Infostand widget visual bug-fix pass (position/font/cropping)**: found via iterative live testing after the initial infostand port.
  - `RoomDesktopLayoutManager.getWidgetContainer()` matched widget-type strings case-sensitively (`'RWE_INFOSTAND'.indexOf('infostand')` never matched), silently misrouting the widget's window to the wrong/no container.
  - `RoomDesktopLayoutManager.setLayout()`/`addWidgetWindow()`/`getWidgetContainer()` were re-ported from the clean `win63_2023_version/com/sulake/habbo/ui/DesktopLayoutManager.as` (the primary `win63_version/habbo/ui/class_3019.as` has decompiler corruption here: a `null.`-ref infinite loop and a dropped final `return`) — now uses AS3's real tag-based `getWidgetContainer()` (reads the widget window's own `.tags`, not its type-string name) and wires the real `trimContainer()` (`WE_CHILD_RESIZED` → shrink-wrap a single-child slot to that child's size) instead of an invented one-off reposition hack that was tried and reverted.
  - Custom webfonts (`Volter (Goldfish)`, `Ubuntu*`) were bundled but never registered with the browser — `App.ts` now loads them via the `FontFace` API before first render.
  - `ctx.font` strings built with an unquoted multi-word family name (`9px Volter (Goldfish), Ubuntu, ...`) are invalid Canvas 2D syntax and silently drop the whole font declaration with no console error; centralized quoting now lives in `core/window/utils/CanvasFontString.ts::quoteFontFamilyList()`, used by `WindowComposite`, `TextController`, and `TextLabelController`.
  - `TextController`/`TextLabelController` line-height was a flat `fontSize`-based guess (AS3 used Flash's real measured `TextField.textHeight`); replaced with `CanvasFontString.ts::measureFontLineHeight()` using `TextMetrics.fontBoundingBoxAscent/Descent` (the font's fixed design metrics — not `actualBoundingBox*`, which is per-glyph ink and was tried/reverted for being inconsistent across caption strings). Fixes descenders getting clipped (e.g. "My World" rendering as "Mv World").
  - JSON layouts commonly declare text margins as one nested `vars.margins: {left,top,right,bottom}` var (serialized to XML as a `Map`), but `TextController`/`TextLabelController`'s property-application only recognized 4 flat `margin_left`/`margin_top`/`margin_right`/`margin_bottom` keys — the nested form was silently dropped, so every such label rendered with 0 margins (buttons shrink-wrapped via AS3's real `ButtonController` `EXPAND_TO_ACCOMMODATE_CHILDREN`/`WE_CHILD_RESIZED` → `width = 0` behavior ended up tight enough to look cropped/too-narrow). Both controllers now handle a `case 'margins'`.
- 🟡 **Second room widget ported: room-tools (RWE_ROOM_TOOLS)**: `RoomToolsWidget`/`RoomToolsCtrlBase`/`RoomToolsToolbarCtrl`/`RoomToolsInfoCtrl`/`RoomToolsHistory` fully ported from `sources/win63_version/habbo/ui/widget/roomtools/*.as` (no decompiler corruption found there), `RoomToolsWidgetHandler` fully ported. Settings/room-info popup, collapse/expand slide animation, camera button dispatch (`HabboToolbarEvent`), like/rate, share-room popup + clipboard, room-history back/forward navigation, and tag-click-to-search all work. `RoomWidgetFactory`/`RoomDesktop.createWidget()` wired for `'RWE_ROOM_TOOLS'` matching `RoomDesktop.as:885-890` exactly (constructs the handler, sets `.communicationManager`/`.navigator`). Added `IID_HabboNavigator`/`IID_HabboCommunicationManager` DI wiring to `RoomUI`/`RoomDesktop` (previously registered symbols, never consumed here); added `RoomUI.desktop` (AS3's `var_22` is a single field, the TS port already keyed multiple desktops by room identifier in a `Map` for the underlying multi-session architecture — this exposes "the most recently created desktop" as the AS3-equivalent view) and `IRoomDesktop.getWidget()` (was implemented on the concrete class but missing from the interface). Also created the missing `RoomWidgetZoomToggleMessage` (referenced by infostand-era `getWidgetMessages()` docs but never actually added).
  - Two scope cuts, both logged in-code as `TODO(AS3)`: the `room_tools_history_item` layout asset is not bundled, so the visited-rooms **dropdown list** doesn't render (back/forward navigation buttons work fully, they only need the in-memory visited-rooms array); `freeFlowChat` isn't wired into `RoomUI`/`RoomDesktop` at all (module exists standalone under `habbo/freeflowchat`), so the chat-history toggle button is visible but its click is a no-op.
  - AS3's cross-room widget-instance reuse (`RoomUI.as`'s `var_4627`/`var_1358`: `RWE_ROOM_TOOLS` and 7 other widget types are reconstructed-or-reused via `widget.reuse(newDesktop)` instead of always reconstructing) is not ported — `RoomDesktop.createWidget()` now sets the `widget.reusable` flag correctly per type (previously hardcoded `false` for everything, which happened to also affect infostand — that flag is currently unread/inert either way) but the caller-side instance cache in `RoomUI` doesn't exist yet, so every widget is still freshly constructed each room-enter.
- ✅ **core/window dropdown compact text follow-up**: `WindowComposite` treats `_DROPLIST_TITLETEXT` and dropdown item `_BTN_TEXT` as compact Flash TextField content, with AS3-style metrics/clipping and baseline offset.
- ✅ **Navigator dropdown/create-room input follow-up**: top-level navigator tabs select the AS3 matching search index, dropmenu title text uses compact Flash margins, create-room thumbnails use AS3 interpolated image URIs plus tile label colors, and `TextFieldManager` refocuses the browser input after placeholder clearing.
- ✅ **Navigator create-room/search/dropdown tabs AS3 parity pass**: `RoomCreateViewCtrl` follows WIN63 prepare/refresh/thumbnail/dropdown/create composer flow; navigator tabs avoid converted Flash `y=-1` truncation; search input border clicks focus the text field.
- ✅ **Navigator room usercount label AS3 follow-up**: `RoomEntryElementFactory.updateCommonEntryElements()` keeps the compact `room_usercount` label on the Flash visual baseline after caption updates.
- ✅ **core/window TextField vertical AS3 parity fix**: `WindowComposite.compositeText()` applies the Flash `TextField` top gutter so purse currency numbers and other glyphs no longer render too high.
- ✅ **Window ResourceManager pending asset wake-up**: `registerAssetUrl()` starts lazy loading for receivers that requested a static bitmap before the bundled image URL was registered.
- ✅ **Configuration/localization/gamedata parity passes**: AS3 `external_texts`, `external_variables`, `furnidata`, `productdata`, avatar figuremap, and room content loading behavior were realigned over recent batches.

---

## Validation

This documentation update is based on read-only filesystem counts. No TypeScript build was run for this docs-only change.

To refresh the snapshot manually:

```powershell
(Get-ChildItem sources\win63_version -Recurse -Filter *.as -File).Count
(Get-ChildItem sources\flash_version -Recurse -Filter *.as -File).Count
(Get-ChildItem packages\helium-engine\src -Recurse -Filter *.ts -File).Count
(Get-ChildItem packages\helium-client\src -Recurse -Filter *.ts -File).Count
```

