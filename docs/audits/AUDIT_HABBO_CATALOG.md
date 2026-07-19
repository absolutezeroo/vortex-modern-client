# Audit indépendant — `habbo/catalog`

> **Contexte :** ce dossier est aussi couvert par `docs/IMPLEMENTATION_STATUS.md` (ligne `habbo/catalog` : *"Early partial. Purse/catalog shell exists, but catalog logic, UI, and most messages are missing"* — 239 fichiers AS3 contre 18 TS). Ce rapport ne redit pas ce constat de portée — il vérifie spécifiquement que la partie qui existe (le chemin d'achat, §2) est correcte, ce que le comptage de fichiers ne peut pas dire. Voir `AUDIT_WINDOW_SYSTEM.md` §13-14 pour le contexte complet.

**Périmètre :** `packages/vortex-engine/src/habbo/catalog/**` (~11 070 lignes). Catalogue d'achat, page produit, confirmation d'achat, club/VIP.
**Méthode :** lecture directe, vérification ciblée sur le chemin d'achat (le plus sensible : argent réel/virtuel en jeu) + réutilisation du scan de champs morts déjà passé sur tout le repo.

## 1. Constat général : module honnêtement auto-documenté, pas de bug silencieux trouvé

Contrairement aux Parties 1-2 de l'audit précédent, je n'ai pas trouvé ici de cas "le code a l'air de marcher mais ne fait rien" (type `DesktopController.mouseX`). Les ~35 marqueurs `TODO(AS3)` du module référencent quasi-systématiquement le fichier et la méthode AS3 exacts, et décrivent précisément ce qui manque plutôt que de masquer un stub. Qualité de documentation comparable à `habbo/ui`.

## 2. Chemin d'achat vérifié spécifiquement — sain

`PurchaseConfirmationDialog.ts` s'auto-décrit comme une confirmation "minimale" (pas de disclaimer de dépense, pas d'extension de location de room-ad, pas d'achat en lot par bundle). Vérifié le calcul affiché à l'utilisateur avant confirmation :

```typescript
if(offer.priceInCredits > 0) parts.push(`${offer.priceInCredits * quantity} credits`);
if(offer.priceInActivityPoints > 0) parts.push(`${offer.priceInActivityPoints * quantity} points`);
if(offer.priceInSilver > 0) parts.push(`${offer.priceInSilver * quantity} silver`);
```

Multiplication par quantité correcte pour les trois monnaies. Pas d'erreur de calcul trouvée sur le chemin de base (achat simple, sans bundle ni cadeau). C'est le point que je voulais vérifier en priorité vu que c'est de l'argent réel/virtuel — rien à signaler.

## 3. Ce qui manque, déjà auto-documenté (pour référence, pas de nouvelle info)

- Achat de bundles en quantité, disclaimer de dépense, extension de location de room-ad — absents de `PurchaseConfirmationDialog`.
- `CatalogObjectMover` (glisser un objet acheté directement dans un mover pour le placer en room) — non porté, référencé à 2 endroits (`HabboCatalog.ts`, `ProductViewCatalogWidget.ts`).
- Aperçu avatar-effect en superposition multi-calques dans `ProductViewCatalogWidget.ts` — non porté (lié aux gaps de preview déjà trouvés en Partie 1, §2.1).
- `getSeasonalCurrencyPriceColor()` — variante de couleur cosmétique pour devise saisonnière, non portée. Purement visuel.
- `_bundleDiscountFlatPriceSteps` toujours vide — déjà couvert en Partie 2 §10.

## 4. Non vérifié

Le détail complet de `ItemGridCatalogWidget.ts` (drag-and-drop dans la grille catalogue) et `LocalizationCatalogWidget.ts` (rendu de texte localisé avec liens cliquables dans les pages catalogue) n'a pas été comparé ligne à ligne à l'AS3 — seuls les TODO déjà présents ont été lus, pas re-vérifiés pour en chercher d'autres. Étant donné le temps déjà investi et l'absence de signal fort ailleurs dans ce module, je n'ai pas creusé plus loin.
