odoo.define('latest_products.main', function (require) {
    'use strict';

    var publicWidget = require('web.public.widget');
    var rpc = require('web.rpc');
    var core = require('web.core');
    var _t = core._t;

    publicWidget.registry.LatestProductsSnippet = publicWidget.Widget.extend({
        selector: '.mi_snippet_latest_products',
        events: {
            'click .btn-add-to-cart': '_onAddToCartClick',
        },

        start: function () {
            this._super.apply(this, arguments);
            console.log('LatestProductsSnippet widget started for element:', this.el);
            this._loadLatestProducts();
            this._loadBestSellers();
        },

        _loadLatestProducts: function () {
            this._loadProducts('latest', '#latest_products_container');
        },

        _loadBestSellers: function () {
            this._loadProducts('best_sellers', '#best_sellers_container');
        },

        _loadProducts: function (productType, containerSelector) {
            var self = this;
            var pricelistId = self.$el.data('pricelist-id') || 0; // Default to 0 to show all products

            console.log('--- JS: _loadProducts ---');
            console.log('Product Type:', productType);
            console.log('Container Selector:', containerSelector);
            console.log('Pricelist ID from data attribute:', self.$el.data('pricelist-id'));
            console.log('Final Pricelist ID to be sent:', pricelistId);

            self._rpc({
                route: '/latest_products/snippet',
                params: {
                    pricelist_id: pricelistId,
                    product_type: productType,
                },
            }).then(function (result) {
                console.log('--- JS: RPC Success ---');
                console.log('Raw result received from controller:', result);

                var $container = self.$el.find(containerSelector);
                $container.empty();

                if (result.error) {
                    console.error('Server-side error:', result.error);
                    $container.append('<div class="col-12 text-center"><p class="text-danger">Error: ' + result.error + '</p></div>');
                    return;
                }

                if (!result.products || result.products.length === 0) {
                    console.warn('No products found for the given criteria.');
                    $container.append('<div class="col-12 text-center"><p>No se encontraron productos.</p></div>');
                    return;
                }

                console.log('Rendering ' + result.products.length + ' products for ' + productType);
                result.products.forEach(function (product) {
                    var productCode = product.code ? product.code + ' - ' : '';
                    var productCard = '<div class="col-lg-3 col-md-6 mb-4">' +
                        '<div class="card h-100">' +
                        '<div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">' +
                        // Imagen dentro del enlace
                        '<a href="/shop/product/' + product.id + '">' +
                        '<img src="data:image/png;base64,' + product.image + '" class="img-fluid"/>' +
                        '<div class="mask" style="background-color: rgba(251, 251, 251, 0.15);"></div>' +
                        '</a>' +
                        '</div>' +
                        '<div class="card-body d-flex flex-column">' +
                        // Nombre del producto como enlace
                        '<h5 class="card-title text-truncate">' +
                        '<a href="/shop/product/' + product.id + '">' + productCode + product.name + '</a>' +
                        '</h5>' +
                        '<p class="card-text mt-auto">' + product.price + ' ' + product.currency + '</p>' +
                        '<a href="#" class="btn btn-primary btn-add-to-cart" data-product-id="' + product.variant_id + '">Añadir al carrito</a>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    $container.append(productCard);
                });
            }).catch(function (error) {
                console.error('--- JS: RPC Failed ---', error);
                var $container = self.$el.find(containerSelector);
                $container.html('<div class="col-12 text-center"><p class="text-danger">Error al cargar productos. Verifique la consola para más detalles.</p></div>');
            });
        },

        _onAddToCartClick: function (ev) {
            ev.preventDefault();
            var self = this;
            var $button = $(ev.currentTarget);
            var productId = $button.data('product-id');

            // Redirigir directamente al carrito con el producto
            var cartUrl = '/shop/cart/update?product_id=' + productId + '&add_qty=1';
            window.location.href = cartUrl;
        },

        _showNotification: function (message, type) {
            var $notificationArea = this.$('#product_notification_area');
            if (!$notificationArea.length) {
                $notificationArea = $('<div id="product_notification_area"></div>').insertAfter(this.$el.find('h1'));
            }
            var $alert = $('<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">' +
                message +
                '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                '</div>');
            $notificationArea.append($alert);
            // Auto-dismiss notification
            setTimeout(function () {
                $alert.alert('close');
            }, 5000);
        }
    });

    return publicWidget.registry.LatestProductsSnippet;
});