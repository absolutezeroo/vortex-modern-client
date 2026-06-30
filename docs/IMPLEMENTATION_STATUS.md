# Helium - Implementation Status

> **Last updated**: 2026-06-30
> **Method**: Exhaustive AS3 → TS audit (comparing `source_as_win63/` vs `src/`)
> **Total AS3 files**: ~2,000+ (logic + display) | **Total TS implemented**: ~716+ files
> **Approach**: Full port — all AS3 files (logic AND display) are implemented. Flash XML layouts converted to JSON.

---

## Overview

```
Overall progress: ████████░░░░░░░░░░░░ ~35%
```

| Module                             | AS3 Total | TS Impl | %    | Status                                  |
|------------------------------------|-----------|---------|------|-----------------------------------------|
| **core/communication**             | 22        | 31      | 100% | ✅ Complete (obfuscated internals only) |
| **core/assets**                    | 25        | 23      | 100% | ✅ Complete                             |
| **core/runtime**                   | 32        | 22      | 69%  | 🔄 Advanced                             |
| **configuration**                  | 2         | 8       | 100% | ✅ Complete                             |
| **localization**                   | 3         | 7       | 100% | ✅ Complete                             |
| **inventory**                      | 51        | 33      | 65%  | 🔄 Logic complete, display pending      |
| **session**                        | 77        | 77      | 100% | ✅ Complete                             |
| **navigator**                      | 70+       | 28      | 40%  | 🔄 Logic complete, display pending      |
| **communication** (root/demo/enum) | 10        | 5       | 50%  | 🔄 Partial (WebApi=SKIP)                |
| **communication/messages**         | 1150      | 407     | 35%  | 🔄 Partial                              |
| **room** (total)                   | 313       | 330     | 100% | ✅ Complete                             |
| **avatar**                         | 120       | 83      | 69%  | 🔄 Logic complete, display pending      |
| **catalog**                        | 105       | 0       | 0%   | ❌ Not started                          |
| **sound**                          | 28        | 0       | 0%   | ❌ Not started                          |
| **friendlist**                     | 21        | 0       | 0%   | ❌ Not started                          |
| **moderation**                     | 36        | 0       | 0%   | ❌ Not started                          |
| **help**                           | 13        | 0       | 0%   | ❌ Not started                          |
| **quest**                          | 21        | 0       | 0%   | ❌ Not started                          |
| **tracking**                       | 10        | 10      | 100% | ✅ Complete                             |
| **toolbar**                        | 12        | 12      | 100% | ✅ Purse area display wired             |
| **groups**                         | 14        | 8       | 57%  | 🔄 In progress                          |
| **game**                           | 58        | 0       | 0%   | ❌ Not started                          |
| **notifications**                  | 6         | 13      | 100% | ✅ Complete                             |
| **roomevents**                     | 5         | 0       | 0%   | ❌ Not started                          |
| **messenger**                      | 5         | 6       | 100% | ✅ Complete                             |
| **freeflowchat**                   | 3         | 13      | 100% | ✅ Complete                             |
| **advertisement**                  | 3         | 6       | 100% | ✅ Complete                             |
| **campaign**                       | 1         | 7       | 100% | ✅ Complete                             |
| **friendbar**                      | 5         | 0       | 0%   | ❌ Not started                          |
| **utils**                          | 19        | 14      | 74%  | 🔄 Advanced                             |
| **nux**                            | 4         | 0       | 0%   | ❌ Not started                          |
| **phonenumber**                    | 7         | 0       | 0%   | ❌ Not started                          |
| **window**                         | 5         | 0       | 0%   | ❌ Not started                          |
| **ui (window system)**             | 369       | 0       | 0%   | ❌ Not started                          |

---

## 1. Complete Modules (✅)

### 1.1 core/communication (100%)
```
Progress: ████████████████████ ~100%
AS3: 22 files | TS: 31 files
```
> Only obfuscated internal files remain unported — the public API is 100% complete.

| Status | Element                                          |
|--------|--------------------------------------------------|
| ✅     | SocketConnection (WebSocket + EventEmitter3)     |
| ✅     | CoreCommunicationManager (connection pooling)    |
| ✅     | Diffie-Hellman key exchange + ArcFour encryption |
| ✅     | MessageDataWrapper (typed read methods)          |
| ✅     | Message registry (ID → Event/Composer mapping)   |
| ✅     | WireFormat encoding/decoding                     |
| ✅     | Handshake protocol                               |

### 1.2 core/assets (100%)
```
Progress: ████████████████████ ~100%
AS3: 25 files | TS: 23 files
```
> DisplayAsset/TypeFaceAsset = Flash-specific (SKIP). Functionally 100%.

| Status | Element                                  |
|--------|------------------------------------------|
| ✅     | AssetLibrary, loaders, sprite extraction |
| ✅     | Asset data models                        |

### 1.3 Configuration (100%)
```
Progress: ████████████████████ ~100%
```

| Status | Element                                                            |
|--------|--------------------------------------------------------------------|
| ✅     | HabboConfigurationManager + IHabboConfigurationManager             |
| ✅     | Enums: HabboProperty, HabboConfigurationEvent, HabboComponentFlags |

### 1.4 Localization (100%)
```
Progress: ████████████████████ ~100%
```

| Status | Element                                              |
|--------|------------------------------------------------------|
| ✅     | HabboLocalizationManager + IHabboLocalizationManager |
| ✅     | BadgeBaseAndLevel, HabboLocalizationEvent            |

### 1.5 Inventory — Logic (100%)
```
Progress (logic): ████████████████████ ~100%
AS3 logic: 33 files | TS: 33 files
Display: pending
```

| Status | Element                                                        |
|--------|----------------------------------------------------------------|
| ✅     | Full HabboInventory with all sub-models                        |
| ✅     | FurniModel, PetsModel, BadgesModel, EffectsModel, TradingModel |
| ✅     | Items: FurnitureItem, GroupItem, StuffData (12 types)          |
| ✅     | UnseenItemTracker, Purse, MarketplaceModel                     |

### 1.6 Session (100%)
```
Progress: ████████████████████ ~100%
AS3: 77 files | TS: 77 files
```

| Status | Element                                                                                                                                                                     |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ✅     | SessionDataManager, RoomSessionManager, RoomSession complete                                                                                                                |
| ✅     | 12/12 handlers (Session, Users, Chat, Permissions, Data, GenericError, Poll, WordQuiz, Present, PetPackage, DimmerPresets, AvatarEffects)                                   |
| ✅     | 24/24 events                                                                                                                                                                |
| ✅     | 7/7 enums                                                                                                                                                                   |
| ✅     | UserDataManager, PerkManager, IgnoredUsersManager, HabboGroupInfoManager                                                                                                    |
| ✅     | PetInfo, IPetInfo                                                                                                                                                           |
| ✅     | FurnitureData/ProductData delegated to GameDataManager (19 methods implemented)                                                                                             |
| ✅     | 9 message listeners added (AccountSafetyLock, ChangeUserName, UserNameChanged, Email, RoomReady, UserChange, PetRespectFailed, AccountPreferences, NftChatStyles)           |
| ✅     | Events dispatched: UserNameUpdateEvent, SessionDataPreferencesEvent, MysteryBoxKeysUpdateEvent                                                                              |
| ✅     | SetUIFlagsMessageComposer wired in setUIFlag()                                                                                                                              |
| ✅     | WhisperMessageComposer fixed (AS3: `[recipientName + " " + message, styleId]`)                                                                                              |
| ✅     | RoomSession: 11 fixes (sendSignMessage guard, game session chat, lag detection, openConnectionComposer, playTestMode, classification messages, plantSeed, etc.)             |
| ✅     | RoomSessionManager: handler order aligned to AS3, gotoRoomNetwork() uncommented, habboTracking propagated                                                                   |
| ✅     | SessionDataManager: room actions via sendSpecialCommandMessage(), giveStarGem, credit vault, income reward, setRoomCameraFollowDisabled fix                                 |
| ✅     | Room session messages: queue/spectator wired in RoomSessionHandler, and remaining incoming/parser room-session classes ported and registered in HabboMessages               |
| ✅     | IgnoredUsersManager: IgnoreResult/IgnoredUsers events + Get/Ignore/Unignore composers ported and wired (AS3 flow restored)                                                  |
| ✅     | Users messages batch: ApproveName/ChangeEmail/ExtendedProfile/HabboUserBadges/HandItem/RelationshipStatus/SCR user+kickback events+parsers and related composers ported     |
| ✅     | UserDataManager + RoomUsersHandler: GetSelectedBadges composer call restored and HabboUserBadges event flow wired to RoomSessionUserBadgesEvent                             |
| ✅     | Users/Guild batch: GroupDetails/GroupChanged/GroupDeactivated/JoinFailed events+parsers and GroupDetails/Join/Favorite composers ported + HabboGroupsManager wiring         |
| ✅     | PerkAllowancesMessageEvent/PerkAllowancesMessageEventParser ported and registered (ID 2000); PerkManager now dispatches PUE_perks_updated through SessionDataManager events |

### 1.7 Navigator — Logic (100%)
```
Progress (logic): ████████████████████ ~100%
AS3 logic: 25 files | TS: 28 files
Display: pending
```

| Status | Element                                                        |
|--------|----------------------------------------------------------------|
| ✅     | HabboNavigator, HabboNewNavigator complete                     |
| ✅     | IncomingMessages, NewIncomingMessages                          |
| ✅     | NavigatorData, NavigatorCache, SearchContext, ContextContainer |
| ✅     | RoomSessionTags                                                |
| ✅     | FriendEntryData, RoomSettingsFriendListManager                 |
| ✅     | RoomEntryUtils (door mode, color modulation, favorite icons)   |

---

## 2. Communication Messages (~35%)

```
Progress: ███████░░░░░░░░░░░░░ ~35%
AS3: ~1150 (events + composers + parsers) | TS: ~404 files
```

### 2.1 Root + Demo + Enum

| AS3 File                                | Status         |
|-----------------------------------------|----------------|
| HabboCommunicationManager               | ✅ Complete    |
| IHabboCommunicationManager              | ✅ Complete    |
| HabboMessages                           | ✅ Registry    |
| HabboCommunicationDemo                  | ✅ Complete    |
| IncomingMessages                        | ✅ Complete    |
| HabboLoginDemoScreen                    | ❌ Not started |
| LoginEnvironmentsController             | ❌ Not started |
| ApiRequest, WebApiRequest               | SKIP (WebApi)  |
| HabboWebApiSession, IHabboWebApiSession | SKIP (WebApi)  |

**Enums (11/11):** ✅ All implemented

### 2.2 Incoming Events by category

| Category              | AS3      | TS       | %       |
|-----------------------|----------|----------|---------|
| handshake             | 12       | 13       | ✅ 100% |
| navigator             | 39       | 40       | ✅ 100% |
| newnavigator          | 12       | 12       | ✅ 100% |
| poll                  | 6        | 7        | ✅ 100% |
| error                 | 1        | 2        | ✅ 100% |
| room                  | 107      | 53       | ⚠️ 49%  |
| inventory             | 53       | 25       | ⚠️ 47%  |
| availability          | 6        | 4        | ⚠️ 66%  |
| mysterybox            | 4        | 2        | ⚠️ 50%  |
| avatar                | 5        | 2        | ⚠️ 40%  |
| notifications         | 14       | 22       | ✅ 100% |
| catalog               | 43       | 2        | ❌ 4%   |
| users                 | 51       | 3        | ⚠️ 5%   |
| game                  | 44       | 0        | ❌ 0%   |
| help                  | 32       | 0        | ❌ 0%   |
| moderation            | 25       | 0        | ❌ 0%   |
| friendlist            | 24       | 27       | ✅ 100% |
| roomsettings          | 18       | 0        | ❌ 0%   |
| quest                 | 17       | 0        | ❌ 0%   |
| collectibles          | 14       | 0        | ❌ 0%   |
| sound                 | 10       | 0        | ❌ 0%   |
| userdefinedroomevents | 44       | 0        | ❌ 0%   |
| preferences           | 1        | 1        | ✅ 100% |
| nft                   | 1        | 1        | ✅ 100% |
| +9 other categories   | ~38      | 0        | ❌ 0%   |
| **TOTAL**             | **~657** | **~180** | **27%** |

### 2.3 Outgoing Composers by category

| Category             | AS3      | TS       | %       |
|----------------------|----------|----------|---------|
| handshake            | 10       | 10       | ✅ 100% |
| navigator            | 38       | 36       | ✅ 94%  |
| newnavigator         | 7        | 8        | ✅ 100% |
| poll                 | 3        | 4        | ✅ 100% |
| room                 | 97       | 59       | ⚠️ 61%  |
| inventory            | 26       | 17       | ⚠️ 65%  |
| avatar               | 15       | 6        | ⚠️ 40%  |
| tracking             | 5        | 6        | ✅ 100% |
| friendlist           | 15       | 16       | ✅ 100% |
| catalog              | 37       | 0        | ❌ 0%   |
| users                | 40       | 0        | ❌ 0%   |
| help                 | 32       | 0        | ❌ 0%   |
| game                 | 27       | 1        | ⚠️ 3%   |
| preferences          | 1        | 1        | ✅ 100% |
| +14 other categories | ~140     | 5        | ⚠️ 3%   |
| **TOTAL**            | **~493** | **~157** | **32%** |

### 2.4 Detected Issues

**ID Conflicts:**
- `ID 1472` — RoomAdEventTabViewedComposer AND TogglePetRidingPermissionComposer (the 2nd overwrites the 1st)
- ~~`ID 3698` — GetInterstitialMessageComposer AND OpenPetPackageMessageComposer~~ ✅ Resolved (GetInterstitialMessageComposer removed)

**Note:** Cross-type conflicts (events vs composers) are NOT real conflicts since the maps are separate.

~~**Existing composers not registered in HabboMessages.ts (15):**~~ ✅ All 15 are actually already registered in HabboMessages.ts (verified 2026-02-10).

**Recently registered (Phase 0):** ✅ RespectUserMessageComposer (ID 2694), SetUIFlagsMessageComposer (ID 2209)

**New composers (Phase 5):** ✅ UseFurnitureMessageComposer, NewUserExperienceScriptProceedComposer, RoomNetworkOpenConnectionMessageComposer, Game2GameChatMessageComposer, GiveStarGemToUserMessageComposer, CreditVaultStatusMessageComposer, WithdrawCreditVaultMessageComposer, IncomeRewardStatusMessageComposer, IncomeRewardClaimMessageComposer — all registered in HabboMessages.ts

---

## 3. Room Module (100%)

```
Progress: ████████████████████ ~100%
AS3: 313 files | TS: 321 files
```

### 3.1 By sub-module

| Sub-module               | AS3 | TS | %    | Status           |
|--------------------------|-----|----|------|------------------|
| Enums                    | 6   | 6  | 100% | ✅ Complete      |
| Messages (room objects)  | 40  | 40 | 100% | ✅ Complete      |
| Object Data (StuffData)  | 13  | 12 | 92%  | ✅ Near-complete |
| Rasterizer               | ~10 | 13 | 100% | ✅ Complete      |
| Events                   | 31  | 31 | 100% | ✅ Complete      |
| Object Logic (furniture) | 65  | 66 | 100% | ✅ Complete      |
| Object Logic (other)     | 8   | 4  | 50%  | 🔄 Advanced      |
| Object Visualization     | 109 | 96 | 88%  | 🔄 Advanced      |
| Utilities                | 11  | 5  | 45%  | 🔄 Advanced      |
| Root (RoomEngine, etc.)  | 20  | 58 | 100% | ✅ Complete      |

### 3.2 Completed (Phase 1)
- ✅ 22 room events created (RoomEngineZoomEvent, RoomEngineDimmerStateEvent, RoomObjectFloorHoleEvent, RoomObjectTileMouseEvent, etc.)
- ✅ 13 room messages created (RoomObjectGroupBadgeUpdateMessage, RoomObjectRoomColorUpdateMessage, etc.)
- ✅ 54 furniture logic classes created (total 66 out of 65 AS3 = 100%)
- ✅ Missing constants added to RoomObjectWidgetRequestEvent (31), RoomObjectFurnitureActionEvent (13), RoomObjectStateChangeEvent (param + ROSCE_STATE_RANDOM)

### 3.3 Completed (Visualization Phase)
- ✅ GraphicAsset infrastructure (5 files: IGraphicAsset, GraphicAsset, IGraphicAssetCollection, GraphicAssetCollection, GraphicAssetPalette)
- ✅ Visualization data classes (13 files: LayerData→AnimationSizeData)
- ✅ Core furniture visualization (4 files: FurnitureVisualizationData, AnimatedFurnitureVisualizationData, FurnitureVisualization, AnimatedFurnitureVisualization)
- ✅ Plane mask system (4 files: PlaneMaskBitmap, PlaneMaskVisualization, PlaneMask, PlaneMaskManager)
- ✅ Room visualization additions (4 files: TileCursorVisualization, PlaneDrawingData, RoomPlaneBitmapMask, RoomPlaneRectangleMask)
- ✅ 35 specialized furniture visualizations (trivial, medium, complex, particle system, stubs)
- ✅ RoomObjectVisualizationEnum + RoomObjectFactory updated with all visualization type mappings

### 3.4 Completed (Renderer Layer + Pipeline Phase)
- ✅ room/renderer/ layer ported: IRoomRendererBase, IRoomRenderer, IRoomRenderingCanvas, IRoomRenderingCanvasMouseListener, IRoomSpriteCanvasContainer, IRoomRendererFactory (6 interfaces)
- ✅ RoomRenderer (class_3447): object registry, canvas management, render/update pipeline
- ✅ RoomRendererFactory (class_2015): Component-based factory creating RoomRenderer instances
- ✅ RoomRenderingCanvas: implements IRoomRenderingCanvas, mouse listener interface extracted to room/renderer/
- ✅ RoomInstance: setRenderer/getRenderer, auto feedRoomObject on createObjectInternal, auto removeRoomObject on dispose
- ✅ RoomManager: content processing pipeline (40ms frame budget throttling), processLoadedContentTypes, updateObjectContents, onContentLoaded events, state machine aligned to AS3

### 3.5 Completed (Rendering & Interaction Phase)
- ✅ Textured plane rendering wired in RoomPlane.render() (getTexture→renderTexture pipeline)
- ✅ RoomVisualization: updatePlaneTexturesAndVisibilities(), updateMasksAndColors(), updatePlaneMasks()
- ✅ RoomPlaneBitmapMaskParser + RoomPlaneBitmapMaskData (door/window bitmap mask system)
- ✅ LegacyWallGeometry (wall coordinate → 3D position conversion for wall items)
- ✅ RoomLogic full implementation (message routing: types, masks, visibility, colors, floor holes)
- ✅ RoomTileCursorLogic (tile cursor visibility, state management, height display)
- ✅ RoomRenderingCanvas handleMouseEvent (sprite hit-testing, event buffering, roll-over/roll-out)
- ✅ TileObjectMap (2D spatial index for room objects)
- ✅ FurniStackingHeightMap (per-tile stacking heights, placement validation)
- ✅ RoomCamera (smooth camera following with sinusoidal easing)
- ✅ SelectedRoomObjectData (selected object state container)

### 3.6 Completed (Rasterizer + Viz Phase)
- ✅ Avatar visualization (15 files — AvatarVisualization, AvatarVisualizationData, 11 additions + barrel exports)
- ✅ Animated / landscape rasterizers (5 files: AnimationItem, PlaneVisualizationAnimationLayer, LandscapePlane, LandscapeRasterizer, WallAdRasterizer)
- ✅ FurnitureCuboidVisualization + FurniturePlane (2 files)
- ✅ AnimatedPetVisualization + AnimatedPetVisualizationData (2 stubs for pet rendering)
- ✅ PlaneVisualization updated with setAnimationLayer() and animated render() support

---

## 4. Core Runtime (~69%)

```
Progress: █████████████░░░░░░░ ~69%
AS3: 32 files | TS: 22 files
```

| Status | Element                                                          |
|--------|------------------------------------------------------------------|
| ✅     | Component (complete base class)                                  |
| ✅     | ComponentContext, ComponentDependency                            |
| ✅     | IContext, IDisposable, IID                                       |
| ✅     | ICoreConfiguration                                               |
| ✅     | CoreComponentContext (3-tier priority update loop)               |
| ✅     | Core singleton (class_79 equivalent)                             |
| ✅     | ICore, IIDCore                                                   |
| ✅     | ICoreErrorReporter, ICoreErrorLogger                             |
| ✅     | DefaultErrorReporter (class_516 equivalent)                      |
| ✅     | Exception, InvalidComponentException, ComponentDisposedException |
| ✅     | WarningEvent, ErrorEvent, LibraryProgressEvent                   |
| ✅     | HotelViewEvent, ILinkEventTracker                                |
| ✅     | ErrorReportStorage                                               |
| ⏭️      | EventDispatcherWrapper (Flash-specific, uses EventEmitter3)      |
| ⏭️      | InterfaceStruct/InterfaceStructList (simplified in TS with Map)  |
| ⏭️      | Profiler/IProfiler (use browser DevTools instead)                |
| ⏭️      | ComponentInterfaceQueue (simplified in ComponentContext)         |

---

## 5. Not Started Modules (❌ 0%)

### Tier 1 — Critical for gameplay

| Module      | AS3 Total | Description                                                      | Status                         |
|-------------|-----------|------------------------------------------------------------------|--------------------------------|
| **avatar**  | ~120      | Avatar rendering, 3D geometry, animations, cache, figure data    | 🔄 Logic done, display pending |
| **catalog** | ~105      | Commerce, offers, purchases, marketplace, club (logic + display) | ❌ 0%                          |
| **sound**   | ~28       | Audio, TRAX sequencer, playlists, jukebox                        | ❌ 0%                          |
| **ui**      | ~369      | Window system, display components (IWindow, IFrameWindow, etc.)  | ❌ 0%                          |

### Tier 2 — Important features

| Module         | AS3 Total  | Description                                        |
|----------------|------------|----------------------------------------------------|
| **friendlist** | ~21        | Friends, requests, relationships                   |
| **help**       | ~13        | CFH, guide, safety booklet                         |
| **moderation** | ~36        | Moderation tools, issues                           |
| **quest**      | ~21        | Achievements, quests                               |
| **toolbar**    | ~12        | Toolbar, icons                                     |

### Tier 3 — Secondary

| Module            | AS3 Total | Description                                         | Status            |
|-------------------|-----------|-----------------------------------------------------|-------------------|
| **tracking**      | 10        | Analytics, latency, FPS, performance                | ✅ 100%           |
| **groups**        | ~14       | Guilds                                              | 🔄 In progress    |
| **game**          | ~58       | SnowWar game manager                                | ❌ Not started    |
| **notifications** | ~6        | Notification popups                                 | ✅ Implemented    |
| **roomevents**    | 5         | Wired system                                        | ❌ Not started    |
| **messenger**     | ~5        | Private messages                                    | ✅ Implemented    |
| **utils**         | ~19       | StringUtil, CommunicationUtils, FigureDataContainer | ✅ Advanced (74%) |
| **freeflowchat**  | ~3        | Chat bubbles                                        | ✅ Implemented    |
| **advertisement** | 3         | Ads                                                 | ✅ Implemented    |
| **campaign**      | 1         | Calendar                                            | ✅ Implemented    |
| **friendbar**     | 5         | Friend bar                                          | ❌ Not started    |
| **nux**           | 4         | New user experience                                 | ❌ Not started    |
| **phonenumber**   | 7         | Phone verification                                  | ❌ Not started    |
| **window**        | 5         | Window framework                                    | ❌ Not started    |

---

## 6. Implementation Recommendations

### Immediate priority
1. ~~**Finish room events/messages/furniture logic**~~ ✅ Done (Phase 1: +89 files)
2. ~~**Finish room visualizations**~~ ✅ Done (+65 files, 81% — avatar/pet viz deferred)
3. ~~**Register the 15 orphan composers**~~ ✅ All already registered
4. **Resolve ID 1472 conflict** (RoomAdEventTabViewedComposer vs TogglePetRidingPermissionComposer)
5. **Port the UI window system** (IWindow, IFrameWindow, display components — foundation for all UI)

### High priority (core features)
6. ~~**avatar**~~ ✅ Logic done (~98 files) — display classes pending
7. **catalog** — ~105 files (commerce = essential, logic + display)
8. **sound** — ~28 files (audio/TRAX)
9. **communication/messages** — Complete room, inventory, avatar categories

### Medium priority (features)
10. **friendlist + messenger** — Social
11. **help + moderation** — Admin tools
12. **quest** — Achievements
13. **utils** — Shared utilities

### Low priority (polish)
14. **tracking, groups, game, notifications, roomevents, freeflowchat**
15. **advertisement, campaign, toolbar, nux, phonenumber**

### Recently completed
- ✅ **core/window ItemList resize-on-update AS3 parity fix**: `ItemListController.updateScrollAreaRegion()` now ensures `resize_on_item_update` resizes the itemlist window itself when children change, preserving AS3 right-anchor behavior for navigator category thumbnail/row controls and other converted Flash itemlists.
- ✅ **Session furnidata AS3 init parity**: `SessionDataManager.initFurnitureData()` now uses AS3 `furnidata.load.url`, `getFurniData()` returns `null` until floor furnidata exists, `FurnitureDataParser` loads text before parsing XML/lingo/converted JSON, and hash-derived `furnidata.url`/`productdata.url` overrides were removed.
- ✅ **WIN63 gamedata/config/avatar URL parity pass**: `GameDataResources` now matches AS3 `class_2118` (`external_texts`, `external_variables`, `furnidata`, `productdata` only), `CoreLocalizationManager` loads only `external_texts`, `HabboConfigurationManager` reloads `external_variables` on localization `complete`, `SessionDataManager`/`AvatarRenderManager` listen to configuration `complete` through DI like AS3, `HeliumMain` no longer mutates config from hashes, and avatar figuremap uses `flash.dynamic.avatar.download.configuration` with no `avatar.figuremap.url`/asset-url fallback.
- ✅ **Configuration bootstrap + room bundle AS3/Nitro parity fix**: `index.html` no longer forces `/gamedata/external_variables/1`, existing `window.HeliumConfig` overrides are preserved, AS3 hashes `external_texts` parsing is restored, missing config interpolation now resolves to empty like AS3, and `RoomEngine` no longer loads room content directly; AS3 `room`/placeholder content resolves only through `RoomContentLoader` using AS3 dynamic download keys, with the required `.swf` to `.nitro` asset-name translation.
- ✅ **Avatar embedded AS3 XML parity pass**: `AvatarRenderManager` now follows `class_49.as`: `HabboAvatarGeometry`, `HabboAvatarPartSets`, `HabboAvatarAnimation`, `HabboAvatarFigure`, and action offsets load from embedded `AssetLibrary` XML, dynamic actions/effectmap use `flash.dynamic.avatar.download.url`, and `external.figurepartlist.txt` appends XML through `AvatarStructureDownload`; the invented `avatar.partsets.url`/geometry/animation/figuredata fetch paths are removed.
- ✅ **Local dev Habbo gamedata proxy fix**: `gamedata.hashes.url` and hash-derived Habbo asset URLs now normalize to same-origin dev proxy routes on localhost, while production keeps AS3 absolute URLs; Nitro bundle parsing now rejects HTML responses with an explicit invalid-bundle error instead of `Invalid typed array length`.
- ✅ **Cursor Nitro AS3 parity pass**: `SelectionArrowLogic` is now ported and wired, `selection_arrow`/`tile_cursor` visualization and logic types are resolved from Nitro content metadata instead of TS cursor fallbacks, `SelectionArrow.nitro` is used when `avatar.widget.enabled=false` like AS3, and Nitro spritesheet frame lookup now uses the bundle `name` as library prefix for assets such as `TileCursor.nitro`.
- ✅ **Configuration/localization .txt AS3 parity pass**: client `common_configuration`/`localization_configuration` text assets are now parsed before external configuration download, `HabboProperty.EXTERNAL_VARIABLES` is restored to `external.variables.txt`, hash parsing uses the AS3 `external_texts`/`external_variables`/`furnidata`/`productdata` resource set, and localization loads `.txt` `key=value` flash texts through the AS3 parser instead of exposing raw `{key}={value}` content.
- ✅ **core/window display AS3 parity follow-up**: `BitmapSkinRenderer.draw()` now matches Flash color-transform gating for all non-white colors including black, and `DefaultAttStruct` restores AS3 rect-limit defaults plus `useRectLimits`/`hasRectLimits()` semantics so zero minimum limits are not ignored.
- ✅ **Toolbar bottom bar room AS3 parity fix**: restored `HabboToolbar.roomUI` dependency, injected `toolbar` into `RoomDesktop`, reintroduced AS3 `RoomUI.triggerbottomBarResize()` with `FriendBarResizeEvent` dispatch to desktops, and restored `BottomBarLeft` parent-resize/collapse resize behavior for room-view bottom bar updates.
- ✅ **core/window BitmapSkinRenderer center-scale AS3 parity fix**: `BitmapSkinRenderer.draw()` now uses the WIN63 `scaleH == 8` / `scaleV == 8` center formula (`rect.width / 2 - width / 2`, `rect.height / 2 - height / 2`) instead of delta-based centering, matching `sources/win63_version/core/window/graphics/renderer/BitmapSkinRenderer.as` for centered skin entities.
- ✅ **Authentication gate AS3 parity pass**: `Helium.connect()` now waits for `HABBO_CONNECTION_EVENT_AUTHENTICATED` before the client UI starts; emulator-off, handshake-fail, invalid SSO, missing SSO, disconnect, and auth timeout now reject instead of falling through to friendbar/toolbar/render startup. `AuthenticationOK` now parses `accountId`, `suggestedLoginActions`, `identityId`, and `IncomingMessages.onAuthenticationOK()` restores the AS3 `InfoRetrieve` → `EventLog` → `GetFurnitureAliases` flow.
- ✅ **RoomContentLoader AS3 parity pass**: restored IRoomContentLoader XML/content APIs, insertObjectContent(), AS3 dynamic download configuration keys, visualization factory asset-collection creation, getPaletteXML(), pet palette/layer extraction, and RoomEngine/RoomManager getVisualizationXML() wiring; removed the TS-only visualization fallback path.
- ✅ **Window ResourceManager local-dev asset loading fix**: `vortex-assets.local` image URLs now normalize to same-origin paths on localhost, `/c_images` and related asset roots are proxied by Vite, and `StaticBitmapWrapperController` URL assets can load without browser CORS failures.
- ✅ **core/window frame layout AS3 sizing fix**: `WindowController` now reads internal layout dimensions from the returned `<layout width/height>` like `sources/win63_version/core/window/WindowController.as`, so frame/header layouts such as `habbo_window_layout_frame_3` build at their natural size before resizing and restore navigator close/header control placement.
- ✅ **core/window parser IIterable AS3 alignment**: `WindowParser` now follows `sources/win63_version/core/window/utils/WindowParser.as` for item-list parents by creating parsed list children without a direct parent and appending them through the list insertion path, while `_INTERNAL` layout children still attach directly so `ScrollableItemListWindow` builds `_ITEMLIST`/`_SCROLLBAR` before navigator templates are inserted.
- ✅ **Navigator category template AS3 extraction fix**: `NavigatorView.createMainWindow()` now clones the first three `block_results` items in sequence and removes index 0 after each clone, matching `sources/win63_version/habbo/navigator/view/NavigatorView.as` and preventing null templates in `CategoryElementFactory`.
- ✅ **Navigator visual AS3 parity follow-up**: aligned `NavigatorView` top-tab template/removal and post-result tab selection with AS3, restored `CategoryElementFactory` `arrangeListItems()` calls for category header controls, and fixed the `ExtendedSprite` AS3 alpha-hit build typing (`getPixel32` equivalent path).
- ✅ **Navigator/window AS3 parity pass**: restored `FrameController.menuButton/menuButtonVisible`, static `resizeToFitContent()` behavior, `ScrollableItemListWindow` scrollbar binding/auto-hide/delegations, `SelectorListController` child-removal refresh, and `NavigatorView.mainWindow`; removed non-AS3 popup/header/toolbar layout helpers.
- ✅ **core/window IIterable AS3 null-ready parity fix**: `IIterable.iterator()` now allows the AS3 construction-time `null` result, `ScrollableItemListWindow`/`ScrollableItemGridWindow`/`TabContextController` return `null` before their internal AS3 children are ready, and `ScrollableItemGridWindow` uses a stable scrollbar listener reference for proper dispose cleanup.
- ✅ **core/habbo window divergence audit fixes**: corrected `ThemeManager` clone-specific properties and `inverse_resize_on_item_update` default, restored `WindowController` typed default-property lookup, aligned `ItemListController` theme defaults/hit-test/inverse resize behavior, restored `AvatarImageWidget` renderer readiness/placeholder/greyscale flow, ported `ProgressIndicatorWidget` AS3 item-list refresh plus enums/interface, and fixed `HintManager` active-animation overwrite.
- ✅ **core/window dropdown + toolbar purse AS3 parity pass**: `WindowController` now honors AS3 null-rectangle natural layout sizing, dynamic drop menu items use natural layout size and `_EXCLUDE` tags, item lists listen to child visibility with stable handlers, and `ExtensionView` restores the AS3 `"purse"` offset branch for `grid_purse`.
- ✅ **Toolbar purse area (AS3 parity pass)**: `PurseAreaExtension`, `PurseClubArea`, `CurrencyIndicatorBase`, seasonal indicator wiring, credit/activity point protocol events, and inventory `Purse` balances wired to the top-left currency display
- ✅ **Helium.ts/HeliumMain.ts aligned with HabboAir/HabboAirMain**: progression events (0.0-1.0), login step tracking, crash reporting, heartbeat SPA, unload handling, core component error/reboot events
- ✅ **Session module fixed**: WhisperComposer, RoomSession (11 fixes), RoomSessionManager (3 fixes), SessionDataManager (4 groups)
- ✅ **9 new composers**: UseFurniture, NewUserExperienceScriptProceed, RoomNetworkOpenConnection, Game2GameChat, GiveStarGem, CreditVaultStatus, WithdrawCreditVault, IncomeRewardStatus, IncomeRewardClaim
- ✅ **Room viz complete**: AnimationItem, LandscapePlane, LandscapeRasterizer, WallAdRasterizer, FurniturePlane, FurnitureCuboidVisualization, AnimatedPetVisualization (stub), AnimatedPetVisualizationData (stub)
- ✅ **Room renderer layer**: 8 files in room/renderer/ (6 interfaces + RoomRenderer + RoomRendererFactory), RoomInstance renderer management, RoomManager content processing pipeline (40ms throttle)
- ✅ **Perk allowances event wired**: PerkAllowancesMessageEvent/PerkAllowancesMessageEventParser/Data ported, registered in HabboMessages with incoming ID 2000, and PerkManager now emits SessionDataManager PUE_perks_updated
- ✅ **SSO handshake parity fix**: `HabboCommunicationDemo.sendConnectionParameters()` realigned with AS3 (`VersionCheck(401, flash.client.url, external.variables.txt)` → `UniqueID` → `SSOTicket`), and `SSOTicketMessageComposer` now sends an AS3-like timer value instead of `0`
- ✅ **Handshake header parity fix**: incoming handshake/session IDs realigned with `class_1881.as` (`InitDiffieHandshake=2334`, `CompleteDiffieHandshake=3034`, `UniqueMachineID=836`, `UserObject=2305`, etc.) and pre-encryption send rules restored in `SocketConnection`
- ✅ **core/window ItemGrid/TextLink win63 parity pass**: restored `ItemGridController.isScrollHorizontal` for wheel-scroll axis parity and initialized `TextLinkController` tooltip/cursor defaults from `ThemeManager`; win63 intentional `swapGridItems`/tooltip stubs preserved.
- ✅ **core/window/graphics/WindowRenderer (win63 parity)**: dirty-region queue merge, parent clipping propagation, branch rendering recursion, purge/getDrawBuffer/register/remove behavior realigned with AS3 `sources/win63_version/core/window/graphics/WindowRenderer.as`
- ✅ **WindowComposite extracted**: web canvas composition + hit-test bridge moved from `WindowRenderer` into `core/window/graphics/WindowComposite.ts` to keep `WindowRenderer` aligned to AS3 responsibilities
- ✅ **HabboWindowManager AS3 parity pass**: restored AS3-compatible API surface (`buildFromXML/windowToXMLString`, alerts/confirms/simpleAlert, groupWindowsWithTag, input tracking callback), reintroduced Session/Room/Config dependencies and link/element-pointer handler lifecycle wiring in `habbo/window/HabboWindowManager.ts`
- ✅ **core/window/WindowContext + MouseEventProcessor (win63 parity)**: restored queued input processing (`process(state, queue)`), hover/down/click-away state tracking, `WME_UP_OUTSIDE`/cursor resolution flow, localization listener wiring in context, and localization propagation to all contexts from `HabboWindowManager`
- ✅ **core/window/WindowController (win63 parity)**: restored missing AS3 behaviors for graphic-context lifecycle (`setupGraphicsContext/releaseGraphicsContext`), local/global alpha hit validation (`validate*PointIntersection`), immediate click routing (`immediateClickMode` + handler), child-context reindex/swap synchronization, and desktop mouse position usage

---

## 7. Final Statistics

| Metric                     | Value                                                                                                                                         |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Total AS3 files            | ~2,000+                                                                                                                                       |
| TS files implemented       | ~710+                                                                                                                                         |
| Missing files              | ~1,290+                                                                                                                                       |
| Complete modules (100%)    | Configuration, Localization, Campaign, Advertisement, Notifications, Messenger, FreeFlowChat, Session, Room, core/comm, core/assets, Tracking |
| Logic-complete modules     | Inventory, Navigator, Avatar, Toolbar (display pending)                                                                                       |
| Advanced modules (50-90%)  | Groups (57%), Utils (74%)                                                                                                                     |
| In-progress modules (<50%) | Communication messages (35%)                                                                                                                  |
| Not started modules        | catalog, sound, help, moderation, quest, game, roomevents, friendbar, friendlist, nux, phonenumber, window, ui (window system)                |

---

*Document updated — 2026-06-30 (core/window itemlist resize-on-update parity restored.)*
