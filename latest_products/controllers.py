from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)

class LatestProductsController(http.Controller):
    @http.route('/latest_products/snippet', type='json', auth='public', website=True)
    def get_latest_products(self, pricelist_id=None, product_type='latest', **kwargs):
        _logger.info('--- CONTROLLER: get_latest_products ---')
        _logger.info(f'Pricelist ID recibido: {pricelist_id} (tipo: {type(pricelist_id)})')
        _logger.info(f'Product type: {product_type}')
        try:
            Pricelist = http.request.env['product.pricelist']
            Product = http.request.env['product.template']
            
            try:
                pricelist_id = int(pricelist_id) if pricelist_id is not None else 0
            except (ValueError, TypeError):
                _logger.warning(f'Pricelist ID inválido: {pricelist_id}. Se usará 0.')
                pricelist_id = 0

            _logger.info(f'Pricelist ID procesado: {pricelist_id}')

            products = []
            pricelist = None
            
            # Determinar el orden según el tipo de producto
            if product_type == 'best_sellers':
                order = 'sales_count desc'
                _logger.info('Modo: Productos más vendidos.')
            else:
                order = 'create_date desc'
                _logger.info('Modo: Últimos productos.')
            
            if pricelist_id == 0:
                _logger.info(f'Búsqueda de todos los productos publicados con orden: {order}')
                products = Product.search([
                    ('is_published', '=', True),
                    ('website_published', '=', True)
                ], limit=8, order=order)
            else:
                _logger.info(f'Búsqueda por tarifa específica (ID: {pricelist_id}) con orden: {order}')
                pricelist = Pricelist.browse(pricelist_id)
                if not pricelist.exists():
                    _logger.warning(f'La tarifa con ID {pricelist_id} no existe.')
                    return {'error': 'Pricelist not found', 'products': []}
                
                _logger.info(f'Tarifa encontrada: {pricelist.name}')
                _logger.info(f'Items en la tarifa: {len(pricelist.item_ids)}')
                product_ids = [item.product_tmpl_id.id for item in pricelist.item_ids]
                _logger.info(f'IDs de productos extraídos de la tarifa: {product_ids}')

                if product_ids:
                    products = Product.search([
                        ('id', 'in', product_ids),
                        ('is_published', '=', True),
                        ('website_published', '=', True)
                    ], limit=8, order=order)
            
            _logger.info(f'Número de productos encontrados: {len(products)}')

            product_data = []
            for product_template in products:
                product_variant = product_template.product_variant_id
                if not product_variant:
                    _logger.warning(f'El producto {product_template.name} (ID: {product_template.id}) no tiene una variante de producto predeterminada y será omitido.')
                    continue

                price_info = product_variant._get_combination_info_variant(pricelist=pricelist)
                _logger.info(f'Procesando producto: {product_template.name} (ID: {product_template.id}), Precio: {price_info.get("price")}')
                product_data.append({
                    'id': product_template.id,
                    'name': product_template.name,
                    'code': product_template.default_code or '',
                    'price': price_info.get('price', 0),
                    'currency': pricelist.currency_id.name if pricelist else http.request.website.currency_id.name,
                    'image': product_template.image_1920,
                    'variant_id': price_info.get('product_id', product_variant.id)
                })
            
            _logger.info(f'Datos finales a enviar: {product_data}')
            return {'products': product_data}

        except Exception as e:
            _logger.error(f'Error catastrófico en el controlador: {e}', exc_info=True)
            return {'error': str(e), 'products': []}