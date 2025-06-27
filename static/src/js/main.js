odoo.define('latest_products.main', function (require) {
    'use strict';

    var publicWidget = require('web.public.widget');
    var rpc = require('web.rpc');
    var core = require('web.core');
    var _t = core._t;

    publicWidget.registry.LatestProductsSnippet = publicWidget.Widget.extend({
        selector: '.mi_snippet_latest_products',

        start: function () {
            this._super.apply(this, arguments);
            console.log('--- LATEST PRODUCTS SNIPPET INITIALIZED ---');
            this.$el.find('.row').html('<div class="col-12 text-center"><p class="text-info">JavaScript widget loaded successfully. Check console.</p></div>');
        },
    });

    return publicWidget.registry.LatestProductsSnippet;
});