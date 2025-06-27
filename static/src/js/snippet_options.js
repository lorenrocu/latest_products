odoo.define('latest_products.snippet_options', function (require) {
    'use strict';

    var options = require('web_editor.snippets.options');
    var rpc = require('web.rpc');

    options.registry.LatestProductsOptions = options.Class.extend({
        selector: '.mi_snippet_latest_products',

        /**
         * Maneja el cambio de lista de precios
         */
        selectPricelist: function (previewMode, value, $opt) {
            var pricelistId = $opt.data('pricelist-id');
            this.$target.attr('data-pricelist-id', pricelistId);
            
            // Recargar los productos con la nueva lista de precios
            this._reloadProducts(pricelistId);
        },

        /**
         * Recarga los productos con la lista de precios especificada
         */
        _reloadProducts: function (pricelistId) {
            var self = this;
            var $container = this.$target.find('.row');
            
            // Mostrar spinner de carga
            $container.html('<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="sr-only">Cargando productos...</span></div></div>');
            
            rpc.query({
                route: '/latest_products/snippet',
                params: {
                    pricelist_id: pricelistId
                },
            }).then(function (result) {
                $container.empty();
                if (result.products.length === 0) {
                    $container.append('<p>No hay productos recientes para mostrar.</p>');
                    return;
                }
                
                result.products.forEach(function(product) {
                    var card = '<div class="col-lg-3 col-md-6 col-sm-12 mb-4">' +
                        '<div class="card mb-3">' +
                        '<div class="card-body product-info-container">' +
                        '<a href="/shop/product/' + product.id + '">' +
                        (product.image ? '<img src="data:image/png;base64,' + product.image + '" class="img-fluid" alt="Product Image"/>' : '<img src="/web/static/src/img/placeholder.png" class="img-fluid" alt="Product Image Placeholder"/>') +
                        '</a>' +
                        '<h5 class="card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' +
                        '<a href="/shop/product/' + product.id + '">' +
                        (product.default_code ? '[' + product.default_code + '] ' : '') + product.name +
                        '</a></h5>' +
                        '<div class="product-price">' +
                        product.price + ' ' + product.currency +
                        '</div>' +
                        '<div class="mt-2 text-center">' +
                        '<form action="/shop/cart/update" method="post" style="display: inline;">' +
                        '<input type="hidden" name="product_id" value="' + product.variant_id + '"/>' +
                        '<input type="hidden" name="add_qty" value="1"/>' +
                        '<input type="hidden" name="csrf_token" value="' + $('meta[name="csrf-token"]').attr('content') + '"/>' +
                        '<button type="submit" class="btn btn-primary btn-sm btn-block">' +
                        '<i class="fa fa-shopping-cart"></i> Añadir al carrito' +
                        '</button></form></div></div></div></div>';
                    $container.append(card);
                });
            });
        },

        //--------------------------------------------------------------------------
        // Options
        //--------------------------------------------------------------------------

        /**
         * Opciones disponibles para el snippet
         */
        selectClass: function (previewMode, value, $opt) {
            this._super.apply(this, arguments);
        },
    });

    // Registrar los eventos para las opciones de lista de precios
    options.registry.LatestProductsOptions.include({
        events: _.extend({}, options.registry.LatestProductsOptions.prototype.events, {
            'click [data-pricelist-id]': 'selectPricelist',
        }),
    });

    return options.registry.LatestProductsOptions;
});