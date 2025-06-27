from odoo import http
from odoo.http import request

class LatestProductsController(http.Controller):
    @http.route('/latest_products/snippet', type='json', auth='public')
    def get_latest_products(self):
        pricelist = request.env['product.pricelist'].sudo().browse(1573)
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