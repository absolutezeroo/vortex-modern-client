# Audit indépendant — `habbo/ui` (widgets superposés dans une room)

> **Contexte :** ce dossier est aussi couvert par `docs/IMPLEMENTATION_STATUS.md` (ligne `habbo/ui` : *"Mostly missing... infostand (furni-only), room-tools, and chat-input widgets ported"*). Ce rapport ne redit pas ce constat général — il apporte le comptage exact (§1), une correction d'un commentaire obsolète dans le code (§2), et un gap comportemental précis non mentionné dans le doc de statut (§3, l'infostand utilisateur). Voir `AUDIT_WINDOW_SYSTEM.md` §13-14 pour le contexte complet.

**Périmètre :** `packages/helium-engine/src/habbo/ui/**` (61 fichiers, ~10 170 lignes). Chat, infostand, outils de room, factory de widgets.
**Méthode :** lecture directe + comparaison AS3 ciblée sur les points les plus significatifs. Pas un audit ligne-à-ligne exhaustif des 61 fichiers (voir §4 pour ce qui n'a pas été vérifié).

## 1. Constat principal : 4 types de widgets sur 45 sont câblés

`RoomWidgetFactory.ts` et `RoomDesktop.ts` gèrent chacun un `switch(type)` qui ne couvre que 4 cas : `RWE_INFOSTAND`, `RWE_ROOM_TOOLS`, `RWE_CHAT_INPUT_WIDGET`, `RWE_CHAT_WIDGET`. L'AS3 (`RoomWidgetFactory.as`) en gère **45** (compté précisément par grep sur les `case "RWE_..."`, pas juste "~35" comme l'estime le commentaire du code lui-même).

Widgets absents notables, avec impact utilisateur direct si un jour sollicités : `RWE_ME_MENU` (menu utilisateur), `RWE_DOORBELL` (sonnette de room privée), `RWE_LOADINGBAR` (barre de chargement de room), `RWE_ROOM_QUEUE` (file d'attente room pleine), `RWE_AVATAR_INFO`, `RWE_FURNITURE_CONTEXT_MENU`, `RWE_EFFECTS`, `RWE_MANNEQUIN`, `RWE_YOUTUBE`/`RWE_VIMEO` (lecteurs vidéo intégrés), `RWE_CRAFTING`, `RWE_ROOM_POLL`.

C'est un chantier connu — le code le dit lui-même sans détour (`TODO(AS3)` en en-tête des deux fichiers). Rien de caché ici, contrairement aux bugs des Parties 1-2. Je le documente surtout pour donner le chiffre exact et la liste précise, plus utile que "des widgets manquent".

## 2. Commentaire obsolète dans `RoomDesktop.ts:542`

Le docstring dit *"only RWE_INFOSTAND is wired up so far"* — faux, le switch juste en dessous gère 4 cas, pas 1. Le commentaire n'a pas été mis à jour au fur et à mesure que `RWE_ROOM_TOOLS`, `RWE_CHAT_INPUT_WIDGET` et `RWE_CHAT_WIDGET` ont été ajoutés. Pas un bug fonctionnel, mais trompeur pour quiconque lit uniquement le commentaire (risque de ré-implémenter par erreur un widget déjà fait). Fix : mettre à jour le commentaire, une ligne.

## 3. Gap fonctionnel concret trouvé dans une partie "faite" : pas d'info utilisateur dans l'infostand

`InfoStandWidgetHandler.ts:263-282` (`handleGetObjectInfoMessage`) ne route que les catégories `10`/`20` (meuble sol / meuble mur) vers l'affichage d'info. La catégorie `100` (utilisateur — cliquer sur un avatar dans la room) est un `TODO(AS3)` explicite, non routée.

**Impact :** cliquer sur un avatar dans la room pour voir sa fiche (infostand utilisateur — pseudo, motto, badges) ne fait rien. Cliquer sur un meuble ou un animal fonctionne. C'est le seul gap fonctionnel "silencieux" trouvé dans ce module (les autres sont tous auto-documentés en tête de fichier) — celui-ci est enterré au milieu d'un switch, pas signalé en en-tête de fichier, donc plus facile à rater en lisant vite.

## 4. Ce qui a été vérifié sain

`InfoStandWidgetHandler.ts` (449 lignes) contient un commentaire d'intention explicite : *"no case from `getWidgetMessages()` is silently dropped from the switch"* — vérifié exact, chaque branche non portée logge explicitement au lieu d'échouer en silence. C'est le seul fichier du repo où j'ai vu cette discipline affichée aussi clairement ; positif à noter.

Le scan de champs morts (méthodologie du rapport précédent, §8-9) appliqué à l'ensemble du projet n'a remonté **aucun** candidat dans `habbo/ui/**` — pas de propriété figée à sa valeur initiale ici.

## 5. Non vérifié (pour être honnête sur les limites de cet audit)

- `ChatWidgetHandler.ts` (292 lignes) : gaps de localisation déjà documentés en TODO (item-tenu, mute-time, pet-revive) — non re-vérifiés en détail, contenu du TODO pris tel quel.
- `ChatInputWidgetHandler.ts` : la mention "~50 commandes slash non portées" n'a pas été vérifiée contre l'AS3 pour en établir la liste précise (contrairement au §1 où j'ai fait le comptage exact pour les widgets).
- `RoomToolsWidgetHandler.ts`, tout `widget/roomtools/*`, `widget/roomchat/*` (hors `RoomChatItem.ts`, déjà couvert dans le rapport précédent) : lus en survol, pas de comparaison AS3 ligne à ligne.
- Les fichiers `widget/messages/*.ts` et `widget/events/*.ts` (DTOs d'événements internes) : non audités, risque faible par nature (pas de logique, juste des structures de données).
