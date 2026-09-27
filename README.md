# Tutoriel « Créer une campagne Pix »

Tutoriel mobile, pas à pas, pour les enseignants du collège : créer une campagne d'évaluation
dans Pix Orga (interface rentrée 2026), donner le code aux élèves et suivre les résultats.

- Page en ligne : https://qwetsh.github.io/tuto-campagne-pix/
- Affiche A4 avec QR code à imprimer pour la salle des profs : https://qwetsh.github.io/tuto-campagne-pix/affiche.html

## Contenu

12 écrans en trois chapitres : Préparer, Créer la campagne, Diffuser et suivre.
Les écrans Pix Orga sont reproduits en HTML/CSS (aucune capture d'écran, aucune donnée personnelle)
et animés pour montrer où cliquer.

## Structure

```
index.html        le tutoriel (une section <section class="step"> par écran)
affiche.html      affiche A4 imprimable avec le QR code
css/style.css     styles, thème clair/sombre, maquettes, animations
js/app.js         navigation (boutons, clavier, sommaire, adresse #etape-N), animations
assets/qr.svg     QR code vers la page en ligne (voir « Regénérer le QR code »)
assets/favicon.svg
```

Aucune dépendance externe, aucun outil de compilation : ouvrez `index.html` dans un navigateur.

## Modifier le contenu

Tout le texte est dans `index.html`. Chaque écran est une section :

```html
<section class="step" id="etape-7" data-chapitre="2 · Créer la campagne">
  <h2>Titre de l'écran</h2>
  ...
</section>
```

- Ajouter un écran : copier une section, lui donner un `id="etape-N"` unique. Le compteur, les points et le sommaire se mettent à jour seuls.
- Les encarts : `<div class="tip">` (conseil) et `<details class="more">` (repliable).
- Les animations dans une maquette (`<div class="mock" data-anim>`) :
  - `.anim-type` avec `data-text="..."` : texte tapé au clavier (`data-delay="1.6s"` pour décaler) ;
  - `.anim-highlight` : bouton mis en avant ;
  - `.anim-pop` avec `style="--i:1"` : apparition en cascade ;
  - `.anim-check` : bouton radio qui se coche ;
  - `<span class="tap" style="--x:50%;--y:80%"></span>` : rond de « tape au doigt » à la position donnée.

## Regénérer le QR code

Si l'adresse de la page change :

```bash
pip install segno
python -c "import segno; segno.make('https://qwetsh.github.io/tuto-campagne-pix/', error='m').save('assets/qr.svg', scale=8, dark='#1f2340', border=2)"
```

## Publier une mise à jour

```bash
git add -A
git commit -m "Mise à jour du tutoriel"
git push
```

GitHub Pages redéploie la page en une à deux minutes.

## Mise à jour annuelle

Pix Orga évolue chaque rentrée. Vérifier en septembre : les libellés des boutons, les dates du
calendrier et qui fait quoi (écran 2, affiche) et la mention de version dans le sommaire.
