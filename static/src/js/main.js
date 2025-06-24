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
            this.$notificationArea = this.$('#product_notification_area');
            if (!this.$notificationArea.length) {
                // Si el área de notificación específica no existe en el snippet, la crea dinámicamente
                // o busca un contenedor más general si es necesario.
                // Por ahora, asumimos que está dentro del selector del snippet o se añade manualmente.
                // Considerar crearla si no existe para mayor robustez.
                // console.warn('Área de notificación no encontrada. Las notificaciones podrían no mostrarse.');
            }
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