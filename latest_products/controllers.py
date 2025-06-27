from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)

class LatestProductsController(http.Controller):
    @http.route('/latest_products/snippet', type='json', auth='public')
    def get_latest_products(self, pricelist_id=1573):
        try:
            _logger.info('Latest Products Controller called with pricelist_id: %s', pricelist_id)
            pricelist_id = int(pricelist_id) if pricelist_id else 1573
            
            if pricelist_id == 0:
                # Mostrar todos los productos publicados
                products = request.env['product.template'].sudo().search([
                    ('website_published', '=', True)
                ], order='create_date desc', limit=8)
                pricelist = request.env['product.pricelist'].sudo().browse(1)  # Lista de precios por defecto para precios
            else:
                pricelist = request.env['product.pricelist'].sudo().browse(pricelist_id)
                if not pricelist:
                    return {'products': []}
                # Buscar items de la lista de precios
                pricelist_items = request.env['product.pricelist.item'].sudo().search([
                    ('pricelist_id', '=', pricelist_id),
                    ('product_tmpl_id', '!=', False)
                ])
                product_ids = pricelist_items.mapped('product_tmpl_id').ids
                # Solo productos publicados en el website
                products = request.env['product.template'].sudo().search([
                    ('id', 'in', product_ids),
                    ('website_published', '=', True)
                ], order='create_date desc', limit=8)
                
            product_data = []
            for product in products:
                price = pricelist.price_get(product.product_variant_id.id, 1)[pricelist.id]
                product_data.append({
                    'id': product.id,
                    'variant_id': product.product_variant_id.id,
                    'name': product.name,
                    'default_code': product.default_code,
                    'image': product.image_1920,
                    'price': price,
                    'currency': pricelist.currency_id.symbol,
                })
                
            _logger.info('Returning %d products', len(product_data))
            return {'products': product_data}
            
        except Exception as e:
            _logger.error('Error in get_latest_products: %s', str(e))
            return {'error': str(e), 'products': []}