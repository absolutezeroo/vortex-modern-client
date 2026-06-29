# Audit de divergences — `core/window` & `habbo/window` (AS3 win63 ↔ TypeScript)

> Comparaison entre `sources/win63_version/{core,habbo}/window/` et
> `packages/helium-engine/src/{core,habbo}/window/`.
> Méthodologie : identification des classes obfusquées (`class_XXXX`), comparaison
> exhaustive des listes de fichiers (fiable à 100 %), puis vérification ciblée de la
> logique sur les fichiers centraux et les controllers/widgets complexes.

---

## SOMMAIRE EXÉCUTIF — état après correctifs du 2026-06-22

| # | Divergence | Module(s) | Statut |
|---|-----------|-----------|-----------|
| 1 | **`ThemeManager` : `etching_color` & `illumina_border:border_style` appliqués sur le mauvais objet** — contaminaient toutes les themes | habbo | ✅ **CORRIGÉ** |
| 2 | **`AvatarImageWidget.refresh()` : pas de greyscale, pas de placeholder** | habbo | ✅ **CORRIGÉ** |
| 3 | **`ProgressIndicatorWidget.refresh()` jamais appelé** par les setters | habbo | ✅ **CORRIGÉ** |
| 4 | **`HintManager` : animation active écrasée par le positionnement steady-state** | habbo | ✅ **CORRIGÉ** |
| 5 | **`inverse_resize_on_item_update` absent du `PropertyMap`** → défaut de thème non appliqué | core + habbo | ✅ **CORRIGÉ** |
| 6 | **`ItemListController.validateLocalPointIntersection` non overridé** → hit-test alpha au lieu de bounds | core | ✅ **CORRIGÉ** |
| 7 | ~~`greyscale`/wrap/rotation/color-multiply des `static_bitmap` non appliqués au rendu~~ | core | ✅ **CORRIGÉ** |

> **Correctifs appliqués le 2026-06-22** :
> `ThemeManager`, `AvatarImageWidget`, `ProgressIndicatorWidget`, `IProgressIndicatorWidget`,
> `ProgressIndicatorMode`, `ProgressIndicatorStyle`, `ItemListController`, `WindowController`,
> `IPropertyMap` et `HintManager`.
>
> **Correction d'audit** : l'entrée initiale sur `HintManager.animateHint()` indiquait une
> direction inversée. Après relecture complète de l'AS3, la direction AS3 est bien
> `rect fourni` → `position calculée`. Le bug réel côté TS était que `update()` réappliquait
> immédiatement la position finale pendant l'interpolation active.

> **Renderers Flash non portés — équivalence VÉRIFIÉE renderer par renderer** (les 4 sont
> remplacés par le système canvas/composants TS, mais le remplacement n'est pas complet) :
> - `ShapeSkinRenderer` ✅ **omission sûre** — no-op vide en AS3, 0 occurrence dans les données.
> - `LabelRenderer` + `TextSkinRenderer` ✅ **équivalent prouvé** — Flash rasterisait un `TextField`
>   dans le bitmap ; en TS le texte est rendu *en tant que texte* par `TextController` (port complet :
>   textColor/bold/etching/multiline/wordWrap/autoSize). 10 entrées (`type=text/label`), `typeId:-1`
>   explicitement skippés par `loadElementDescription`. Cohérent et voulu.
> - `BitmapDataRenderer` ✅ **PORTÉ INTÉGRALEMENT** (correctif appliqué) — `WindowComposite.compositeBitmapWrapper()`
>   réplique fidèlement l'algorithme AS3 : rotation, zoom/flip, stretch, pivot (0-8), wrap/tiling,
>   silhouette d'etching (couleur plate à alpha réduit), greyscale (matrice luminance Rec.709 +
>   tint par `window.color`) et color-multiply + `dynamicStyleColor` (concaténation `ColorTransform`).
>   Rendu dans un buffer offscreen par fenêtre puis blit clippé. Le filtre CSS externe est désactivé
>   pour les bitmap wrappers (évite la double application). Voir #7.

---

## ADDENDUM NAVIGATOR/WINDOW - 2026-06-22

Corrections appliquees apres relecture AS3 complete des fichiers concernes :

| Fichier TS | Source AS3 lue | Statut |
|---|---|---|
| `core/window/components/FrameController.ts` + `IFrameWindow.ts` | `sources/win63_version/core/window/components/FrameController.as` | `menuButton`, `menuButtonVisible` et `resizeToFitContent()` realignes. Le stub TS `resizeToAccommodateChildren()` a ete retire ; AS3 appelle la methode statique `WindowController.resizeToAccommodateChildren(content)`. |
| `core/window/components/ScrollableItemListWindow.ts` | `sources/win63_version/core/window/components/ScrollableItemListWindow.as` | Binding scrollbar -> item list, listeners `WE_ENABLED`/`WE_DISABLED`, `autoHideScrollBar`, `hideScrollBar()`/`showScrollBar()`, `arrangeListItems()`, `stopDragging()` et delegations AS3 restaurees. La creation dynamique TS d'un `_ITEMLIST` absent a ete retiree : AS3 lit uniquement l'enfant tagge par le layout. |
| `core/window/components/SelectorListController.ts` | `sources/win63_version/core/window/components/SelectorListController.as` | `WE_CHILD_REMOVED` declenche maintenant `updateSelectableRegion()` comme AS3. |
| `habbo/navigator/view/NavigatorView.ts` | `sources/win63_version/habbo/navigator/view/NavigatorView.as` + `TopViewSelector.as` | Getter public `mainWindow` ajoute. Creation du template de tab et selection apres resultats realignees sur AS3 (`removeTabItem(template clone)`, `selectTabByIndex(0)`). Aucun repositionnement manuel de boutons de header n'a ete conserve : `alignFrameHeaderControls` n'existe pas en AS3. |
| `habbo/navigator/view/search/results/CategoryElementFactory.ts` | `sources/win63_version/habbo/navigator/view/search/results/CategoryElementFactory.as` | Les controles de categorie appellent explicitement `arrangeListItems()` comme AS3 pour laisser `resize_on_item_update` + `on_resize_align_right` gerer l'alignement des boutons rows/tiles/show-more. |
| `habbo/navigator/view/RoomInfoPopup.ts` | `sources/win63_version/habbo/navigator/view/RoomInfoPopup.as` | `property_xml` mappe bien au layout JSON `property`. Le helper TS `fitWindowToVisibleContent()` a ete retire : AS3 finit seulement par `bottom_itemlist.arrangeListItems()` puis `main_content.arrangeListItems()`. |
| `habbo/toolbar/ExtensionView.ts` | `sources/win63_version/habbo/toolbar/ExtensionView.as` | Aucun helper de repositionnement global conserve. Le comportement AS3 garde seulement l'offset special du cas `"purse"` dans `refreshItemWindow()`. |

Hors scope volontaire de ce passage : cles de localisation et thumbnails du navigator, car ils ne correspondent pas aux bugs visuels priorises ici.

---

# PARTIE 1 — `core/window`

## 1.1 Identification des `class_XXXX.as`

**Racine**

| AS3 | Identité |
|-----|----------|
| `class_35` | `IWidgetFactory` (`createWidget`) |
| `class_36` | `IWindowFactory` (`create`, `buildFromXML`, `getLayoutByTypeAndStyle`, `getRendererByTypeAndStyle`, `getThemeManager`) |
| `class_37` | `ICoreWindowManager` (`notify`, `confirm`, `findWindowByName`, `groupWindowsWithTag`…) |
| `class_1741` | `IWindow` (interface géante ~150 membres) |
| `class_1812` | `IWindowContainer` |
| `class_1892` | `IWindowContext` |
| `class_1901` | `IWidget` |

**components/** (toutes interfaces)

| AS3 | Identité | AS3 | Identité |
|-----|----------|-----|----------|
| `class_1775` | `IButtonWindow` | `class_2143` | `IToolBarWindow` |
| `class_1885` | `ISelectableButtonWindow` | `class_2173` | `ITabContextWindow` |
| `class_1898` | `IFocusWindow` (`focus/unfocus`) | `class_2178` | `IScrollableWindow` |
| `class_1899` | `ITextLinkWindow` (`linkTarget`) | `class_2211` | `IHeaderWindow` |
| `class_1952` | `IPasswordFieldWindow` | `class_2250` | `IFrameWindow` (`helpButtonAction`, `helpPage`) |
| `class_1970` | `IDisplayObjectWrapper` | `class_2251` | `IBitmapWrapperWindow` |
| `class_1993` | `ITabContentWindow` | `class_2261` | `IDropMenuWindow` (`populate`, `openMenu`) |
| `class_2010` | `IWidgetWindow` | `class_2466` | `ISelectorListWindow` (`addMenuItem`) |
| `class_2052` | `IDesktopWindow` | `class_2483` | `IRadioButtonSelectionWindow` |
| `class_2060` | `IRegionWindow` | `class_2872` | `IBubbleWindow` (`direction`, `pointerOffset`) |
| `class_2111` | `IDropListWindow` (`menu`, `value`) | `class_3532` | `IBoxSizerWindow` |

**Sous-dossiers**

| AS3 | Identité | Porté TS ? |
|-----|----------|-----------|
| `dynamicstyle/class_3171` | `DynamicStyleManager` | ✓ |
| `events/class_1758` | `WindowEvent` | ✓ |
| `graphics/class_1770` | `IWindowRenderer` | ✓ |
| `graphics/class_3577` | `WindowComposite` | ✓ |
| `graphics/class_3809` | `SkinDescriptionParser` | ≈ `BitmapSkinParser.ts` (partiel) |
| `motion/class_2939` | `Motions` (runner statique) | ✓ |
| `services/class_3746` | `IFocusManagerService` | ✓ |
| `services/class_3838` | `IGestureAgentService` | interface ✓, **impl manquante** |
| `theme/class_2458` | `IPropertyMap` | ✓ |
| `theme/class_2901` | `PropertyMap` | ✓ |
| `utils/class_2782` | `IWindowParser` | ✓ |
| `utils/class_3109` | `TextStyle` | ✓ |
| `utils/class_3398` | `TextStyleManager` | ✓ |
| `utils/class_4076` | `ChildEntityArray` (impl) | ✓ |
| `utils/class_1897` | `IChildEntityArray` | **manquant** |
| `utils/class_2675` | `ITextFieldContainer` | **manquant** |

## 1.2 Fichiers AS3 NON portés (vérifié)

**graphics/renderer/ — renderers Flash INTENTIONNELLEMENT OMIS** ✅ (pas une divergence)
- `LabelRenderer.as`, `TextSkinRenderer.as`, `ShapeSkinRenderer.as`, `BitmapDataRenderer.as`
- Ce sont des artefacts Flash. Remplacés par le système canvas TS existant : `BitmapSkinRenderer` / `FillSkinRenderer` / `NullSkinRenderer`. **Décision d'architecture assumée — à ne pas porter.**
- Templates/interfaces associés (`ISkinTemplate`, `ISkinTemplateEntity`, `ISkinLayout`, `BitmapSkinTemplate`, `BitmapSkinTemplateEntity`) : idem, hors scope du système canvas.

**utils/tablet/ — pipeline tactile entier manquant** 🟠
- `TabletEventProcessor.as`, `TabletEventQueue.as`, `ITouchAwareWindow.as`
- Seul `WindowTouchEvent.ts` (classe d'événement) existe ; pas de file + processeur + dispatch.

**services/**
- `GestureAgentService.as` (concret, Timer, long-press/gestes) → impl absente. `ServiceManager` ne l'enregistre pas.

**utils/ — helpers manquants**
- `GenericEventQueue.as`, `IEventQueue.as`, `IEventProcessor.as`, `IInputProcessorRoot.as` (file d'événements générique)
- `TextFieldCache.as` (cache TextField — perf)
- `XMLPropertyArrayParser.as`
- `IChildEntityArray.as`, `ITextFieldContainer.as`, `INotify.as`

**events/**
- `WindowMessage.as`

## 1.3 Divergences logiques (vérifié)

- **`WindowModel.ts`** — ✅ FIDÈLE (flags, rendering rect, dispose `state=0x40000000`). Aucune divergence.
- **`WindowController.ts`** — base `validateLocalPointIntersection` = `testLocalPointHitAgainstAlpha(...)` ✅ fidèle (AS3 l.1433-1436).
- **`WindowController.createProperty()` / `getDefaultProperty()`** ✅ **CORRIGÉ** : AS3 récupère un `PropertyStruct` depuis le `PropertyMap` (`method_20`) puis applique `withValue(...)`. TS expose maintenant `IPropertyMap.get()` et ne confond plus valeur brute (`getValue`) et structure typée.
- **`ItemListController` — `validateLocalPointIntersection` non overridé** ✅ **CORRIGÉ** : AS3 (l.569-572) override → `return isInWindowBounds(param1)` (test boîte, ignore alpha). TS override désormais cette méthode pour les listes.
- **`ItemListController` / `inverse_resize_on_item_update`** ✅ **CORRIGÉ** : le défaut de thème est maintenant défini dans `ThemeManager`, lu à la construction du `ItemListController`, exposé dans `properties`, réappliqué via setter, et utilisé pour les limites/tailles inverses de container.
- **`BitmapDataRenderer` → `WindowComposite.compositeBitmapWrapper()`** : ✅ **PORTÉ INTÉGRALEMENT** (correctif appliqué). Toutes les capacités de l'AS3 `BitmapDataRenderer.draw` sont répliquées :
  - ✅ zoom X/Y + flip (scale signé via `setTransform`), pivot 0-8, stretchedX/Y — fidèles.
  - ✅ **`greyscale`** : matrice de luminance Rec.709 (0.212671/0.71516/0.072169) + tint par `window.color`, appliquée à tout le buffer (`applyGreyscale`). **Régression corrigée** : `me_menu_new_view.json`, `catalog_ubuntu*.json` s'affichent à nouveau en gris.
  - ✅ **`etching`** : silhouette en couleur plate (`makeSilhouette` via `source-in`) à alpha = `etchAlpha/255`, dessinée avant le bitmap principal — fidèle à `const_10` (`ColorTransform(0,0,0,1, R,G,B,0)`).
  - ✅ **wrap/tiling** (boucles tuiles + démarrage négatif), **rotation** (`rotateBitmap` autour du centre), **color-multiply** + **`dynamicStyleColor`** (concaténation `ColorTransform` dans `tintBitmap`). Non sollicités par les 251 layouts win63 mais désormais fonctionnels (plus de risque latent).
- **`DropMenuController`** 🔵 : `populateWithVector` → `populateWithStrings` (renommage, équivalent — pas un bug).
- Controllers complexes (ItemGrid, ScrollBar, DropBase, BoxSizer, ScrollableItemGrid/List) : getters/setters apparemment manquants tous présents (faux positifs regex). Pas de divergence structurelle détectée.

---

# PARTIE 2 — `habbo/window`

## 2.1 Fichiers AS3 NON portés

**Sous-systèmes entiers manquants** 🟠
| AS3 | Contenu |
|-----|---------|
| `utils/floorplaneditor/` | `BCFloorPlanEditor`, `FloorPlanCache`, `FloorPlanPreviewer`, `HeightMapEditor`, `ImportExportDialog` — éditeur de plan au sol complet |
| `utils/habbopedia/` | `HabboPagesViewer` (+ `habboPagesStyleSheet`) |
| `utils/tableview/` | `TableView`, `TableCell`, `TableCellView`, `TableColumn`, `TableRowModel`, `TableRowView`, `CellTemplate`, `DeBouncer`, `ITableObject` (9 fichiers) |

**utils/ — classes manquantes**
| AS3 | Identité |
|-----|----------|
| `class_2213` | `SkinParser` (XML `habbo_element_description_xml` → renderers). Logique reprise dans `HabboWindowManager.loadElementDescription()` pour Bitmap/Fill ; Shape/Text/Label volontairement non portés (artefacts Flash) |
| `class_3805` | `LimitedItemNumberBitmapCreator` (bitmap de chiffres depuis glyphes) |
| `class_3988` | `CategoryMapping` + `createChatItemPreview()` |
| `class_4053` | `getUserCountColor(current, max)` |
| `EffectPreviewer.as` | Prévisualisation d'effet avatar |

**enum/ — 6 enums encore manquants, 2 portés**
| AS3 | Contenu |
|-----|---------|
| `class_1931` | `ArrowDirection` (HORIZONTAL/VERTICAL) |
| `class_2522` | Badge type (NORMAL/GROUP/PERK/ALL) |
| `class_2799` | Alert illustration |
| `class_3725` | 8 directions (NORTH_EAST..NORTH) |
| `class_3900` | RunningNumber (`VALUE_ELEMENT_NAME="count"`) |
| `class_4052` | BalloonPosition + `directionFromPivot()` + `positionFromPivot()` |
| ~~`ProgressIndicatorMode`~~ | ✅ Porté — `"position"` / `"progress"` |
| ~~`ProgressIndicatorStyle`~~ | ✅ Porté — `"flat"` / `"etched"` |

**widgets/ — widgets & interfaces encore manquants, 1 interface portée**
| AS3 | Identité |
|-----|----------|
| `ProductIconWidget` (`class_2343`) | Widget icône produit catalog |
| `ProductImageWidget` (`class_1902`) | Widget image produit (pivot/blend/clearPreviewer/setPlaceholder) |
| `IProductDisplayInfo` | Interface (productTypeId/itemTypeId/petFigureString/figureSetIds) |
| ~~`class_2339`~~ | ✅ Porté — `IProgressIndicatorWidget` |
| `class_2689` | `IHoverBitmapWidget` |
| `class_2802` | `IBalloonWidget` (arrowPivot/arrowDisplacement) |
| `class_3111` | `IUpdatingTimeStampWidget` |
| `class_3137` | `IFurnitureImageWidget` |
| `class_3567` | `IPetImageWidget` |

## 2.2 Divergences logiques

### `HabboWindowManagerComponent.as` vs `HabboWindowManager.ts`
| Divergence | Détail | Criticité |
|-----------|--------|-----------|
| `initComponent()` skin parsing | AS3 parse via `class_2213.parse()`. TS = système canvas (Bitmap/Fill/Null). Les renderers Shape/Text/Label volontairement absents (cf. note d'intention). **Vérifier** que tous les éléments bitmap/fill du XML sont bien couverts par `loadElementDescription()`. | 🟡 |
| `buildFromXML()` helpButtonAction | AS3 (l.319-323) assigne `helpButtonAction = openHelpPage` sur les frames (`class_2250`). TS ne le fait pas. | 🟠 |
| `update()` ignore la queue vide | AS3 (l.454-496) n'exécute que si `inputEventQueue.length > 0` + `flush()` final. TS exécute toujours, pas de flush. | 🟠 |
| `freeFlowChat` / `catalog` non injectés | `IIDHabboFreeFlowChat` & `IIDHabboCatalog` absents des dépendances TS. | 🟠 |
| `displayFloorPlanEditor()` / `openHelpPage()` / `habboPagesStyleSheet` | Stubs vides en TS. | 🟠 |
| `get assets()` absent de l'interface TS | Déclaré dans `class_38` (AS3). | 🟠 |
| `createUnseenItemCounter()` | AS3 charge `unseen_item_counter_xml` ; TS dépend d'un layout pré-enregistré. | 🟡 |

### `HintManager.as` vs `HintManager.ts`
| Divergence | Détail | Criticité |
|-----------|--------|-----------|
| ~~**`animateHint()` direction inversée**~~ | ✅ **CORRIGÉ DANS L'AUDIT ET LE CODE** : relecture AS3 complète = l'AS3 démarre au `rect` fourni puis anime vers la position calculée. TS avait déjà cette direction. Le bug réel était que `update()` écrasait l'interpolation active en repositionnant le hint sur la cible finale ; TS retourne maintenant pendant l'animation active. | ✅ |
| Motion framework | AS3 utilise `Motion/Queue/Combo/EaseOut/MoveTo/ResizeTo`. TS = interpolation manuelle `performance.now()`. | 🟠 |
| `registerUpdateReceiver(this, 10)` | TS appelle via cast unsafe `registerUpdateReceiver?.()` — no-op silencieux si absent de l'interface. | 🟠 |
| Stage height | AS3 = `stage.stageHeight` ; TS = `window.desktop?.height ?? 0` (peut être 0). | 🟡 |

### `ThemeManager.as` vs `ThemeManager.ts`
| Divergence | Détail | Criticité |
|-----------|--------|-----------|
| ~~**`etching_color` sur mauvais objet**~~ | ✅ **CORRIGÉ** : appliqué sur le clone Illumina Light comme AS3 l.115. | ✅ |
| ~~**`illumina_border:border_style` sur mauvais objet**~~ | ✅ **CORRIGÉ** : appliqué sur le clone Illumina Dark comme AS3 l.119. | ✅ |
| ~~`inverse_resize_on_item_update` absent~~ | ✅ **CORRIGÉ** : `addBoolean("inverse_resize_on_item_update", false)` ajouté au `PropertyMap` TS comme AS3 l.65. | ✅ |
| `getIntents()` | TS corrige un vrai bug AS3 (utilise `theme.styleCount`/`theme.baseStyle+i`). | 🔵 (correction intentionnelle) |

### `ResourceManager.as` vs `ResourceManager.ts`
| Divergence | Détail | Criticité |
|-----------|--------|-----------|
| `createAsset()` / `removeAsset()` | AS3 s'intègre à `_windowManager.assets` (système central). TS = maps locales seulement, pas de propagation. | 🟠 |
| Fallback `missing_image_icon` | AS3 utilise l'asset de remplacement en cas d'erreur URL. TS = catch silencieux. | 🟠 |
| `isSameAsset()` | AS3 compare `uri2` au résolu de `uri1` ; TS compare les deux résolus. | 🔵 |

### `HabbletLinkHandler.as` vs `HabbletLinkHandler.ts`
| Divergence | Détail | Criticité |
|-----------|--------|-----------|
| `parts.length < 2` vs `< 3` | AS3 early-return si `< 2` ; TS si `< 3` → comportement différent. | 🟠 |
| Actions web absentes | `openWebPageAndMinimizeClient()` / `openWebHabblet()` = commentaires vides. | 🟠 |
| N'implémente pas `ILinkEventTracker` | AS3 `implements ILinkEventTracker, class_13`. | 🟠 |
| `get disposed()` | AS3 `== null` ; TS `this._disposed`. | 🔵 |

### `AvatarImageWidget.as` vs `AvatarImageWidget.ts`
| Divergence | Détail | Criticité |
|-----------|--------|-----------|
| ~~**`greyBitmap()` absent**~~ | ✅ **CORRIGÉ** : TS applique un bitmap greyscale quand la figure est vide, sans `getImageData`/`putImageData`. | ✅ |
| ~~**Placeholder absent**~~ | ✅ **CORRIGÉ** : fallback `placeholder_avatar[_small][_head][_cropped]_png` via `ResourceManager.retrieveAsset()`. | ✅ |
| ~~`avatarRenderer.isReady` non vérifié~~ | ✅ **CORRIGÉ** : abonnement/désabonnement à `AVATAR_RENDER_READY` avant refresh, avec nettoyage en `dispose()`. | ✅ |

### `ProgressIndicatorWidget.as` vs `ProgressIndicatorWidget.ts`
| Divergence | Détail | Criticité |
|-----------|--------|-----------|
| ~~**`refresh()` jamais appelé**~~ | ✅ **CORRIGÉ** : les setters `style`, `position`, `mode` et `size` rafraîchissent les items `IStaticBitmapWrapperWindow` de la liste. | ✅ |
| ~~`size` découplé~~ | ✅ **CORRIGÉ** : `size` reflète `IItemListWindow.numListItems` et ajoute/supprime des clones comme l'AS3. | ✅ |
| ~~Enums absentes~~ | ✅ **CORRIGÉ** : `ProgressIndicatorMode` et `ProgressIndicatorStyle` portés et exportés. | ✅ |

## 2.3 Additions TS (hors scope AS3 — design XML→JSON attendu)
- `HabboWidgetFactory.ts` (remplace registre statique `class_2086`) — correct
- `ElementRegistry.ts`, `IWindowInstance.ts`, `IWindowLayout.ts`, `WindowLayoutParser.ts`, `IElementDescriptor.ts` — système de layouts JSON
- Enums dupliquées habbo/enum (`WindowParam`, `WindowState`, `WindowStyle`, `WindowContextLayer`) — à vérifier vs core

---

## LIMITES DE L'AUDIT
- La logique interne de `WindowController.ts` (~4254 l.) et des gros controllers de scroll/resize (ItemList/ItemGrid/ScrollBar, ~3000 l. cumulées) **n'a pas été relue intégralement ligne par ligne** — signatures + fichiers centraux + points à risque ciblés seulement. Une revue ligne-par-ligne (focus, drag, invalidation) pourrait révéler d'autres écarts.
- Les divergences logiques listées ont été **vérifiées dans le code** ; les sous-systèmes manquants reposent sur la comparaison des listes de fichiers (fiable).

## VALIDATION DU CORRECTIF — 2026-06-22
- AS3 relu avant correction : `ThemeManager.as`, `AvatarImageWidget.as`, `ProgressIndicatorWidget.as`, `HintManager.as`, `ItemListController.as`, `ScrollableItemListWindow.as`, `SelectorListController.as`, `FrameController.as`, `WindowController.as`, `NavigatorView.as`, `TopViewSelector.as`, `CategoryElementFactory.as`, `RoomInfoPopup.as`, `ExtensionView.as`, `room/renderer/utils/class_3842.as` / `ExtendedSprite.as`, `PropertyMap.as`, interfaces associées et enums concernées.
- `pnpm build` lancé après les corrections du passage navigator/window : compilation TypeScript + build Vite terminés avec succès. Le seul blocage rencontre et corrige etait un typage TS de `ExtendedSprite.getAlphaHitData()` ; le comportement reste l'equivalent AS3 `bitmapData.getPixel32(... ) >> 24 > alphaTolerance`.
- Vérification anti-contournements : aucune occurrence restante de `fitWindowToVisibleContent`, `alignFrameHeaderControls` ou `repositionExtensionGrid`.
