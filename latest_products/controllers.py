from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)

class LatestProductsController(http.Controller):
    @http.route('/latest_products/snippet', type='json', auth='public')
    def get_latest_products(self, pricelist_id=1573):
        try:
            _logger.info('=== CONTROLLER DEBUG START ===')
            _logger.info('Original pricelist_id received: %s (type: %s)', pricelist_id, type(pricelist_id))
            pricelist_id = int(pricelist_id) if pricelist_id else 1573
            _logger.info('Converted pricelist_id: %s', pricelist_id)
            
            if pricelist_id == 0:
                # Mostrar todos los productos publicados
                _logger.info('Mode: Show all published products')
                products = request.env['product.template'].sudo().search([
                    ('website_published', '=', True)
                ], order='create_date desc', limit=8)
                _logger.info('Found %d published products', len(products))
                pricelist = request.env['product.pricelist'].sudo().browse(1)  # Lista de precios por defecto para precios
                _logger.info('Using default pricelist ID 1 for pricing')
            else:
                _logger.info('Mode: Filter by pricelist %s', pricelist_id)
                pricelist = request.env['product.pricelist'].sudo().browse(pricelist_id)
                _logger.info('Pricelist found: %s (exists: %s)', pricelist.name if pricelist else 'None', pricelist.exists())
                if not pricelist.exists():
                    _logger.warning('Pricelist %s not found, returning empty', pricelist_id)
                    return {'products': [], 'error': f'Pricelist {pricelist_id} not found'}
                # Buscar items de la lista de precios
                pricelist_items = request.env['product.pricelist.item'].sudo().search([
                    ('pricelist_id', '=', pricelist_id),
                    ('product_tmpl_id', '!=', False)
                ])
                _logger.info('Found %d pricelist items', len(pricelist_items))
                product_ids = pricelist_items.mapped('product_tmpl_id').ids
                _logger.info('Product IDs from pricelist: %s', product_ids)
                # Solo productos publicados en el website
                products = request.env['product.template'].sudo().search([
                    ('id', 'in', product_ids),
                    ('website_published', '=', True)
                ], order='create_date desc', limit=8)
                _logger.info('Found %d published products from pricelist', len(products))
                
            product_data = []
            _logger.info('Processing %d products for output', len(products))
            for product in products:
                _logger.info('Processing product: %s (ID: %s)', product.name, product.id)
                price = pricelist.price_get(product.product_variant_id.id, 1)[pricelist.id]
                _logger.info('Product %s price: %s %s', product.name, price, pricelist.currency_id.symbol)
                product_data.append({
                    'id': product.id,
                    'variant_id': product.product_variant_id.id,
                    'name': product.name,
                    'default_code': product.default_code,
                    'image': product.image_1920,
                    'price': price,
                    'currency': pricelist.currency_id.symbol,
                })
                
            _logger.info('Final product_data length: %d', len(product_data))
            _logger.info('=== CONTROLLER DEBUG END ===')
            return {'products': product_data}
            
        except Exception as e:
            _logger.error('Error in get_latest_products: %s', str(e))
            return {'error': str(e), 'products': []}