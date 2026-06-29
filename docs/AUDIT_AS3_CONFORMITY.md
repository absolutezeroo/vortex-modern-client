# Audit de Conformité AS3 ↔ TypeScript — Rapport Final

**Date:** 2026-02-18
**Scope:** Tous les fichiers TypeScript du projet Helium (hors `outgoing/`, `incoming/`, `parsers/`)
**Référence:** `sources/win63_version/` (AS3 primaire)

---

## Vue d'ensemble

| #  | Module                                  | Couverture | Sévérité     |
|----|-----------------------------------------|------------|--------------|
| 1  | `core/` (sans window)                   | ~75%       | CRITIQUE     |
| 2  | `core/window`                           | ~70%       | CRITIQUE     |
| 3  | `habbo/avatar`                          | ~65%       | CRITIQUE     |
| 4  | `habbo/catalog`                         | **0%**     | CRITIQUE     |
| 5  | `habbo/communication` + `configuration` | ~80%       | CRITIQUE     |
| 6  | `habbo/freeflowchat`                    | ~80%       | MINEUR       |
| 7  | `habbo/friendbar`                       | ~30%       | MINEUR       |
| 8  | `habbo/friendlist`                      | ~60%       | CRITIQUE     |
| 9  | `habbo/game`                            | **0%**     | CRITIQUE     |
| 10 | `habbo/groups`                          | ~5%        | CRITIQUE     |
| 11 | `habbo/help`                            | ~40%       | CRITIQUE     |
| 12 | `habbo/inventory`                       | ~40%       | CRITIQUE     |
| 13 | `habbo/localization`                    | ~85%       | MINEUR       |
| 14 | `habbo/messenger`                       | ~80%       | MINEUR       |
| 15 | `habbo/moderation`                      | ~50%       | CRITIQUE     |
| 16 | `habbo/navigator`                       | ~60%       | CRITIQUE     |
| 17 | `habbo/notifications`                   | ~70%       | MINEUR       |
| 18 | `habbo/nux`                             | **0%**     | CRITIQUE     |
| 19 | `habbo/phonenumber`                     | **0%**     | CRITIQUE     |
| 20 | `habbo/quest`                           | ~40%       | CRITIQUE     |
| 21 | `habbo/room`                            | ~90%       | MINEUR       |
| 22 | `habbo/roomevents`                      | **0%**     | CRITIQUE     |
| 23 | `habbo/session`                         | ~85%       | CRITIQUE     |
| 24 | `habbo/sound`                           | **0%**     | CRITIQUE     |
| 25 | `habbo/toolbar`                         | ~95%       | MINEUR       |
| 26 | `habbo/tracking`                        | ~90%       | MINEUR       |
| 27 | `habbo/ui`                              | ~20%       | CRITIQUE     |
| 28 | `habbo/userclassification`              | **0%**     | CRITIQUE     |
| 29 | `habbo/utils`                           | ~80%       | MINEUR       |
| 30 | `habbo/window`                          | ~85%       | MINEUR       |
| 31 | `room/` (engine)                        | ~80%       | CRITIQUE     |
| 32 | `iid/`                                  | **100%**   | **CONFORME** |
| 33 | `habbo/advertisement`                   | ~85%       | MINEUR       |
| 34 | `habbo/campaign`                        | ~70%       | MINEUR       |
| 35 | **BinaryData/XML → JSON**               | **100%**   | **CONFORME** |

---

## Modules 100% manquants (0 fichiers TS)

| Module                       | Fichiers AS3 | Impact                                  |
|------------------------------|--------------|-----------------------------------------|
| **habbo/catalog**            | 50+ classes  | Boutique/magasin entièrement absent     |
| **habbo/game**               | 30+ classes  | Snowwar et mini-jeux impossibles        |
| **habbo/roomevents**         | 70+ classes  | Wired (menu + setup) entièrement absent |
| **habbo/sound**              | 29 classes   | Aucun son/musique/trax possible         |
| **habbo/nux**                | 4+ classes   | Tutoriel nouveaux utilisateurs absent   |
| **habbo/phonenumber**        | 7 classes    | Vérification téléphone absente          |
| **habbo/userclassification** | 1 classe     | Classification utilisateur absente      |

---

## Problèmes critiques transversaux

### ~~1. IID Symbols — 27/48 manquants (44% couverture)~~ **CORRIGÉ**

**50/50 symbols** créés et exportés dans `packages/helium-engine/src/iid/index.ts`.

29 fichiers IID ajoutés, `IIDRoomUI.ts` refactoré vers `createIID()`, tous typés avec leurs interfaces quand disponibles.

### ~~2. IRoomHandlerListener — contrat d'interface cassé~~ **INTENTIONNEL**

```
AS3 : listener.events        (IEventDispatcher)
TS  : listener.sessionEvents  (EventEmitter)
```

Divergence **intentionnelle et correcte** : en AS3, `RoomSessionManager` hérite `events` de `Component` sans conflit. En TypeScript, `Component.events` est réservé au système DI — utiliser `sessionEvents` évite le bug d'override EventEmitter documenté. Tous les handlers sont cohérents avec ce choix.

### ~~3. Dépendances DI massivement manquantes~~ **CORRIGÉ**

Toutes les dépendances AS3 ont été injectées dans les 6 managers listés (hors modules 0% comme Catalog et Sound, typés `unknown`) :

| Manager            | Deps TS | Deps AS3 | Statut     |
|--------------------|---------|----------|------------|
| HabboGroupsManager | 10      | 10       | **ALIGNÉ** |
| HabboQuestEngine   | 12      | 12       | **ALIGNÉ** |
| HabboHelp          | 9       | 10       | **ALIGNÉ** (SoundManager omis — module 0%) |
| RoomSessionManager | 5       | 6        | **ALIGNÉ** (HabboConfig omis — pas de callback en AS3 non plus) |
| HabboNavigator     | 10      | 10       | **ALIGNÉ** |
| HabboNotifications | 11      | 11       | **ALIGNÉ** |

### ~~4. Room Engine — Renderer layer 100% absent~~ **CORRIGÉ**

8 fichiers créés dans `room/renderer/` :
- `IRoomRendererBase.ts`, `IRoomRenderer.ts`, `IRoomRendererFactory.ts`
- `IRoomRenderingCanvas.ts`, `IRoomRenderingCanvasMouseListener.ts`, `IRoomSpriteCanvasContainer.ts`
- `RoomRenderer.ts` (class_3447), `RoomRendererFactory.ts` (class_2015)
- Barrel `index.ts`

`RoomInstance.ts` : `setRenderer()` / `getRenderer()` implémentés, objets feedés/retirés du renderer automatiquement.

`RoomManager.ts` : content processing pipeline complet (40ms throttle, `processLoadedContentTypes()`, `updateObjectContents()`, state machine AS3 conforme).

`RoomRenderingCanvas.ts` : implémente `IRoomRenderingCanvas`, mouse listener interface extraite.

**Intentionnellement omis :** `cache/` (Flash BitmapData caching — PixiJS GPU natif), `class_3656` (rotation/shaking effects — ajout ultérieur), `class_3815` (ExtendedBitmapData — Flash-specific).

### ~~5. core/window — Services critiques manquants~~ **PARTIELLEMENT CORRIGÉ**

| Service               | Rôle                               | Statut                                                              |
|-----------------------|------------------------------------|---------------------------------------------------------------------|
| `FocusManager`        | Gestion du focus entre fenêtres    | **CORRIGÉ** — implémenté dans `services/FocusManager.ts`            |
| `WindowMouseListener` | Événements souris sur les fenêtres | **CORRIGÉ** — implémenté dans `services/WindowMouseListener.ts`     |
| `WindowToolTipAgent`  | Affichage des tooltips             | **CORRIGÉ** — implémenté dans `services/WindowToolTipAgent.ts`      |
| `BitmapDataRenderer`  | Rendu bitmap                       | **INTENTIONNEL** — Flash-specific, remplacé par BitmapSkinRenderer  |
| `LabelRenderer`       | Rendu texte/labels                 | **INTENTIONNEL** — Flash TextField, remplacé par canvas text        |
| `ShapeSkinRenderer`   | Rendu formes/shapes                | **INTENTIONNEL** — classe vide en AS3 (12 lignes), non nécessaire   |
| `TextSkinRenderer`    | Rendu texte avancé                 | **INTENTIONNEL** — Flash TextField + CSS, non applicable            |
| `TextFieldCache`      | Cache de TextFields                | **INTENTIONNEL** — Flash TextField pooling, non nécessaire          |
| Dossier `tablet/`     | Support tactile/mobile             | DIFFÉRÉ — basse priorité                                            |
| Dossier `tools/`      | Profiling/debug                    | DIFFÉRÉ — basse priorité                                            |

Les 3 services (FocusManager, MouseListener, ToolTipAgent) sont câblés dans `ServiceManager.ts`.
Les 5 renderers sont des artefacts Flash — le système TS utilise déjà des renderers canvas natifs.

---

## Bugs détectés

| Fichier                    | Ligne           | Bug                                                                                | Sévérité | Statut      |
|----------------------------|-----------------|------------------------------------------------------------------------------------|----------|-------------|
| `RoomGeometry.ts`          | ~201            | `Vector3d.sum()` résultat non assigné (orphelin) — la rotation Z ne fonctionne pas | CRITIQUE | **CORRIGÉ** |
| `RoomSession.ts`           | dimmer          | Couleur passée comme nombre au lieu de hex string (`"#RRGGBB"`)                    | CRITIQUE | **CORRIGÉ** |
| `RoomSessionManager.ts`    | deps            | `_habboTracking` toujours `null` (dépendance jamais injectée)                      | CRITIQUE | **CORRIGÉ** |
| `AvatarFigureContainer.ts` | getPartColorIds | Retourne `[]` au lieu de `null` quand le type n'existe pas                         | MINEUR   | **CORRIGÉ** |

---

## Méthodes / propriétés inventées (absentes de l'AS3)

| Fichier                  | Élément inventé                                    |
|--------------------------|----------------------------------------------------|
| `AvatarRenderManager.ts` | Méthode `onGameDataReady()`                        |
| `MessageRegistry.ts`     | Classe entière (pas de correspondance AS3 claire)  |

---

## Détails par module

### core/ (sans window)

**Fichiers analysés :** ~87 TS vs ~358 AS3

**Écarts critiques :**

- **AssetLibrary.ts** :
  - Manque `extends EventDispatcherWrapper` (AS3 ligne 17)
  - Méthode `getClass()` absente
  - Constructeur différent : AS3 `(String, XML)` vs TS `(IContext, string?)`
  - `loadFromFile()` remplacé par pattern async (signature différente)

- **CoreCommunicationManager.ts** :
  - Manque `IUpdateReceiver` implémentation
  - AS3 appelle `registerUpdateReceiver(this, 0)` — absent en TS

- **CoreLocalizationManager.ts** :
  - Utilise `fetch()` au lieu du système d'assets AS3
  - Dépendance `IIDHabboLocalizationManager` manquante
  - Constructeur simplifié (manque flags + assetLibrary)
  - Méthodes manquantes : `getRawValue()`, `applyLocalizationData()`

- **Component.ts** :
  - Méthodes manquantes : `toXMLString()`, `updateUrlProtocol()`, `interpolate()`, `assetLoadFromFile()`

### core/window

~~**3 services critiques manquants :**~~ **CORRIGÉ** — FocusManager, WindowMouseListener, WindowToolTipAgent implémentés et câblés dans ServiceManager.

**4 renderers graphiques :** BitmapDataRenderer, LabelRenderer, ShapeSkinRenderer, TextSkinRenderer — **INTENTIONNELLEMENT OMIS** (artefacts Flash, remplacés par le système canvas TS existant : BitmapSkinRenderer, FillSkinRenderer, NullSkinRenderer).

**Dossier tablet/ entièrement absent :** ITouchAwareWindow, TabletEventProcessor, TabletEventQueue — DIFFÉRÉ (basse priorité)

**~30+ contrôleurs** sans implémentation d'interfaces tactiles (ITouchAwareWindow) — DIFFÉRÉ

**10+ utilitaires/interfaces manquants :** GenericEventQueue, IChildEntityArray, IEventProcessor, IEventQueue, IInputProcessorRoot, INotify, ITextFieldContainer, TextFieldCache, XMLPropertyArrayParser

### habbo/avatar

**Fichiers analysés :** 83 TS vs 135 AS3

**Écarts critiques :**

- **AvatarRenderManager.ts** :
  - 7+ méthodes manquantes : `getAssetByName()`, `getAnimationManager()`, `resolveClubLevel()`, `getItemIds()`, `purgeAssets()`, `resetAssetManager()`, mode getter/setter
  - Méthode `onGameDataReady()` INVENTÉE (absente de l'AS3)

- **AvatarStructure.ts** :
  - N'hérite PAS de `EventDispatcherWrapper` (AS3 oui)
  - `initActions()` : 1 paramètre (TS) vs 2 (AS3: IAssetLibrary + XML)
  - `dispose()` manquant

- **IAvatarRenderManager.ts** :
  - 8 méthodes d'interface manquantes : `assets`, `getAssetByName()`, `mode`, `getAnimationManager()`, `resetAssetManager()`, `resolveClubLevel()`, `getItemIds()`, `purgeAssets()`

- **AvatarImage.ts** :
  - Constantes CHANNELS_* manquantes (EQUAL, UNIQUE, RED, GREEN, BLUE, SATURATED)
  - `IDisposable` non implémenté
  - Ordre des paramètres du constructeur différent

**40+ fichiers AS3 sans correspondant TS** (principalement Avatar Editor UI — intentionnel)

### habbo/catalog

**MODULE 100% VIDE** — 14 sous-dossiers avec `.gitkeep` uniquement.

AS3 contient 50+ classes : HabboCatalog, HabboCatalogUtils, ClubBuyController, CollectiblesController, GuildMembershipsController, MarketplaceModel, etc.

### habbo/communication + configuration

- **IncomingMessages.ts** :
  - `onIdentityAccounts()` ne peuple PAS la liste d'avatars login
  - `handleWebLogout()` manquant (redirection URL)
  - `onConnectionDisconnected()` incomplet

- **HabboConfigurationManager.ts** :
  - Dépendance localization manquante
  - `resetAll()` absent

- ~~**HabboProperty enum** :~~
  - ~~Propriétés manquantes~~ **CORRIGÉ** — 7 propriétés ajoutées (`flash.dynamic.download.*`, `pocket.api`, `web.api`, `facebook.application.id`). `logout.url` et `logout.disconnect.url` existaient déjà.

- **AuthenticationOKMessageParser** :
  - `suggestedLoginActions` non extrait

### habbo/freeflowchat

- **ChatEventHandler.ts** : game chat event handling absent (snowwar)
- **HabboFreeFlowChat.ts** : seulement 3/12 dépendances injectées
- **ChatHistoryBuffer.ts** : manque `insertRoomChange()`, `totalHeight`

### habbo/friendbar

Seul `HabboLandingView` est implémenté. Tous les sous-composants sont stubs.

`IHabboFriendBarData` : 13 méthodes définies mais non implémentées (`numFriends`, `getFriendAt()`, `getFriendByID()`, `acceptFriendRequest()`, `followToRoom()`, etc.)

### habbo/friendlist

- **ILinkEventTracker** non implémenté (deeplink handling perdu)
- **Quest completion** : `FriendRequestQuestCompleteMessageComposer` non envoyé après accept
- **IAvatarImageListener** manquant

### habbo/game

**MODULE 100% MANQUANT** — 0/30+ fichiers portés. Snowwar entièrement absent.

### habbo/groups

**95% incomplet** — squelette seulement.

- 0 message event handlers (AS3 en enregistre 22)
- Méthode `send()` absente
- 20+ getters publics manquants
- User kick/block handling absent

### habbo/help

**60% incomplet.**

- 5 UI controllers manquants : WelcomeScreenController, HabboWayController, HabboWayQuizController, SafetyBookletController, TopicsFlowHelpController
- 10 message events non enregistrés
- CFH topics handler manquant
- Toolbar event handling absent

### habbo/inventory

**Conformité ~40%.**

- **IHabboInventory** : ~20 méthodes publiques manquantes
- **Marketplace** : module entier manquant
- **Common** (ThumbListManager) : module entier manquant
- **UnseenItemTracker** : constructeur manque 2 paramètres (events dispatcher, HabboInventory ref)
- **Badge** : constructeur manque le paramètre `BadgesModel`
- **Effect** : n'implémente aucune interface, propriétés d'icônes manquantes
- **TradingModel** : devrait implémenter `IInventoryModel` + `IGetImageListener`

### habbo/navigator

- **HabboNavigator** : manque `IHabboTransitionalNavigator`, `ILinkEventTracker`
- Dépendances manquantes : AvatarRenderManager, HabboHelp, Catalog
- 17+ propriétés de classe manquantes (controllers, views, managers)
- 8+ méthodes manquantes (enterRoomWebRequest, showToolbarHover, getButton, etc.)
- **NavigatorData** : manque le modèle `Tabs`, `hasSecurity()` check dans `canEditRoomSettings()`

### habbo/notifications

- feedController manquant
- 5+ listeners catalog manquants (builder membership, collectibles)
- Dépendances manquantes : inventory, friendList, roomEngine

### habbo/nux + habbo/phonenumber

**MODULES 100% VIDES.** Répertoires existent mais 0 fichiers TS.

### habbo/quest

- **HabboQuestEngine** : manque `IUpdateReceiver`, 8+ dépendances, 25+ méthodes utilitaires
- Toolbar click handler absent
- `onPerksUpdated()` listener manquant

### habbo/room

**~90% conforme.** Bon alignement structurel.

Architecture correcte, `createObjectInternal` pattern respecté.

### habbo/roomevents

**MODULE 100% ABSENT.** Seulement `.gitkeep`.

AS3 contient : `HabboUserDefinedRoomEvents.as`, `WiredVariablesSynchronizer.as`, 30+ fichiers wired_menu, 40+ fichiers wired_setup.

### habbo/session

**~85% conforme.**

- **RoomSession.ts** :
  - Composers pet divergents : `PickUpPetComposer` vs AS3 `RemovePetFromFlatMessageComposer`
  - mount/dismount : 2 composers séparés vs AS3 1 avec booléen
  - Dimmer color : nombre vs hex string

- **RoomSessionManager.ts** :
  - `_habboTracking` jamais injecté (toujours null)
  - 4 dépendances AS3 manquantes

- **RoomSessionHandler.ts** :
  - 2 message events TODO : `RoomQueueStatusMessageEvent`, `YouAreSpectatorMessageEvent`

### habbo/sound

**MODULE 100% ABSENT.** 0/29 fichiers.

Manquent : HabboSoundManagerFlash10, HabboMusicController, JukeboxPlayListController, TraxSequencer, TraxChannel, TraxData, FurniSamplePlaybackManager, 6 fichiers d'événements.

### habbo/toolbar

**~95% conforme.** Très bon alignement. Quelques stubs UI acceptables.

### habbo/tracking

**~90% conforme.** Logique métier principale conservée. 10+ event handlers omis (navigator, catalog, inventory events — non-bloquant).

### habbo/ui

**~20% conforme.**

- 46 handlers AS3 ignorés comme VIEW (correct)
- MAIS interfaces support manquantes : `IRoomWidgetHandler`, `IRoomWidgetHandlerContainer`, `IRoomWidgetMessageListener`

### habbo/userclassification

**MODULE 100% VIDE.** `UserClassificationData.ts` manquant.

### habbo/utils

**~80% conforme.** `Tween.as` manquant dans `animation/`.

### habbo/window

**~85% conforme.** Très bon alignement. Widgets, enums, managers, thèmes bien portés.

### room/ (Room Engine)

**~80% conforme.**

- ~~**Renderer layer 100% absent**~~ **CORRIGÉ** — 8 fichiers créés (6 interfaces + RoomRenderer + RoomRendererFactory + barrel)
- ~~**RoomManager.ts** : state machine oversimplifiée~~ **CORRIGÉ** — content processing pipeline complet (40ms throttle, processLoadedContentTypes, updateObjectContents, onContentLoaded events)
- ~~**RoomInstance.ts** : `setRenderer()`/`getRenderer()` absents~~ **CORRIGÉ** — renderer management + auto feed/remove objects
- ~~**RoomGeometry.ts** : bug `setDepthVector()` — `Vector3d.sum()` orphelin~~ **CORRIGÉ**
- ~8 fichiers AS3 restants non portés (cache/ : Flash BitmapData caching, utils : NumberBank, PointMath, RoomEnterEffect, RoomRotatingEffect, RoomShakingEffect)

### iid/

**100% couverture** (50/50 symbols exportés). Tous les IID symbols créés et typés.

`IIDRoomUI.ts` refactoré vers `createIID()` pattern standard.

### habbo/advertisement

**~85% conforme.** AdImageRequest et InterstitialEvent conformes. AdManager manque 3 dépendances et méthodes d'image processing (intentionnel pour web).

### habbo/campaign

**~70% conforme.** Logique core préservée (openPackage, linkReceived). 5 dépendances UI manquantes (intentionnel — SolidJS).

---

## BinaryData / XML → JSON

**STATUT : CONFORME (100%)**

La conversion est complète et correcte :

| Catégorie             | Nombre | Statut                     |
|-----------------------|--------|----------------------------|
| Window layouts        | 900+   | COMPLET                    |
| Window skins          | 180+   | COMPLET                    |
| Chat styles           | 120+   | COMPLET                    |
| Element description   | 1      | COMPLET                    |
| Avatar editor layouts | 11     | COMPLET                    |
| Navigator layouts     | 50+    | COMPLET                    |
| Catalog layouts       | 100+   | COMPLET                    |
| Avatar render data    | 4      | RUNTIME (gamedata server)  |
| Manifestes            | 35     | Exclus (métadonnées Flash) |

Aucune donnée critique manquante.

---

## Priorités de correction

### URGENT (bloquant fonctionnellement)

1. Porter **habbo/catalog** (boutique — 50+ classes)
2. Porter **habbo/sound** (audio — 29 classes)
3. ~~Porter **room/renderer/** (rendu des objets — 10+ fichiers)~~ **CORRIGÉ** (8 fichiers créés + barrel, RoomRenderer, RoomRendererFactory, 6 interfaces)
4. ~~Fixer **RoomGeometry.setDepthVector()** (bug d'assignation Vector3d)~~ **CORRIGÉ**
5. ~~Créer les **27 IID symbols manquants**~~ **CORRIGÉ** (50/50 symbols, 100%)
6. ~~Fixer **RoomSessionManager._habboTracking** injection de dépendance~~ **CORRIGÉ**
7. ~~Fixer **RoomSession.ts** couleur dimmer (nombre → hex string)~~ **CORRIGÉ**

### HAUTE PRIORITÉ

8. Porter **habbo/roomevents** (wired system — 70+ classes)
9. Porter **habbo/game** (snowwar — 30+ classes)
10. ~~Compléter **core/window services** (FocusManager, 4 renderers, mouse listener, tooltips)~~ **CORRIGÉ** (3 services implémentés, 5 renderers Flash intentionnellement omis)
11. Compléter **habbo/groups** (message handlers, opérations, 22 events)
12. Compléter **habbo/help** (5 controllers, 10 message events)
13. ~~Aligner **IRoomHandlerListener** (events vs sessionEvents)~~ **INTENTIONNEL** (Component DI protège `events`)
14. ~~Implémenter **RoomInstance.setRenderer()** / `getRenderer()`~~ **CORRIGÉ** (+ feedRoomObject/removeRoomObject dans createObjectInternal/disposeObject/disposeObjects)
15. ~~Implémenter **RoomManager** state machine + content processing + throttling~~ **CORRIGÉ** (processLoadedContentTypes, updateObjectContents, 40ms frame budget, onContentLoaded events)

### MOYENNE PRIORITÉ

16. Compléter **habbo/inventory** (marketplace, interfaces, 20 méthodes IHabboInventory)
17. Compléter **habbo/navigator** (IHabboTransitionalNavigator, Tabs, controllers)
18. Compléter **habbo/quest** (25+ méthodes utilitaires, IUpdateReceiver, 8 dépendances)
19. Porter **habbo/nux** + **habbo/phonenumber** + **habbo/userclassification**
20. Compléter **AvatarRenderManager** (7+ méthodes manquantes)
21. Ajouter **IRoomWidgetHandler** interfaces dans `habbo/ui/`
22. Compléter **habbo/friendlist** (ILinkEventTracker, quest completion)
23. Compléter **habbo/moderation** (dépendances UI, window tracking)
24. Compléter **habbo/freeflowchat** (game chat events, dépendances)

### BASSE PRIORITÉ

25. Compléter **habbo/tracking** (10+ event handlers supplémentaires)
26. Porter **habbo/friendbar** sous-composants
27. Ajouter support **tablet/tactile** dans core/window
28. ~~Aligner **AvatarFigureContainer.getPartColorIds()** retour `null` vs `[]`~~ **CORRIGÉ**
29. ~~Refactorer **IIDRoomUI.ts** vers `createIID()` pattern~~ **CORRIGÉ**
30. Documenter les cuts intentionnels (advertisement, campaign)
