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
            this.$el.find('.row').html('<div class="col-12 text-center"><p class="text-success">Widget inicializado correctamente. Cargando productos...</p></div>');
            this._loadProducts();
        },

        _loadProducts: function () {
            var self = this;
            var pricelistId = self.$el.data('pricelist-id') || 1573;

            self._rpc({
                route: '/latest_products/snippet',
                params: {
                    pricelist_id: pricelistId,
                },
            }).then(function (result) {
                var $container = self.$el.find('.row');
                $container.empty();

                if (result.error) {
                    $container.append('<div class="col-12 text-center"><p class="text-danger">Error: ' + result.error + '</p></div>');
                    return;
                }

                if (!result.products || result.products.length === 0) {
                    $container.append('<div class="col-12 text-center"><p>No se encontraron productos.</p></div>');
                    return;
                }

                result.products.forEach(function (product) {
                    var productCard = '<div class="col-lg-3 col-md-6 mb-4">' +
                        '<div class="card">' +
                        '<div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">' +
                        '<img src="data:image/png;base64,' + product.image + '" class="img-fluid"/>' +
                        '<a href="/shop/product/' + product.id + '">' +
                        '<div class="mask" style="background-color: rgba(251, 251, 251, 0.15);"></div>' +
                        '</a>' +
                        '</div>' +
                        '<div class="card-body">' +
                        '<h5 class="card-title">' + product.name + '</h5>' +
                        '<p class="card-text">' + product.price + ' ' + product.currency + '</p>' +
                        '<a href="#" class="btn btn-primary">Añadir al carrito</a>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    $container.append(productCard);
                });
            }).catch(function (error) {
                console.error('RPC Query Failed:', error);
                var $container = self.$el.find('.row');
                $container.html('<div class="col-12 text-center"><p class="text-danger">Error al cargar productos. Verifique la consola.</p></div>');
            });
        },

        _onAddToCartClick: function (ev) {
            var self = this;
            var $button = $(ev.currentTarget);
            var productId = $button.data('product-id');

            // Deshabilitar el botón para evitar múltiples clics
            $button.attr('disabled', 'disabled').addClass('disabled');
            var originalButtonText = $button.html();
            $button.html('<i class="fa fa-spinner fa-spin"></i> ' + _t('Adding...'));

            this._rpc({
                route: '/shop/cart/update_json',
                params: {
                    product_id: productId,
                    add_qty: 1
                },
            }).then(function (data) {
                // Actualizar el ícono del carrito (si existe uno genérico en la página)
                var $cartQuantity = $('.my_cart_quantity');
                if ($cartQuantity.length) {
                    $cartQuantity.text(data.cart_quantity || 0);
                }
                // Mostrar notificación
                self._showNotification(_t('Producto añadido al carrito!'), 'success');
                // Restaurar botón
                $button.removeAttr('disabled').removeClass('disabled').html(originalButtonText);
            }).guardedCatch(function (error) {
                console.error('Error adding product to cart:', error);
                var errorMessage = _t('Error al añadir el producto al carrito.');
                if (error.message && error.message.data && error.message.data.message) {
                    errorMessage = error.message.data.message;
                }
                self._showNotification(errorMessage, 'danger');
                // Restaurar botón
                $button.removeAttr('disabled').removeClass('disabled').html(originalButtonText);
            });
        },

        _showNotification: function (message, type) {
            var $notification = $('<div class="product-notification alert alert-' + type + '" role="alert" style="display:none;">' + message + '</div>');
            
            // Intentar añadir la notificación al área específica si existe, sino al body
            var $targetArea = this.$notificationArea.length ? this.$notificationArea : $('body');
            
            $targetArea.append($notification);
            $notification.fadeIn();

            setTimeout(function () {
                $notification.fadeOut(function () {
                    $(this).remove();
                });
            }, 3000);
        }
    });

    return publicWidget.registry.LatestProductsSnippet;
});