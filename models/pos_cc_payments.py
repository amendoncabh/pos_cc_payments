# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import logging

from odoo import models, fields, api, _

_logger = logging.getLogger(__name__)



class AccountBankStatementLine(models.Model):
    _inherit = "account.bank.statement.line"

    pos_cc_payments_card_owner_name = fields.Char(string='Card Owner Name', help='The name of the card owner')
    pos_cc_payments_pay_points = fields.Boolean(string='Pay with Points', help='The customer pay with Points')
    pos_cc_payments_pay_credit = fields.Boolean(string='Pay with Credit', help='The customer pay with Credit')
