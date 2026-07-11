# Audit indépendant — Helium (Partie 1 : système de fenêtres · Partie 2 : codebase entière)

**Auteur :** Claude, à la demande de Clayton
**Date :** 2026-07-08
**Méthode :** Lecture directe du code TypeScript et comparaison manuelle avec `WIN63-202607011411-782849652` (source AS3 primaire). Ce rapport ne reprend **pas** le contenu de `docs/WIN63_DIVERGENCES_AUDIT.md` ni `docs/AUDIT_AS3_CONFORMITY.md` — ces documents auto-générés ont été utilisés une seule fois comme point de départ pour repérer des pistes, puis chaque piste a été vérifiée manuellement ligne par ligne. Une bonne partie de ce que ces docs signalent comme "divergence high" s'est révélé être du bruit (renommages, changements d'architecture volontaires) ; ce rapport ne liste que ce qui a été confirmé par lecture directe.

**Partie 1 — Périmètre :** `packages/helium-engine/src/core/window/**` et `packages/helium-engine/src/habbo/window/**`, hors parsers et sérialiseurs (`WindowParser.ts`, `WindowXmlAssetParser.ts`, `WindowLayoutXmlSerializer.ts`).

**Partie 2 — Périmètre :** tout `packages/helium-engine/src/**` (2563 fichiers, ~59 600 lignes) et `packages/helium-client/src/**`, via une méthode différente (scan automatisé + vérification manuelle systématique, détaillée en §8).

**Légende de sévérité :**
- 🔴 **Bug confirmé** — comportement runtime incorrect, vérifié avec au moins un appelant réel.
- 🟠 **Fonctionnalité manquante** — no-op documenté ou stub, comportement absent mais pas "faux".
- 🟡 **Dette / lisibilité** — ne casse rien aujourd'hui, coûte cher à maintenir.
- ⚪ **Faux positif écarté** — piste vérifiée et invalidée, listée pour éviter de la re-creuser plus tard.

---

## 1. Bugs confirmés

### 1.1 🔴 `DesktopController.mouseX`/`mouseY` ne sont jamais mis à jour

**Fichier :** `core/window/components/DesktopController.ts:35-46`

```typescript
private _mouseX: number = 0;
public get mouseX(): number { return this._mouseX; }

private _mouseY: number = 0;
public get mouseY(): number { return this._mouseY; }
```

Aucun setter, et rien dans tout le repo n'écrit jamais `desktopInstance._mouseX = ...` ou `.mouseX = ...` en dehors de ce fichier. Ces deux champs restent à `0` pendant toute la durée de vie de l'application.

**Cause racine :** en AS3 (`DesktopController.as:19-26`), `mouseX`/`mouseY` sont des **getters calculés** qui lisent directement `getDisplayObject().stage.mouseX/mouseY` — Flash traque nativement la position de la souris sur le Stage, donc il n'y a aucun état à maintenir. Le porteur a correctement identifié qu'il fallait un champ stocké côté TS (pas de Stage Flash équivalent), mais n'a jamais câblé le côté écriture.

**Ce qui aurait dû l'alimenter :** `WindowContext.inputEventQueue` (statique, partagé entre tous les contexts) est une instance de `MouseEventQueue`, dont `enqueue()` met déjà à jour `_mouseX`/`_mouseY` à chaque événement souris (`MouseEventQueue.ts:67-68`, alimenté depuis `App.ts` via les listeners canvas). La position live existe déjà dans le pipeline, elle n'est simplement jamais relayée vers `DesktopController`.

**Conséquences tracées jusqu'à des appelants réels :**

`Util.containsMouse()` (`habbo/navigator/Util.ts:317-324`) utilise `window.getRelativeMousePosition()`, qui lit `desktop.mouseX/mouseY` (`WindowController.ts:2019-2034`). Comme ces valeurs sont toujours `0`, `getRelativeMousePosition()` retourne systématiquement `(0 - positionGlobaleFenêtre)`, presque toujours négatif → `containsMouse()` retourne quasi-systématiquement `false`, quelle que soit la position réelle de la souris.

Deux appelants réels de `containsMouse()` sont directement affectés :

- `PopupCtrl.onPopup` (`habbo/navigator/PopupCtrl.ts:210`) : sur `WME_OUT`, le code vérifie `!Util.containsMouse(this._popup)` avant de fermer la popup d'info de room — pensé pour éviter de fermer si la souris est encore visuellement dessus. Le check étant toujours vrai, la popup **se ferme immédiatement à chaque `WME_OUT`**, même quand le curseur est encore sur elle.
- `GuestRoomListCtrl.onMouseOut` (`habbo/navigator/mainview/GuestRoomListCtrl.ts:235`) : même schéma pour la surbrillance des lignes de la liste de rooms dans le navigateur — le early-return `if(Util.containsMouse(target)) return;` ne se déclenche jamais, donc la ligne perd sa surbrillance et la popup se ferme plus agressivement que prévu en cas de survol de sous-éléments dans la même ligne.

**Impact perçu par l'utilisateur :** dans le navigateur de rooms, les popups d'info clignotent/se ferment prématurément et le surlignage des lignes est instable au survol. Ce n'est pas un crash, mais c'est visible dès la première utilisation du navigateur.

**Effet secondaire additionnel :** `getAbsoluteMousePosition()`/`getRelativeMousePosition()` sont des méthodes publiques de `IWindow` — n'importe quel futur widget qui s'en servirait hériterait du même bug silencieusement.

**Fix proposé :** remplacer les deux champs stockés par des getters délégant à `WindowContext.inputEventQueue` :

```typescript
public get mouseX(): number
{
    return WindowContext.inputEventQueue?.mouseX ?? 0;
}

public get mouseY(): number
{
    return WindowContext.inputEventQueue?.mouseY ?? 0;
}
```

Nécessite d'importer `WindowContext` dans `DesktopController.ts` — à vérifier qu'il n'y a pas de cycle d'import (`WindowContext` ne semble pas dépendre de `DesktopController` directement, seulement via `Classes` registry, donc a priori sûr). Coût : ~10 lignes, zéro changement d'API publique.

---

## 2. Fonctionnalités manquantes (no-op / stub documenté)

### 2.1 🟠 Aperçus catalogue/inventaire — le plus gros trou fonctionnel

Plusieurs widgets de preview retournent `null` ou loggent `not implemented yet` :

| Fichier | Ce qui manque |
|---|---|
| `habbo/window/widgets/ProductImageWidget.ts:206-213` | Aperçu 3D wall item (`IRoomEngine.getWallItemImage()` non porté) |
| `habbo/window/widgets/ProductImageWidget.ts:212-213` | Aperçu floor item (`getFurnitureImage()` non porté) |
| `habbo/window/widgets/ProductImageWidget.ts:402-415` | Aperçu d'effet pixel (`EffectPreviewer` non porté) |
| `habbo/window/widgets/PetImageWidget.ts:258` + `:400-416` | Rendu bitmap de l'animal — stub, `refresh()` ne fait rien |
| `habbo/window/widgets/FurnitureImageWidget.ts:196` | Rendu bitmap du meuble — stub |
| `habbo/window/widgets/ProductIconWidget.ts:401` | Cache de preview habbicon (`HabbiconAssetManager`) absent |
| `habbo/window/widgets/ChestItemGridOverlayWidget.ts:73` | Glyphes numériques du compteur de contenu non dessinés |

**Conséquence directe vérifiée :** `PetImageWidget._petWidth`/`_petHeight` (déclarés avec getters, jamais assignés — confirmé par scan automatisé, voir §4) restent à `0` en permanence, puisque c'est justement le `refresh()` stub qui, en AS3, mesure le bitmap rendu pour les peupler. C'est un symptôme direct du même trou, pas un bug indépendant.

**Impact :** catalogue et inventaire afficheront des cases vides pour meubles, wall items, animaux et effets.

### 2.2 🟠 `ModalDialog.refresh()` assombrit mal le fond

**Fichier :** `habbo/window/utils/ModalDialog.ts:145-198`

L'AS3 (`ModalDialog.as::refresh()`) capture les couches du desktop en bitmap et applique `ColorTransform(0.25, 0.25, 0.25)` pour assombrir la vue derrière une modale (on voit la room, en sombre). Le port TS fait `desktop.visible = false` : le fond **disparaît complètement** au lieu d'être assombri.

**Impact :** visible à chaque ouverture de dialogue (confirm, alert...).

**Fix :** capture canvas du desktop + `filter: brightness(0.25)` en Canvas 2D avant de masquer, plutôt qu'un simple toggle de visibilité.

### 2.3 🟠 `WindowUtils.disableSection()` — TODOs en fait résolvables

**Fichier :** `core/window/utils/WindowUtils.ts:96-120`

Le commentaire dit "classes obfusquées non identifiables avec confiance". **Faux** — en croisant les `implements` dans le dump AS3 (`grep -rl "implements.*_SafeCls_XXXX"`), les trois classes sont identifiables sans ambiguïté :

- `_SafeCls_2013` → marqueur implémenté uniquement par `ButtonController` (skip complet de la logique de dim pour les boutons, qui gèrent leur propre état visuel désactivé via les state flags)
- `_SafeCls_2254` → marqueur implémenté uniquement par `BorderController`
- `_SafeCls_2326` → marqueur implémenté uniquement par `BackgroundController`

Ces trois branches sont donc portables proprement via `instanceof ButtonController` / `instanceof BorderController` / `instanceof BackgroundController`.

**Sous-bug identifié en creusant plus loin :** `WindowUtils.as::setBlend()` (AS3, lignes 39-46) encode le facteur d'assombrissement directement dans l'octet alpha de `color` pour les instances `_SafeCls_2326` (Background), au lieu d'écrire dans `.blend` :
```as3
if(param1 is _SafeCls_2326)
{
    param1.color = param1.color & 0xFFFFFF | (uint)(param2 * 255) << 24;
}
```
Le port TS (`WindowUtils.ts:31-35`, `getBlend`/`setBlend`) applique `window.blend = targetBlend` uniformément, y compris pour les `BackgroundController`. Comme le renderer TS lit à la fois `.blend` (`globalAlpha` au compositing) et l'alpha de `.color` (fill), le résultat visuel peut diverger de l'AS3 sur les panneaux de fond désactivés. Impact mineur mais réel — pas juste un trou, un vrai écart de comportement.

**Non résolu (celui-là, l'obfuscation gagne vraiment) :** `_SafeCls_2116`, référencé dans la même méthode AS3 pour une branche de recursion alternative (`param1.children` au lieu de `getChildAt()`/`numChildren`), est implémenté par `WindowController` lui-même — c'est un raccourci de perf interne à l'AS3 (éviter la dispatch virtuelle), fonctionnellement équivalent à la branche générique déjà portée. Rien à changer ici.

### 2.4 🟠 Handlers de liens/actions qui ne font rien silencieusement

- `habbo/window/handlers/HabbletLinkHandler.ts:53-58` : les liens `habblet/open/...` (mini-jeux/outils web intégrés) sont interceptés puis... rien, deux branches vides.
- `habbo/window/utils/SimpleAlertDialog.ts:287-291` : les liens `event:...` passent par `context?.createLinkEvent?.(...)` en optional chaining — si `createLinkEvent` n'existe pas sur le contexte réel au runtime, ça échoue silencieusement, aucune erreur visible.
- `habbo/window/HabboWindowManager.ts:938-950` : `openHelpPage()` et `displayFloorPlanEditor()` sont des no-op purs ("to be connected"). Clic sur "Aide" ou l'éditeur de plan → rien.

### 2.5 🟠 Service de gestes — stub littéral

**Fichier :** `core/window/services/ServiceManager.ts:39-44`

```typescript
this._gestureAgent = {
    disposed: false,
    dispose(): void { /* stub */ },
};
```

Pas une classe partielle : un objet littéral vide branché uniquement pour satisfaire le typage `IGestureAgentService`. Confirme et précise le trou tactile déjà identifié plus haut dans la conversation (classes AS3 `GestureAgentService`, `TabletEventProcessor`, `TabletEventQueue` absentes côté TS).

### 2.6 🟠 Liens cliquables dans les bulles de chat non fonctionnels

**Fichier :** `habbo/ui/widget/roomchat/RoomChatItem.ts:1-14`

Commentaire du porteur lui-même :
> clickable links embedded in chat messages (...) are not ported; `ITextWindow` doesn't expose `getCharIndexAtPoint()`/`setTextFormat()` for a text range yet. Messages with links render as plain text for now.

Vérifié : `getCharIndexAtPoint()` et `setTextFormat()` sont bien absents de `ITextWindow`/`TextController`, ainsi qu'un cluster lié (`getLineIndexAtPoint`, `getCharBoundaries`, `getLineText`, `getTextFormat`, etc.) — c'est le seul consommateur identifié de tout ce cluster. Porter uniquement `getCharIndexAtPoint()` + `setTextFormat()` (pas tout le cluster de ~14 méthodes) suffirait à débloquer ce cas précis.

**Impact :** un message de chat contenant un lien s'affiche en texte plat, non cliquable.

### 2.7 🟠 `BalloonWidget` — positionnement de la flèche stubbé

**Fichier :** `habbo/window/widgets/BalloonWidget.ts:233-238`

Le positionnement de la flèche de la bulle de dialogue (dépendant de la position de l'avatar à l'écran) est un TODO explicite non implémenté.

---

## 3. Interfaces incomplètes vis-à-vis de leur implémentation

### 3.1 🟡 `IBitmapWrapperWindow` n'expose pas tout ce que `BitmapDataController` implémente

**Fichiers :** `core/window/components/IBitmapWrapperWindow.ts` vs `core/window/components/BitmapDataController.ts`

`BitmapDataController` implémente déjà `stretchedX/Y`, `zoomX/Y`, `greyscale`, `etchingColor`, `etchingPoint`, `fitSizeToContents`, `wrapX/Y`, `flipX/Y`, `rotation` — mais `IBitmapWrapperWindow` n'expose que `bitmap`, `bitmapData`, `disposesBitmap`, `bitmapAssetName`, `pivotPoint`. Pas un bug runtime, mais tout code manipulant un bitmap wrapper via l'interface doit downcaster vers la classe concrète pour toucher au zoom/flip — une partie des ~268 casts `as unknown as` documentés séparément vient de là.

---

## 4. Scan systématique des "champs morts" (méthode indépendante)

Au-delà des marqueurs `TODO`/`FIXME` et de l'audit auto-généré, j'ai fait un scan par script sur tout `core/window` + `habbo/window` : tout champ `private`/`protected` initialisé avec une valeur par défaut, exposé par un getter public, mais **jamais réassigné nulle part** (dans le même fichier ni par sous-classe dans un autre fichier). Objectif : trouver d'autres cas du type `DesktopController.mouseX` — un champ censé être dynamique mais figé à sa valeur initiale.

**Résultat : un seul cas réel trouvé** (`DesktopController.mouseX`/`mouseY`, déjà détaillé en §1.1). Tous les autres candidats remontés par le scan ont été vérifiés individuellement et écartés :

| Fichier | Champ | Pourquoi ce n'est pas un bug |
|---|---|---|
| `services/WindowMouseListener.ts` | `_eventTypes` | Tableau muté via `.push()`/`.pop()`, jamais réassigné — normal |
| `events/WindowLinkEvent.ts` | `_link` | Pattern factory à pool d'objets (`allocate()` écrit `event._link = ...` sur l'instance recyclée, pas `this._link =`) |
| `events/WindowKeyboardEvent.ts` | `_altKey`, `_ctrlKey`, `_shiftKey`, `_charCode`, `_keyCode`, `_keyLocation` | Même pattern factory à pool |
| `utils/ChildEntityArray.ts` | `_children` | Tableau muté en place (`push`/`splice`) |
| `graphics/renderer/SkinLayout.ts` | `_entities` | Idem |
| `graphics/renderer/SkinTemplate.ts` | `_entities` | Idem |
| `habbo/window/HabboWindowManager.ts` | `_elementRegistry` | Objet dont les méthodes (`.load()`, `.dispose()`) sont appelées, jamais réassigné — normal, c'est le registre lui-même |
| `habbo/window/widgets/LimitedItemGridOverlayWidget.ts` | `_seriesSize` | **Vérifié contre l'AS3** : le setter `seriesSize` est un no-op et le getter retourne toujours `0` **dans l'original aussi** (`LimitedItemGridOverlayWidget.as:92-104`). Comportement fidèle, pas un bug. |
| `core/window/WindowModel.ts` | `_background`, `_blend`, `_visible`, `_clipping`, `_caption`, `_mouseThreshold` | Champs `protected`, assignés par la sous-classe `WindowController.ts` (fichier différent — le scan par fichier unique les avait ratés en première passe, vérifié ensuite par grep ciblé) |
| `core/window/motion/Motion.ts` | `_complete` | Même schéma : assigné par les sous-classes (`Combo`, `Interval`, `Queue`, `Wait`) |

Cette table est incluse pour que le résultat du scan ne soit pas re-creusé inutilement plus tard — chaque ligne a été vérifiée manuellement, pas juste écartée par intuition.

---

## 5. Faux positifs de `docs/WIN63_DIVERGENCES_AUDIT.md` — vérifiés et écartés

L'audit auto-généré existant liste ~1300 divergences "high" pour tout le repo. Un échantillon large a été vérifié manuellement pour `core/window`/`habbo/window` ; la majorité est du bruit de renommage ou de refactor volontaire, pas des bugs :

- `DynamicStyle.getChildStyle()` "absent" → renommé `getChildStyleByTags()`, logique identique (premier tag `#` trouvé dans la liste).
- `DropMenuController.populateWithVector()` "absent" → renommé `populateWithStrings()`, comportement identique.
- `WindowMouseEvent.allocate()` "absent" → renommé `allocateMouse()`, pooling bien présent et fonctionnel.
- `SkinLayout`/`SkinLayoutEntity`/`SkinTemplate` "dispose manquant" → structs de données pures (nombres, strings, un rectangle), aucune ressource à libérer.
- Le gros du total "252 dispose manquants" du résumé global est constitué de `MessageComposer` (hors périmètre `window/`, et sans état à libérer par nature — ce sont des DTOs).
- `GraphicContext.getAbsoluteMousePosition()`/`getRelativeMousePosition()` "absents" → correctement relogés sur `IWindow`/`WindowController` (`WindowController.ts:2019-2058`), qui délègue à `DesktopController.mouseX/mouseY` — c'est-à-dire, ironiquement, exactement les deux champs cassés en §1.1. L'architecture de relogement est correcte ; c'est le bug en amont qui casse la chaîne.

**Fichiers vérifiés en profondeur et jugés fidèles** (aucune divergence trouvée malgré une lecture ligne à ligne) :
- `FocusManager.ts` — 123 lignes TS pour 123 lignes AS3, port quasi ligne-à-ligne.
- `MouseEventProcessor.ts` — gestion du double-clic structurellement identique des deux côtés.
- `DesktopController.ts` (hors le bug mouseX/mouseY) — reste du fichier fidèle.

---

## 6. Points de dette déjà identifiés plus tôt dans la conversation (rappel, non redétaillés ici)

Pour référence, sans reprendre le détail complet :

- `WindowController._lookupCache` jamais invalidé sur `removeChild()` — risque de référence morte dans l'inventaire (`FurniView.ts` active le cache).
- Word-wrap `O(n²)` dans `TextController.wrapLine()`/`wrapLongWord()` — remesure répétée, `ctx.font` réassigné à chaque appel.
- Abonnement `WE_DISPOSED` fragile dans `WindowRenderer.registerRenderable()` — `hasEventListener()` générique au lieu de vérifier son propre callback, fuite possible si un autre code s'abonne en premier.
- Flags d'invalidation numériques magiques (1/2/4/8/16/32) sans `enum` nommé.
- Zéro test dans tout le repo.
- ~268 `as unknown as` dans `core/window` (analysé en détail dans un tour précédent — prompt de refactor produit séparément, jugé pas prioritaire par Clayton pour l'instant).
- Couverture tactile/gestes incomplète vs win63 (`GestureAgentService`, `TabletEventProcessor`, `TabletEventQueue`, `ITouchAwareWindow`).

---

## 7. Synthèse et priorisation (avis)

Si je devais classer par rapport effort/impact :

1. **`DesktopController.mouseX`/`mouseY`** (§1.1) — le seul vrai bug de cette passe, cause racine claire, fix de ~10 lignes, impact UX déjà visible dans le navigateur de rooms. À faire en premier.
2. **`ModalDialog.refresh()`** (§2.2) — visible à chaque dialogue, fix autonome (pas besoin de porter `IRoomEngine` ou `EffectPreviewer`).
3. **Liens de chat cliquables** (§2.6) — fix ciblé (2 méthodes, pas tout le cluster `ITextWindow`) pour une fonctionnalité utilisateur visible.
4. **Aperçus catalogue** (§2.1) — le plus gros en volume, mais dépend de briques non portées (`IRoomEngine.getFurnitureImage()`, `EffectPreviewer`) qui dépassent le périmètre fenêtre pure. À traiter comme un chantier séparé.
5. Le reste (§2.3-2.5, 2.7, §3) est soit très localisé (une ligne de comportement pour le blend des backgrounds), soit déjà connu et backlogué par Clayton lui-même dans le code (commentaires `TODO(AS3)` explicites).

Le §4 (scan de champs morts) et le §5 (faux positifs écartés) sont inclus même s'ils ne débouchent que sur un seul bug net, parce que la valeur est autant dans le "vérifié et sain" que dans le "cassé" — ça évite de re-suspecter ces zones plus tard.

---
---

# PARTIE 2 — Scan de la codebase entière

Suite à la demande d'étendre l'audit au-delà de `core/window`/`habbo/window`. Méthode différente de la Partie 1 : au lieu de partir des marqueurs `TODO`, j'ai fait tourner la même technique de "scan de champs morts" (§4 de la Partie 1) sur l'intégralité de `helium-engine` + `helium-client`, avec un script amélioré qui indexe les assignations **à l'échelle du projet entier** (et non plus fichier par fichier), pour éliminer automatiquement les faux positifs d'héritage cross-fichier qui avaient pollué la première passe.

## 8. Méthode du scan global

Pour chaque champ `private`/`protected` initialisé avec une valeur par défaut et exposé par un getter public, dans **n'importe quel fichier** de `packages/helium-engine/src` et `packages/helium-client/src` (2585 fichiers) :

1. Construire un index global : pour chaque nom de champ (`_foo`), le champ est-il assigné **n'importe où dans tout le projet**, via `this._foo =`, `this._foo op=`, `this._foo++/--`, ou `variable._foo =` (pattern factory à pool d'objets) ?
2. Si non → candidat à vérifier manuellement.

Ce scan a produit **33 candidats** sur l'ensemble du projet (contre 16 en se limitant à `core/window`+`habbo/window` avec l'ancienne méthode par fichier, qui comptait à tort des assignations faites par une sous-classe dans un autre fichier comme "jamais assignées"). Chacun des 33 a été vérifié manuellement.

## 9. Résultat : un nouveau pattern de bug identifié, 3 instances

Le bug `DesktopController.mouseX`/`mouseY` de la Partie 1 (§1.1) n'est pas isolé — c'est une instance d'un **pattern récurrent** dans le porting : quand l'AS3 expose une propriété via un **getter calculé** (qui dérive sa valeur d'un autre objet à chaque appel, sans état stocké), le port TS la transforme parfois en **champ stocké figé à sa valeur initiale**, sans jamais câbler le calcul ou l'écriture correspondante. Le champ existe, le getter existe, tout compile — mais la valeur ne bouge jamais.

Deux nouvelles instances confirmées de ce même pattern, dans `RoomEngine` et `SessionDataManager` :

### 9.1 🔴 `RoomEngine.isDecorateMode` — toujours `false`

**Fichier :** `habbo/room/RoomEngine.ts:204-208`

```typescript
private _isDecorateMode: boolean = false;
get isDecorateMode(): boolean { return this._isDecorateMode; }
```

Jamais assigné. En AS3 (`_SafeCls_90.as:4935-4941`, la vraie classe `RoomEngine`), ce n'est **pas un champ stocké du tout** :
```as3
public function get isDecorateMode() : Boolean
{
    if(!_roomSessionManager) return false;
    var session:IRoomSession = _roomSessionManager.getSession(currentRoomId);
    return session && session.isUserDecorating;
}
```
C'est un getter calculé qui délègue à la session de room active. Côté TS, l'infrastructure de délégation existe partiellement : `RoomSession.ts:318-327` a bien un champ `_isUserDecorating` avec getter/setter fonctionnels — mais **rien n'appelle jamais ce setter non plus** (même bug, un niveau plus loin), et `RoomEngine.ts` n'a même pas de référence à `_roomSessionManager`/`getSession()` pour faire le pont. La chaîne de délégation complète (AS3 : RoomEngine → RoomSessionManager → RoomSession.isUserDecorating) est non câblée aux deux extrémités côté TS.

**Impact actuel :** aucun appelant externe de `roomEngine.isDecorateMode` trouvé dans tout le repo (`grep` sur `.isDecorateMode` en dehors du fichier de déclaration → vide). Un seul usage interne (`RoomEngine.ts:2618`, un raccourci clavier gaté par `!this._isDecorateMode`, donc toujours actif comme si on n'était jamais en mode décoration). **Bug latent, pas encore visible** — mais bloquant le jour où le mode édition de room (déplacement de meubles) sera branché à l'UI.

### 9.2 🟠 `RoomEngine.isGameMode` — pas de setter du tout (contrairement à l'AS3)

**Fichier :** `habbo/room/RoomEngine.ts:211-216`

Même symptôme, cause différente : en AS3 (`_SafeCls_90.as:4945-4952`), `isGameMode` **est** un champ stocké avec un vrai setter public :
```as3
public function set isGameMode(param1:Boolean) : void { _isGameMode = param1; }
```
Deux appelants réels côté AS3 : `SnowWarEngine.as:1069` (`_roomEngine.isGameMode = false` à la fin d'une partie) et `GameArenaView.as:126` (`roomEngine.isGameMode = true` à l'entrée dans l'arène). Côté TS, `RoomEngine.ts` n'expose **aucun setter** pour `isGameMode` — seulement le getter. Le champ interne existe (`_isGameMode: boolean = false`), mais rien dans la classe ne permet de le faire passer à `true`.

**Impact actuel :** zéro appelant (le module SnowWar n'est pas encore branché dans le port). Latent également, mais si/quand un mini-jeu type SnowWar est porté, il n'aura **aucun moyen** de signaler l'entrée en mode jeu au moteur de room tant que ce setter n'existe pas.

### 9.3 🔴 `SessionDataManager.currentTalentTrack` — toujours chaîne vide, avec appelants réels en attente

**Fichier :** `habbo/session/SessionDataManager.ts:659-663`

```typescript
private _currentTalentTrack: string = '';
get currentTalentTrack(): string { return this._currentTalentTrack; }
```

En AS3 (`SessionDataManager.as:1315-1317`), encore un getter calculé sans champ stocké :
```as3
public function get currentTalentTrack() : String
{
    return getBoolean("talent.track.citizenship.enabled") && !isPerkAllowed("CITIZEN") ? "citizenship" : "helper";
}
```

Contrairement aux deux cas précédents, celui-ci a des **appelants réels et actuels**, pas juste latents : `habbo/toolbar/memenu/MeMenuController.ts:164` et `MeMenuNewController.ts:167` référencent explicitement `currentTalentTrack` dans un commentaire pointant vers l'endroit où `GetTalentTrackMessageComposer(currentTalentTrack)` devrait être envoyé — c'est-à-dire que la fonctionnalité "parcours de talent" du menu utilisateur (fonctionnalité Habbo récente : citoyenneté vs. aide) dépend directement de cette valeur, et elle sera toujours vide.

**Fix plus lourd que les deux précédents :** `isPerkAllowed()` existe déjà sur `SessionDataManager` (`SessionDataManager.ts:802-804`), mais `getBoolean()` n'existe **pas du tout** sur cette classe — il vit sur `HabboConfigurationManager.ts:173`, et `SessionDataManager.ts` n'a aucune référence à un gestionnaire de configuration actuellement. Le fix demande donc d'injecter une dépendance supplémentaire, pas juste de réécrire un getter.

## 10. Autres candidats du scan global — vérifiés et écartés (faux positifs)

| Fichier | Champ | Pourquoi ce n'est pas un bug |
|---|---|---|
| `core/assets/NitroAsset.ts`, `core/assets/loaders/NitroBundleLoader.ts` | `_textures` | `Map` mutée via `.set()`/`.clear()` |
| `core/communication/CoreCommunicationManager.ts` | `_connections` | Tableau muté via `.push()`/`.splice()` |
| `core/window/graphics/renderer/SkinLayout.ts`, `SkinTemplate.ts` | `_entities` | Tableaux mutés en place |
| `core/window/services/WindowMouseListener.ts` | `_eventTypes` | Tableau muté via `.push()`/`.pop()` |
| `habbo/catalog/HabboCatalog.ts` | `_utils` | Objet dont les méthodes sont appelées (`.displayProductIcon()`), jamais réassigné — normal |
| `habbo/communication/HabboMessages.ts` | `_composers` | `Map` peuplée via `.set()` (table de dispatch des message composers) |
| `habbo/inventory/HabboInventory.ts` | `_purse` | Propriétés de l'objet mutées directement (`.clubDays =`), pas l'objet lui-même |
| `habbo/quest/AchievementCategories.ts` | `_categoryList` | Tableau via `.push()` |
| `habbo/toolbar/extensions/SettingsExtension.ts` | `_buttons` | Tableau via `.push()` |
| `habbo/window/HabboWindowManager.ts` | `_elementRegistry` | Objet dont les méthodes sont appelées, jamais réassigné — normal |
| `habbo/window/widgets/PetImageWidget.ts` | `_petWidth`, `_petHeight` | Déjà expliqué en Partie 1 §2.1 — conséquence directe du stub `refresh()` sur le rendu bitmap de l'animal, pas un bug indépendant |
| `habbo/room/object/visualization/furniture/AnimatedFurnitureVisualization.ts` | `_frameIncrease` | Vérifié contre l'AS3 : c'est une **propriété overridable**. La classe de base retourne une constante `1`, et `FurnitureSoundblockVisualization.ts` l'override entièrement avec son propre calcul dynamique (`_frameIncreaseOverride`), fidèle à l'AS3 (`_SafeCls_2276.as`). Le champ de la classe de base n'a pas à varier. |

Deux candidats mineurs, déjà auto-documentés par le porteur d'origine (pas de nouvelle information, mentionnés pour être complet) :

- `habbo/catalog/HabboCatalogUtils.ts:37-40` — `_bundleDiscountFlatPriceSteps` toujours `[]`, avec un commentaire `TODO(AS3)` déjà présent dans le code renvoyant vers `HabboCatalogUtils.as`. Paliers de prix pour les remises sur bundles catalogue — jamais peuplés.
- `habbo/catalog/HabboCatalog.ts:173-177` — `_videoOffers` toujours `{enabled: false}`. Pas de commentaire TODO associé, impact incertain (flag de fonctionnalité pour les offres vidéo publicitaires du catalogue — désactivé peut-être intentionnellement).

## 11. Point d'attention hors scan : `habbo/ui` — le module le plus troué du repo (aperçu, non détaillé)

En comptant les marqueurs `TODO(AS3)`/`not implemented yet` par module (hors `core/window`/`habbo/window` déjà couverts en Partie 1) :

| Module | Nombre de marqueurs |
|---|---:|
| `habbo/ui` | 25 |
| `habbo/catalog` | 13 |
| `habbo/inventory` | 8 |
| `habbo/freeflowchat` | 7 |
| `habbo/room` | 4 |

`habbo/ui` (la couche de widgets superposés dans une room — chat, infostand, outils de room) sort largement en tête. Signal le plus fort trouvé sans creuser plus loin : `habbo/ui/RoomDesktop.ts` et `habbo/ui/RoomWidgetFactory.ts` contiennent tous deux le même commentaire — **"only RWE_INFOSTAND is wired up so far"**. Autrement dit, la factory qui distribue les événements de widgets de room vers leurs handlers ne branche aujourd'hui que le popup d'info d'objet (infostand) ; les autres types de widgets listés dans l'AS3 (outils de chat, inspection wired, etc.) ne sont pas raccordés à la factory.

Je n'ai pas creusé plus loin que ce constat — un audit sérieux de `habbo/ui` serait un chantier de la même ampleur que celui déjà fait pour `core/window`/`habbo/window` (25 marqueurs, plusieurs gros fichiers comme `InfoStandWidgetHandler.ts` avec une douzaine de branches `TODO(AS3)` chacune). Je le signale comme prochaine cible logique si tu veux étendre l'audit, mais je ne l'ai pas traité avec le même niveau de rigueur que le reste de ce rapport.

## 12. Synthèse Partie 2

Trois nouveaux bugs confirmés, tous du même pattern architectural ("getter calculé AS3 → champ mort côté TS") :

1. **`SessionDataManager.currentTalentTrack`** (§9.3) — le seul des trois avec des appelants réels aujourd'hui (menu utilisateur "talents"). Priorité la plus haute de la Partie 2, mais fix plus coûteux (nouvelle dépendance à injecter).
2. **`RoomEngine.isDecorateMode`** (§9.1) — latent, chaîne de délégation à réparer aux deux bouts.
3. **`RoomEngine.isGameMode`** (§9.2) — latent, setter à ajouter, bloquant pour un futur portage de mini-jeu.

Le reste du scan (30 candidats) s'est révélé sain — la majorité par mutation de collection en place (pattern normal), confirmant que le porting est globalement discipliné sur ce point précis. La vraie découverte de la Partie 2 n'est pas tant les 3 bugs eux-mêmes (impact limité, 2 sur 3 latents) que la **confirmation qu'il s'agit d'un pattern récurrent** plutôt que d'un accident isolé — utile à savoir si tu portes d'autres classes AS3 avec des getters calculés à l'avenir : vérifier systématiquement si un getter AS3 dérive sa valeur d'ailleurs avant de le traduire en simple champ stocké.

---
---

# PARTIE 3 — Positionnement par rapport à `docs/IMPLEMENTATION_STATUS.md` et rapports complémentaires

## 13. `docs/IMPLEMENTATION_STATUS.md` existe déjà et couvre une partie de ce que ce rapport cherchait à établir

En auditant `habbo/ui` et `habbo/catalog` dossier par dossier (suite logique de la Partie 2), je suis tombé sur `docs/IMPLEMENTATION_STATUS.md` (261 lignes, mis à jour 2026-07-07) — un état des lieux module par module déjà précis et honnête : comptage de fichiers AS3/TS par module, statut ("Advanced" / "Partial" / "Mostly missing" / "Not started"), et pour les modules les plus travaillés, des notes détaillées sur ce qui manque exactement (ex. `habbo/ui` : *"infostand (furni-only), room-tools, and chat-input widgets ported — Chat display (...) and the friend bar list are the next major gaps"*).

**Ce document répond déjà, et bien, à la question "qu'est-ce qui manque".** Une bonne partie de ce que j'ai retrouvé en grepant les `TODO(AS3)` dans `habbo/ui` et `habbo/catalog` (rapports séparés, voir §14) y est déjà documentée, parfois avec plus de précision que ce que j'ai reconstitué moi-même. Continuer à parcourir les dossiers restants (`habbo/inventory`, `habbo/freeflowchat`, etc.) avec la même méthode aurait surtout produit de la redite.

**Ce que ce document ne peut structurellement pas voir : les bugs silencieux.** `IMPLEMENTATION_STATUS.md` mesure la présence de fichiers/fonctionnalités, pas la correction comportementale de ce qui existe. Le pattern trouvé en Partie 2 (`DesktopController.mouseX`, `RoomEngine.isDecorateMode`/`isGameMode`, `SessionDataManager.currentTalentTrack`) — du code qui compile, a l'air fini, mais dont la valeur ne bouge jamais — n'apparaît dans aucun comptage de fichiers ni aucun TODO. Il faut vérifier le comportement runtime pour le voir. C'est là qu'est la valeur ajoutée réelle de ce rapport par rapport à la documentation déjà existante : pas "qu'est-ce qui manque" (déjà bien couvert), mais "qu'est-ce qui a l'air fini mais ne marche pas".

**Recommandation pour la suite :** concentrer un éventuel prochain passage sur les modules qu'`IMPLEMENTATION_STATUS.md` qualifie lui-même d'**"Advanced"** (`core/window`, `habbo/room`, `habbo/session`, `habbo/navigator`, `habbo/window`, `habbo/toolbar`) plutôt que sur les modules "Partial"/"Mostly missing"/"Not started" — dans ces derniers, il y a peu de code "fini" susceptible de cacher un bug du type §9 ; le vrai risque de régression silencieuse est dans le code qui a l'air terminé.

## 14. Rapports complémentaires produits séparément

Deux dossiers ont été audités avant la découverte du document ci-dessus, avec la méthode manuelle habituelle (pas juste du grep TODO — vérification AS3 croisée sur chaque piste retenue). Gardés tels quels car ils apportent des éléments que `IMPLEMENTATION_STATUS.md` n'a pas (comptages exacts, vérification comportementale du chemin d'achat, traçage précis d'un gap jusqu'à son impact utilisateur) :

- **`AUDIT_HABBO_UI.md`** — `habbo/ui` (widgets de room). Comptage exact : 4 types de widgets sur 45 câblés dans la factory (le commentaire du code dit "~35" en trop et est en plus obsolète — il sous-estime même les 4 qui existent). Gap concret tracé : cliquer sur un avatar dans une room ne montre aucune info dans l'infostand (catégorie utilisateur non routée), alors que meubles et animaux fonctionnent.
- **`AUDIT_HABBO_CATALOG.md`** — `habbo/catalog` (catalogue d'achat). Vérification ciblée sur le chemin d'achat (argent réel/virtuel) : calcul de prix affiché avant confirmation correct sur le chemin de base. Module honnêtement auto-documenté, aucun bug silencieux trouvé.

`habbo/inventory` et `habbo/freeflowchat` avaient été identifiés comme prochaines cibles (voir conversation) mais l'audit n'a pas été poussé au-delà d'une vérification rapide une fois `IMPLEMENTATION_STATUS.md` découvert — le gap Pets/Badges/Bots de `habbo/inventory` (onglets présents dans l'UI, cliquables, mais panneau vide car aucune classe `View` ne les rend) a été confirmé mais correspond à ce que le document classe déjà comme *"Advanced logic. Display/user workflows still need parity checks"* — pas d'information nouvelle à en tirer, donc pas de rapport dédié produit.
