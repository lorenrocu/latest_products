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
            var self = this;
            // Obtener la lista de precios del atributo data o usar la por defecto
            var pricelistId = this.$el.data('pricelist-id') || 1573;
            
            rpc.query({
                route: '/latest_products/snippet',
                params: {
                    pricelist_id: pricelistId
                },
            }).then(function (result) {
                var $container = self.$el.find('.row');
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
            return this._super.apply(this, arguments);
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