# -*- coding: utf-8 -*-

{
    'name': 'Pos Credit Card Payments',
    'version': '0.1',
    'category': 'Point of Sale',
    'sequence': 6,
    'summary': ' Pos Credit card Payments for POS',
    'depends': ['web', 'barcodes', 'point_of_sale'],
    'data': [
        'data/pos_cc_payments_data.xml',
        'views/pos_cc_payments_templates.xml',
    ],
    'demo': [
    ],
    'qweb': [
        'static/src/xml/pos_cc_payments.xml',
    ],
    'installable': True,
    'auto_install': False,
}
