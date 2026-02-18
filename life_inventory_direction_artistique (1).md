# CORESPACE — CAHIER DES CHARGES PRODUIT & DIRECTION ARTISTIQUE

## NOM DU PRODUIT
CORESPACE

Positionnement : système de gestion personnelle spatial et immersif.
Identité : outil premium, technique et crédible, à mi-chemin entre OS personnel et module tactique.


---

# 1. VISION PRODUIT

Life Inventory est une application web immersive transformant la gestion du temps, de l’énergie et des tâches en un inventaire spatial interactif.

L’utilisateur ne gère plus une to‑do list abstraite.
Il gère un espace limité représentant sa capacité réelle quotidienne.

Chaque action occupe de la place.
Chaque ressource se consomme.
Chaque combinaison optimise la vie.

Objectif : créer une expérience mémorable, unique visuellement et techniquement impressionnante.

---

# 2. OBJECTIFS DU PROJET

## Portfolio
Créer un projet immédiatement remarquable visuellement.

## UX
Créer un système interactif addictif et satisfaisant.

## Technique
Mettre en valeur :
- drag & drop avancé
- logique grid
- animations premium
- sound design
- architecture modulaire

---

# 3. CIBLE UTILISATEUR

### Primaire
- étudiants
- développeurs
- créatifs
- gamers
- freelance

### Secondaire
- amateurs productivité
- designers
- geeks organisation

---

# 4. CORE CONCEPT

La journée/semaine de l’utilisateur = inventaire limité.

Chaque action consomme :
- temps
- énergie
- attention

L’utilisateur doit optimiser son inventaire pour réussir sa journée.

---

# 5. GAMEPLAY PRINCIPAL

## Grille inventaire

Format :
- jour : 8 x 6
- semaine : 12 x 10

Slots physiques.
Placement spatial réel.

---

## Types d’objets

### Tâches
Occupent de la place.

Ex :
- coder
- étudier
- sport
- ménage
- rendez-vous

Tailles variables.

---

### Ressources
Consommables.

- énergie
- focus
- café
- argent
- sommeil

---

### Buffs
Améliorent performance.

- deep work
- flow
- motivation
- discipline

---

### Parasites
Occupent de la place négativement.

- fatigue
- procrastination
- distraction
- stress

---

# 6. FUSION D’OBJETS

Mécanique centrale.

Exemples :
- café + focus → deep work
- sommeil + sport → énergie max
- code + idée → feature
- lecture + musique → flow study

Drag objet sur objet = fusion.

Animation obligatoire.

---

# 7. CONSOMMATION

Double clic ou bouton.

Effets :
- libère espace
- donne buff
- donne XP
- modifie énergie

---

# 8. PROGRESSION UTILISATEUR

## XP
Gagnée quand :
- tâche placée
- tâche terminée
- fusion
- inventaire optimisé

## Level up
Débloque :
- plus d’espace
- nouveaux items
- skins
- modules rares

---

# 9. PAGES PRINCIPALES

## Dashboard
Écran principal.

Centre : inventaire
Gauche : modules disponibles
Droite : stats utilisateur
Haut : horloge + cycle

---

## Creator d’objets
Créer tâches personnalisées.

Paramètres :
- nom
- taille
- type
- couleur

---

## Stats
- productivité
- optimisation inventaire
- streak
- historique

---

## Fusion Lab
Découverte recettes.

---

# 10. STACK TECHNIQUE

Frontend :
- Next.js
- React
- Tailwind
- Zustand
- Framer Motion

Drag & Drop :
- dnd-kit

Audio :
- howler.js

Backend :
- Supabase

Auth :
- Google
- Discord

PWA : obligatoire

---

# 11. ARCHITECTURE OBJETS

Format :

{
 id,
 name,
 type,
 width,
 height,
 rarity,
 effect,
 stackable,
 craftable
}

Inventaire = grille 2D.

---

# 12. DIRECTION ARTISTIQUE — IDENTITÉ UNIQUE

## Intention
Créer une interface tangible et crédible.

Pas startup.
Pas IA.
Pas emoji.
Pas cartoon.

L’interface doit ressembler à un outil réel issu d’un univers sérieux.

---

## Positionnement visuel

Mélange :
- interface tactique
- équipement premium
- OS expérimental
- module physique futuriste

L’utilisateur doit avoir l’impression d’utiliser :
> un système personnel avancé

---

# 13. PALETTE COULEUR

Fond : noir bleuté profond
Surface : graphite / métal sombre
Accent principal : vert technique froid
Accent secondaire : ambre technique
Danger : rouge éteint
Rare : doré métallique froid

Jamais trop de couleurs.

---

# 14. TYPOGRAPHIE

UI :
- Inter Tight
- Satoshi
- IBM Plex Sans

Data :
- JetBrains Mono
- IBM Plex Mono

---

# 15. DESIGN DE LA GRILLE

Signature visuelle du produit.

Slots :
- métal sombre
- micro texture
- bord interne fin
- ombre subtile

Hover :
éclairage interne léger

Placement objet :
- sensation de poids
- ombre
- ancrage physique

---

# 16. DESIGN DES OBJETS

Pas icônes.
Modules physiques stylisés.

Style :
- semi réaliste
- top view
- matériel
- crédible

Textures :
- métal
- verre
- plastique mat

---

# 17. RARETÉ VISUELLE

Commun : discret
Amélioré : liseré
Rare : animation interne
Unique : pulse lent

Jamais fantasy.

---

# 18. ANIMATIONS

## Drag
Inclinaison légère
ombre dynamique

## Snap
Impact léger

## Fusion
Verrouillage modules
flash interne

## Consommation
Désassemblage
transfert énergie

Animations rapides et sèches.

---

# 19. FX VISUELS

Glow subtil
particules fines
scan léger
pulse lent

---

# 20. SOUND DESIGN

Style :
matériel technologique crédible.

- clic métallique doux
- verrouillage
- scan
- transfert énergie

Pas arcade.

---

# 21. ASSETS VISUELS À CRÉER

## UI
- grille inventaire
- slot vide
- slot hover
- sidebar
- HUD XP
- popup fusion
- popup consume

## Items

Ressources :
- batterie énergie
- capsule focus
- module café
- module sommeil

Tâches :
- module code
- module étude
- module sport
- module call

Buffs :
- deep work
- flow
- motivation

Parasites :
- fatigue
- distraction
- procrastination

---

# 22. ASSETS FX

- glow
- particules fusion
- xp burst
- rare shine

---

# 23. AUDIO

- open inventory
- drag
- drop
- fusion
- consume
- error

---

# 24. MVP PRIORITAIRE

À développer en premier :

1. grille inventaire
2. drag & drop
3. objets tailles différentes
4. consommation
5. fusion
6. sauvegarde locale

PAS encore :
- multi user
- social
- marketplace
- mobile app native

---

# RÈGLE FINALE

Si l’interface ressemble à une app classique → supprimer.
Si elle ressemble à un outil réel crédible → garder.

Le produit doit marquer en 5 secondes.

