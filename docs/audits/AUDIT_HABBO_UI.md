# Audit indépendant — `habbo/ui` (widgets superposés dans une room)

> **Contexte :** ce dossier est aussi couvert par `docs/IMPLEMENTATION_STATUS.md` (ligne `habbo/ui` : *"Mostly missing... infostand (furni-only), room-tools, and chat-input widgets ported"*). Ce rapport ne redit pas ce constat général — il apporte le comptage exact (§1), une correction d'un commentaire obsolète dans le code (§2), et un gap comportemental précis non mentionné dans le doc de statut (§3, l'infostand utilisateur — résolu depuis, voir §3). Voir `AUDIT_WINDOW_SYSTEM.md` §13-14 pour le contexte complet.
>
> **Suite de l'audit (2026-07-09, §5-9) :** couverture des zones listées "non vérifié" dans la version précédente — `ChatWidgetHandler.ts`, `ChatInputWidgetHandler.ts`, `widget/roomtools/*`, `widget/roomchat/*` (hors `RoomChatItem.ts`). Trouvaille principale : `RoomToolsHistory.ts` désactive une fonctionnalité déjà terminée (liste des rooms visitées) à cause d'une prémisse obsolète — voir §7.

**Périmètre :** `packages/helium-engine/src/habbo/ui/**` (61 fichiers, ~10 170 lignes). Chat, infostand, outils de room, factory de widgets.
**Méthode :** lecture directe + comparaison AS3 ciblée sur les points les plus significatifs. Pas un audit ligne-à-ligne exhaustif des 61 fichiers (voir §9 pour ce qui n'a pas été vérifié).

## 1. Constat principal : 4 types de widgets sur 45 sont câblés

`RoomWidgetFactory.ts` et `RoomDesktop.ts` gèrent chacun un `switch(type)` qui ne couvre que 4 cas : `RWE_INFOSTAND`, `RWE_ROOM_TOOLS`, `RWE_CHAT_INPUT_WIDGET`, `RWE_CHAT_WIDGET`. L'AS3 (`RoomWidgetFactory.as`) en gère **45** (compté précisément par grep sur les `case "RWE_..."`, pas juste "~35" comme l'estime le commentaire du code lui-même).

Widgets absents notables, avec impact utilisateur direct si un jour sollicités : `RWE_ME_MENU` (menu utilisateur), `RWE_DOORBELL` (sonnette de room privée), `RWE_LOADINGBAR` (barre de chargement de room), `RWE_ROOM_QUEUE` (file d'attente room pleine), `RWE_AVATAR_INFO`, `RWE_FURNITURE_CONTEXT_MENU`, `RWE_EFFECTS`, `RWE_MANNEQUIN`, `RWE_YOUTUBE`/`RWE_VIMEO` (lecteurs vidéo intégrés), `RWE_CRAFTING`, `RWE_ROOM_POLL`.

C'est un chantier connu — le code le dit lui-même sans détour (`TODO(AS3)` en en-tête des deux fichiers). Rien de caché ici, contrairement aux bugs des Parties 1-2. Je le documente surtout pour donner le chiffre exact et la liste précise, plus utile que "des widgets manquent".

## 2. Commentaire obsolète dans `RoomDesktop.ts:542` — ✅ Résolu (2026-07-09)

Le docstring dit *"only RWE_INFOSTAND is wired up so far"* — faux, le switch juste en dessous gère 4 cas, pas 1. Le commentaire n'a pas été mis à jour au fur et à mesure que `RWE_ROOM_TOOLS`, `RWE_CHAT_INPUT_WIDGET` et `RWE_CHAT_WIDGET` ont été ajoutés. Pas un bug fonctionnel, mais trompeur pour quiconque lit uniquement le commentaire (risque de ré-implémenter par erreur un widget déjà fait). Fix : mettre à jour le commentaire, une ligne.

**Résolution :** commentaire corrigé (liste les 4 types réellement câblés + le total AS3 de 45).

## 3. Gap fonctionnel concret trouvé dans une partie "faite" : pas d'info utilisateur dans l'infostand — ✅ Résolu (2026-07-09)

`InfoStandWidgetHandler.ts:263-282` (`handleGetObjectInfoMessage`) ne route que les catégories `10`/`20` (meuble sol / meuble mur) vers l'affichage d'info. La catégorie `100` (utilisateur — cliquer sur un avatar dans la room) est un `TODO(AS3)` explicite, non routée.

**Impact :** cliquer sur un avatar dans la room pour voir sa fiche (infostand utilisateur — pseudo, motto, badges) ne fait rien. Cliquer sur un meuble ou un animal fonctionne. C'est le seul gap fonctionnel "silencieux" trouvé dans ce module (les autres sont tous auto-documentés en tête de fichier) — celui-ci est enterré au milieu d'un switch, pas signalé en en-tête de fichier, donc plus facile à rater en lisant vite.

**Résolution :** catégorie 100 routée (user/bot/object), `InfoStandUserView`/`InfoStandBotView` portées pour de vrai (identité : avatar, motto, statut en ligne, lien profil). Le clic sur le lien du pseudo ouvre en plus le profil étendu complet (nouveau `ExtendedProfileWindowCtrl`, scope de base). Deux bugs indépendants trouvés et corrigés en cours de route (composer `GetExtendedProfileMessageComposer` jamais enregistré dans `HabboMessages.ts` ; `HabboGroupsManager` qui ne s'initialisait jamais à cause d'une dépendance DI requise mais jamais fournie) — voir `docs/IMPLEMENTATION_STATUS.md` pour le détail complet. Groupes/statut de relation/glow de badge restent `TODO(AS3)` (scope Phase 2, non traité).

## 4. Ce qui a été vérifié sain

`InfoStandWidgetHandler.ts` (449 lignes) contient un commentaire d'intention explicite : *"no case from `getWidgetMessages()` is silently dropped from the switch"* — vérifié exact, chaque branche non portée logge explicitement au lieu d'échouer en silence. C'est le seul fichier du repo où j'ai vu cette discipline affichée aussi clairement ; positif à noter.

Le scan de champs morts (méthodologie du rapport précédent, §8-9) appliqué à l'ensemble du projet n'a remonté **aucun** candidat dans `habbo/ui/**` — pas de propriété figée à sa valeur initiale ici.

## 5. `ChatWidgetHandler.ts` — un gap non documenté, une justification obsolète, et deux confirmations de corruption connue

**Gap non documenté : aucun gate sur la préférence "free-flow chat".** L'AS3 propre (`win63_version`, ligne 160) enveloppe tout le traitement des messages de chat dans `if(_container.freeFlowChat && !_container.freeFlowChat.isDisabledInPreferences) { ... }` — un garde positif : le système de bulles "classique" (`RoomChatWidget`) ne doit tourner que si `freeFlowChat` existe et n'est pas désactivé par l'utilisateur. `ChatWidgetHandler.ts` (TS) n'a **aucun** équivalent — `processEvent()` traite toujours les événements de chat, sans condition. Absent de tout commentaire/TODO dans ce fichier.

**Nuance importante avant de le corriger :** `IRoomWidgetHandlerContainer` n'expose pas `freeFlowChat` (confirmé par grep — le champ n'existe nulle part sur l'interface ni sur `RoomDesktop.ts`), et `habbo/freeflowchat` n'est explicitement pas câblé dans `RoomUI`/`RoomDesktop` (confirmé par `docs/IMPLEMENTATION_STATUS.md` et par deux TODO déjà présents dans `widget/roomtools/RoomToolsWidget.ts:47` et `RoomToolsToolbarCtrl.ts:337` documentant exactement ce même gap ailleurs). Porter le garde littéralement `if(container.freeFlowChat && ...)` avec un champ qui vaut toujours `undefined` **désactiverait tout l'affichage des bulles de chat** — pire que l'état actuel. L'absence de garde ici est donc probablement le choix pragmatique nécessaire tant que `freeflowchat` n'est pas câblé, mais ce n'est écrit nulle part dans ce fichier précis. **Suggestion :** ajouter un commentaire `TODO(AS3)` similaire aux deux autres pour éviter qu'un futur audit reparte de zéro sur ce point.

**TODO obsolète trouvé (chatType 11) :** le commentaire dit *"IHabboLocalizationManager.getLocalization()/registerParameter()/getLocalizationRaw() don't exist yet"* — faux, vérifié : les trois méthodes existent sur `ICoreLocalizationManager` (héritée par `IHabboLocalizationManager`) et sont déjà utilisées ailleurs dans le repo (`ExtendedProfileWindowCtrl.ts`, session précédente). `container.localization` est bien exposé sur `IRoomWidgetHandlerContainer`. Les 4 gaps de localisation de ce fichier (chatType 5/7-9/10/11 : hand-item, pet-revive/fertilize, mute-time, passthrough générique) sont donc **portables dès maintenant** avec l'infra existante — la vraie raison de leur absence est juste "pas encore fait", pas une dépendance manquante.

**Deux confirmations positives (pas des bugs) :** `win63_2023_version` (référence primaire du fichier) contient deux gardes de type `&& false`/`|| true || true || true` — dispatch de l'événement de chat final, et un garde dans `updateWidgetPosition()`. Croisé avec `win63_version` (propre) : ce sont bien des artefacts de décompilation (le vrai code est un garde null-check normal / une condition positive), même famille de corruption que le `&& false` déjà documenté pour `RoomChatItem.ts`. Le port TS a la bonne version dans les deux cas — juste noté ici pour confirmer que le pattern de corruption est cohérent sur ce fichier aussi.

**Non vérifié dans ce fichier :** le sous-système entier de cache/chargement asynchrone d'images AS3 (`_avatarImageCache`/`_petImageCache`/`_avatarColorCache`/`_petImageIdToFigureString`, plus `petImageReady()`/`avatarImageReady()`/`imageReady()`/`imageFailed()`) est totalement absent du port — le TODO d'en-tête le résume correctement comme "pas encore câblé" mais ne mentionne pas l'ampleur réelle (4 caches + 4 callbacks + un vrai `getPetImage()` à 5 paramètres vs le stub TS à 1 paramètre). Pas re-détaillé ici par manque de temps, mais à garder en tête si ce fichier est repris.

## 6. `ChatInputWidgetHandler.ts` — comptage exact des commandes chat non portées

Le TODO dit "~50 commandes slash". Comptage exact sur `win63_version/habbo/ui/handler/ChatInputWidgetHandler.as` (source très corrompue par ailleurs — `null.text`, `null.charAt(0)`, boucle `while(true)` sans issue — mais les libellés `case "..."` eux-mêmes, de simples littéraux de chaîne, ne sont pas affectés par ce type de corruption) : **71 déclencheurs distincts** (`:kick`, `:mute`, `:zoom`, `:fps`, etc.), regroupables en ~64 commandes réelles une fois fusionnés les alias en fallthrough (`:d`/`;d`, `:shutup`/`:mute`, `o/`/`_o/`, `:fs`/`:fullscreen`, etc.). "~50" sous-estime donc d'environ 30%. Le TS confirme 0 commande portée (seul le chemin normal parler/chuchoter/crier existe) — l'estimation était juste imprécise, pas fausse sur le fond.

## 7. `widget/roomtools/*` — une fonctionnalité complète désactivée par une prémisse fausse — ✅ Résolu (2026-07-09)

`RoomToolsWidgetHandler.ts` (185 lignes) : vérifié sain, comparaison méthode-par-méthode avec l'AS3. Seule absence : `onSessionDataPreferences()`, mais elle est **vide en AS3 aussi** (corps `{}`, jamais câblée à `getProcessedEvents()` qui retourne `[]`) — donc pas un gap réel, juste du code mort déjà présent côté AS3 que le port a eu raison d'omettre.

**Trouvaille principale : `RoomToolsHistory.ts:9-14` désactive à tort la liste des rooms visitées.** Le TODO d'en-tête affirme que le layout `room_tools_history_item_xml` "n'est pas bundlé" et que `populate()` fait un no-op défensif pour cette raison. **Faux, vérifié :** `packages/helium-client/src/assets/window-layouts/room_tools_history_item_xml.json` existe bel et bien, et son champ interne `"name"` vaut exactement `"room_tools_history_item_xml"` — la clé attendue par `buildWidgetLayout()`. Le reste de `populate()` (lignes 62-90) est entièrement écrit et correct : création des lignes, positionnement vertical, libellé du nom de room, clic → `goToPrivateRoom()`. Le garde `if(!probe) { log.warn(...); return; }` en ligne 53-60 bloque une fonctionnalité déjà terminée sur la base d'une prémisse qui ne tient plus (l'asset a probablement été ajouté au bundle après l'écriture de ce TODO, sans que le garde/commentaire soit retiré).

**Impact :** le bouton "historique" de la barre d'outils de room s'ouvrait/fermait (fenêtre vide) mais n'affichait jamais la liste des rooms visitées, alors que le code pour le faire existait déjà et fonctionne.

**Résolution :** bloc `probe`/`log.warn`/`return` retiré de `populate()`, TODO d'en-tête obsolète supprimé, `Logger`/`log` devenus inutiles retirés. `tsc --noEmit` + `eslint` clean.

`RoomToolsToolbarCtrl.ts`, `RoomToolsInfoCtrl.ts`, `RoomToolsCtrlBase.ts`, `RoomToolsWidget.ts` : lus, TODO existants (gate `freeFlowChat` à deux endroits, cf. §5) vérifiés exacts et bien référencés à l'AS3. Pas de nouveau problème trouvé — pas un audit ligne-à-ligne exhaustif de ces 4 fichiers (1157 lignes cumulées) pour autant, juste une vérification ciblée des TODO existants + un scan des patterns habituels (champs morts, gardes suspects).

## 8. `widget/roomchat/*` (hors `RoomChatItem.ts`) — TODO vérifiés exacts

`RoomChatWidget.ts` (959 lignes) : le TODO d'en-tête sur le history-viewer (`RoomChatHistoryViewer`/`RoomChatHistoryPulldown`, ~750 lignes AS3 non portées) est précis et cohérent avec les 5 points d'appel `TODO(AS3)` internes (lignes 794, 808, 818, 879, 940) — tous des no-op documentés, pas de gap caché trouvé. Pas de comparaison AS3 ligne-à-ligne du reste du fichier (positionnement/animation des bulles, ~800 lignes) par manque de temps.

`style/ChatBubbleStyle.ts` + `style/ChatBubbleFactory.ts` : le TODO ("seul le style 0 'normal' est enregistré tant que le catalogue XML `roomchat_styles_chatstyles_xml` n'est pas bundlé") est **exact sur le fond** — vérifié qu'aucun fichier de catalogue de styles n'existe dans `packages/helium-client/src/assets/**`, et que le fichier source contient bien 26 styles (`<style id="0".."25">`). Petite imprécision cosmétique : le chemin cité dans `ChatBubbleStyle.ts:10` (`sources/win63_2023_version/binaryDataXml_organized/non-layouts/2113_chatstyles_xml.xml`) n'existe pas tel quel — le vrai fichier est à `sources/win63_2023_version/binaryData/2113_chatstyles_xml.xml` (ou `binaryDataXml_organized/non-layouts/454_chatstyles_xml$<hash>.xml`, préfixe 454 pas 2113). Pas corrigé (juste une citation de chemin, sans impact fonctionnel).

## 9. Non vérifié (mis à jour)

- Le sous-système de cache/chargement asynchrone d'images dans `ChatWidgetHandler.ts` (voir §5, dernier paragraphe) — ampleur réelle non détaillée.
- `RoomToolsToolbarCtrl.ts`/`RoomToolsInfoCtrl.ts`/`RoomToolsCtrlBase.ts`/`RoomToolsWidget.ts` : TODO existants vérifiés, mais pas de comparaison AS3 ligne-à-ligne exhaustive (voir §7).
- `RoomChatWidget.ts` : ~800 lignes de logique de positionnement/animation des bulles non comparées ligne-à-ligne à l'AS3 (voir §8).
- Les fichiers `widget/messages/*.ts` et `widget/events/*.ts` (DTOs d'événements internes) : non audités, risque faible par nature (pas de logique, juste des structures de données).
