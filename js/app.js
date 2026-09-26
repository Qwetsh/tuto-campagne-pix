/* Tutoriel « Créer une campagne Pix » — navigation et animations.
   Vanilla JS, sans dépendance. Chaque étape est une <section class="step" id="etape-N">. */
(function () {
  'use strict';

  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var total = steps.length;
  var STORAGE_KEY = 'tuto-pix-etape';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var progressFill = document.getElementById('progress-fill');
  var chapitreEl = document.getElementById('chapitre');
  var compteurEl = document.getElementById('compteur');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var dotsEl = document.getElementById('dots');
  var dialog = document.getElementById('sommaire');
  var sommaireListe = document.getElementById('sommaire-liste');

  /* ---------- Préparation des animations de saisie ---------- */
  steps.forEach(function (step) {
    step.querySelectorAll('.anim-type').forEach(function (field) {
      var text = field.getAttribute('data-text') || '';
      var typed = field.querySelector('.typed');
      if (!typed) return;
      typed.textContent = text;
      typed.style.setProperty('--steps', String(Math.max(text.length, 1)));
      typed.style.setProperty('--dur', (text.length * 0.06).toFixed(2) + 's');
      var delay = field.getAttribute('data-delay');
      if (delay) typed.style.setProperty('--delay', delay);
    });

    /* Titre focalisable pour les lecteurs d'écran */
    var heading = step.querySelector('h1, h2');
    if (heading) heading.setAttribute('tabindex', '-1');

    /* Bouton « Revoir l'animation » */
    var replay = step.querySelector('.replay');
    var mocks = step.querySelectorAll('.mock[data-anim]');
    if (replay && mocks.length && !reducedMotion) {
      replay.hidden = false;
      replay.addEventListener('click', function () { playAnimations(step); });
    }
  });

  function playAnimations(step) {
    step.querySelectorAll('.mock[data-anim]').forEach(function (mock) {
      mock.classList.remove('play');
      /* Forcer un reflow pour relancer les animations CSS */
      void mock.offsetWidth;
      mock.classList.add('play');
    });
  }

  /* ---------- Points de progression et sommaire ---------- */
  steps.forEach(function (step, i) {
    var dot = document.createElement('li');
    dotsEl.appendChild(dot);

    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + step.id;
    var num = document.createElement('span');
    num.textContent = String(i + 1);
    var title = step.querySelector('h1, h2');
    a.appendChild(num);
    a.appendChild(document.createTextNode(title ? title.textContent : 'Étape ' + (i + 1)));
    a.addEventListener('click', function () { dialog.close(); });
    li.appendChild(a);
    sommaireListe.appendChild(li);
  });

  /* ---------- Navigation ---------- */
  var current = -1;

  function indexFromHash() {
    var id = (location.hash || '').replace('#', '');
    var idx = steps.findIndex(function (s) { return s.id === id; });
    return idx;
  }

  function show(index, opts) {
    opts = opts || {};
    index = Math.max(0, Math.min(total - 1, index));
    if (index === current && !opts.force) return;
    current = index;

    steps.forEach(function (step, i) {
      var active = i === index;
      step.classList.toggle('active', active);
      step.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (!active) {
        step.querySelectorAll('.mock.play').forEach(function (m) { m.classList.remove('play'); });
      }
    });

    var step = steps[index];
    progressFill.style.width = ((index + 1) / total * 100) + '%';
    chapitreEl.textContent = step.getAttribute('data-chapitre') || 'Tutoriel';
    compteurEl.textContent = (index + 1) + ' / ' + total;
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === total - 1;
    btnNext.textContent = index === total - 1 ? 'Terminé' : 'Suivant ›';

    Array.prototype.forEach.call(dotsEl.children, function (dot, i) {
      dot.classList.toggle('current', i === index);
      dot.classList.toggle('done', i < index);
    });
    Array.prototype.forEach.call(sommaireListe.querySelectorAll('a'), function (a, i) {
      a.classList.toggle('current', i === index);
      if (i === index) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });

    try { localStorage.setItem(STORAGE_KEY, step.id); } catch (e) { /* stockage indisponible */ }

    if (location.hash !== '#' + step.id) {
      if (opts.replace) history.replaceState(null, '', '#' + step.id);
      else history.pushState(null, '', '#' + step.id);
    }

    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    var heading = step.querySelector('h1, h2');
    if (heading && !opts.noFocus) heading.focus({ preventScroll: true });

    /* Petite latence pour laisser l'écran apparaître avant l'animation */
    setTimeout(function () { playAnimations(step); }, 250);
  }

  btnPrev.addEventListener('click', function () { show(current - 1); });
  btnNext.addEventListener('click', function () { show(current + 1); });

  document.addEventListener('keydown', function (e) {
    if (dialog.open) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); show(current + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(current - 1); }
  });

  window.addEventListener('hashchange', function () {
    var idx = indexFromHash();
    if (idx >= 0) show(idx, { replace: true });
  });

  /* Liens internes vers une étape (#etape-N) dans le contenu */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#etape-"]');
    if (!a) return;
    var idx = steps.findIndex(function (s) { return '#' + s.id === a.getAttribute('href'); });
    if (idx < 0) return;
    e.preventDefault();
    show(idx);
  });

  /* ---------- Sommaire ---------- */
  document.getElementById('btn-sommaire').addEventListener('click', function () {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  });
  document.getElementById('btn-close-sommaire').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });

  /* ---------- Démarrage : hash > étape mémorisée > première ---------- */
  var start = indexFromHash();
  if (start < 0) {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    var savedIdx = steps.findIndex(function (s) { return s.id === saved; });
    /* On ne reprend pas sur la dernière étape : on repart du début dans ce cas */
    start = savedIdx > 0 && savedIdx < total - 1 ? savedIdx : 0;
  }
  show(start, { replace: true, force: true, noFocus: true });
})();
