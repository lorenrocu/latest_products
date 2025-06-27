from odoo import http
from odoo.http import request

class LatestProductsController(http.Controller):
    @http.route('/latest_products/snippet', type='http', auth='public')
    def get_latest_products(self, **kw):
        # Buscar todas las listas de precios
        pricelists = request.env['product.pricelist'].sudo().search([])
        # Construir una respuesta de texto con nombre e ID
        response = '\n'.join([
            f"{pl.id}: {pl.name}" for pl in pricelists
        ])
        return response or 'No se encontraron listas de precios.'

    @http.route('/latest_products/snippet', type='json', auth='public')
    def get_latest_products_json(self):
        pricelist = request.env['product.pricelist'].sudo().search([
            ('name', '=', 'PRECIOS WEB Y ODOO ($-USD) (USD)')
        ], limit=1)
        if not pricelist:
            return {'products': []}
        products = request.env['product.template'].sudo().search(
            [('website_published', '=', True)],
            order='create_date desc', limit=8
        )
        product_data = []
        for product in products:
            price = pricelist.price_get(product.product_variant_id.id, 1)[pricelist.id]
            product_data.append({
                'id': product.id,
                'name': product.name,
                'default_code': product.default_code,
                'image': product.image_1920,
                'price': price,
                'currency': pricelist.currency_id.symbol,
            })
        return {'products': product_data} 