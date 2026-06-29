# Window System — Optimizations potentielles

> Derniere mise a jour : 2026-02-17
> Statut : Reference pour futures optimisations. Rien n'est critique aujourd'hui.

---

## Deja en place

Ces optimisations sont implementees et ne doivent pas etre retirees :

- **Object Pooling** — `WindowEvent` / `WindowMouseEvent` avec `allocate()` / `recycle()` (zero allocation en regime permanent)
- **Initialisation lazy** — `_children`, `_eventDispatcher`, `_rectLimits` crees a la demande
- **Flags bitwise** — Tous les tests type/state/style/param en O(1) via AND/OR
- **Dirty region tracking** — `WindowRenderer.addToRenderQueue()` ne re-rend que les fenetres invalidees
- **RAF auto-start/stop** — `Motions` demarre/arrete `requestAnimationFrame` selon le nombre d'animations actives
- **Temp rect statique** — `WindowController._tempRect` reutilise pour les calculs d'invalidation
- **BoxSizer guard** — Empeche les recalculs O(n^2) pendant le parsing des layouts
- **Map-based lookups** — `SkinContainer`, `Classes` registry, layout cache
- **Style-0 fallback** — `SkinContainer` evite les enregistrements de renderers redondants

---

## A faire

### 1. Cache des branches stables dans le compositing

**Probleme :** `compositeWindow()` traverse recursivement tout l'arbre de fenetres a chaque composition, meme les branches qui n'ont pas change.

**Solution :** Maintenir un bitmap cache par branche stable. Si aucun enfant d'un conteneur n'est dirty, reutiliser le buffer composite precedent au lieu de re-traverser.

**Fichier :** `WindowRenderer.ts` — `compositeWindow()` (ligne ~454)

**Impact :** Moyen — reduit le nombre de `drawImage()` chaines dans les arbres profonds (frame > header > container > itemlist > items > labels).

---

### 2. Cache du texte en bitmap

**Probleme :** `compositeText()` appelle `fillText()` Canvas 2D a chaque composition, meme quand le texte n'a pas change (contenu, taille, couleur identiques).

**Solution :** Generer un `OffscreenCanvas` bitmap pour chaque texte au moment du changement, puis simplement `drawImage()` lors du compositing. Invalider le cache uniquement quand le contenu, la font, la couleur ou la taille change.

**Fichier :** `WindowRenderer.ts` — `compositeText()` (ligne ~558)

**Impact :** Moyen — le texte est omnipresent (labels, boutons, headers) et `fillText()` est couteux comparé à `drawImage()`.

---

### 3. Gestion memoire des buffers OffscreenCanvas

**Probleme :** Chaque `WindowRendererItem` possede son propre `OffscreenCanvas` buffer. Avec beaucoup de fenetres, ca fait beaucoup de surfaces GPU en memoire.

**Solutions possibles :**
- **Pool de buffers** — Reutiliser les `OffscreenCanvas` de meme taille (ou taille proche) quand une fenetre est detruite
- **Atlas dynamique** — Packer les petits elements (icones, boutons) dans un atlas partage plutot que des buffers individuels
- **Liberation agressive** — Liberer les buffers des fenetres non visibles (minimisees, hors ecran) et les recréer a la demande

**Fichier :** `WindowRenderer.ts` — `WindowRendererItem`

**Impact :** Moyen — surtout important si 50+ fenetres sont ouvertes simultanement.

---

### 4. Bundle des layouts JSON frequents

**Probleme :** 200+ fichiers JSON charges via `import.meta.glob()` avec lazy loading = potentiellement 200+ requetes HTTP individuelles.

**Solutions possibles :**
- **Bundle par module** — Grouper les layouts par fonctionnalite (catalog, navigator, inventory) en un seul fichier par groupe
- **Preload des essentiels** — Charger les layouts les plus utilises (frame, button, dialog) au demarrage plutot qu'a la demande
- **Inline les layouts critiques** — Les layouts utilises au boot (login, loading) directement dans le bundle JS

**Fichier :** `packages/helium-client/src/api/windowLayouts.ts`

**Impact :** Bas a moyen — depend du bundler (Vite chunk splitting peut deja grouper), mais reduit la latence au premier affichage de chaque fenetre.

---

### 5. Hit-testing spatial

**Probleme :** `findWindowAtPoint()` traverse toutes les couches en reverse z-order, testant chaque fenetre. Complexite O(n) par mousemove.

**Solution :** Pour l'instant ce n'est pas un probleme (Habbo a rarement plus de ~20 fenetres visibles). Si ca devient un goulot :
- Quadtree spatial pour les fenetres de premier niveau
- Ou simplement skipper les fenetres dont le bounding rect ne contient pas le point avant de descendre dans les enfants (deja fait via `testParamFlag` pour INPUT_EVENT_PROCESSOR, mais verifier que le rect test est bien en premier)

**Fichier :** `WindowRenderer.ts` — `findWindowAtPoint()` (ligne ~304)

**Impact :** Bas — ne deviendrait problematique qu'avec 50+ fenetres visibles simultanement.

---

### 6. Transfer Canvas 2D vers WebGL

**Probleme :** Si le resultat final du compositing Canvas 2D est utilise comme texture dans PixiJS (WebGL), le transfer `canvas → texture` a un cout a chaque frame.

**Solutions possibles :**
- **Double buffering** — Alterner entre deux canvas/textures pour eviter les stalls GPU
- **Render direct en WebGL** — A terme, remplacer le compositing Canvas 2D par du rendu WebGL direct (gros chantier)
- **Dirty flag global** — Ne re-uploader la texture que si au moins une fenetre a ete invalidee depuis la derniere frame

**Impact :** Bas a moyen — depend de la frequence de mise a jour des fenetres. Si rien ne bouge, le dirty flag suffit.

---

### 7. WindowController — taille de la classe

**Probleme :** `WindowController` fait ~3000+ lignes. En JS/TS, V8 gere bien les grandes classes mais les inline caches peuvent etre moins efficaces avec beaucoup de proprietes sur un meme prototype.

**Observation :** C'est fidele a l'AS3 et ne devrait pas etre refactorise pour le moment. L'architecture AS3 est la source de verite.

**Si necessaire plus tard :**
- Extraire les mixins (drag, scale, state transitions) en fonctions utilitaires appelees depuis les methodes
- Garder la meme API publique

**Impact :** Bas — V8 optimise bien les classes monolithiques en pratique.

---

## Priorite suggeree

| # | Optimisation                 | Effort | Impact    | Priorite |
|---|------------------------------|--------|-----------|----------|
| 1 | Cache branches stables       | Moyen  | Moyen     | P1       |
| 2 | Cache texte bitmap           | Faible | Moyen     | P1       |
| 3 | Pool buffers OffscreenCanvas | Moyen  | Moyen     | P2       |
| 4 | Bundle layouts JSON          | Faible | Bas-Moyen | P2       |
| 5 | Hit-testing spatial          | Moyen  | Bas       | P3       |
| 6 | Transfer Canvas→WebGL        | Eleve  | Bas-Moyen | P3       |
| 7 | Taille WindowController      | Eleve  | Bas       | P4       |
