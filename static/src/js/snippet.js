odoo.define('tu_modulo_snippet.snippet', function (require) {
    'use strict';
    var sAnimation = require('website.content.snippets.animation');
    sAnimation.registry.MiSnippet = sAnimation.Class.extend({
      selector: '.mi_snippet',
      start: function () {
        console.log('Mi Snippet cargado');
      },
    });
  });
  