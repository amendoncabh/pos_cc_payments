odoo.define('pos_cc_payments.credit_card', function (require) {
"use strict";

var screens = require('point_of_sale.screens');
var PopupWidget = require('point_of_sale.popups');
var PosBaseWidget = require('point_of_sale.BaseWidget');
var pos_model = require('point_of_sale.models');
var core = require('web.core');
var gui = require('point_of_sale.gui');

var QWeb = core.qweb;
var _t   = core._t;

var _paylineproto = pos_model.Paymentline.prototype;
pos_model.Paymentline = pos_model.Paymentline.extend({
    init_from_JSON: function (json) {
        _paylineproto.init_from_JSON.apply(this, arguments);

        this.pos_cc_payments_card_owner_name = json.pos_cc_payments_card_owner_name;
        this.pos_cc_payments_pay_points = json.pos_cc_payments_pay_points;
        this.pos_cc_payments_pay_credit = json.pos_cc_payments_pay_credit;

    },
    export_as_JSON: function () {
        return _.extend(_paylineproto.export_as_JSON.apply(this, arguments), {
            pos_cc_payments_card_owner_name:  this.pos_cc_payments_card_owner_name,
            pos_cc_payments_pay_points:  this.pos_cc_payments_pay_points,
            pos_cc_payments_pay_credit:  this.pos_cc_payments_pay_credit,
        });
    },
});

screens.PaymentScreenWidget.include({  
    click_paymentmethods: function(id) {
        var self = this;
        this._super(id);
        var paymentLines = this.pos.get_order().get_paymentlines();
        var lastSelPayment = paymentLines[paymentLines.length-1];
        //TODO:Compare journal code
        if(lastSelPayment.name.includes("Credit Card")){
            console.log("CC");
            self.cc_payment_transaction(lastSelPayment);
        }
        else{
            console.log("Cash");
        }
    },
    cancel_cc_payment_transaction: function(){
        var self = this;
        var paymentLines = this.pos.get_order().get_paymentlines();
        var lastSelPayment = paymentLines[paymentLines.length-1];
        self.pos.get_order().remove_paymentline(lastSelPayment);
        self.render_paymentlines();

    },
    cc_payment_transaction: function(){
        var self = this;
        var isCancelled = false;
        this.gui.show_popup('pinpad-check',{
            title: _t('Waiting Pinpad feedback...'),
            check: function() {
                console.log("checking");
                setTimeout(function () {
                console.log(isCancelled);
                    if(!isCancelled){
                       self.set_card_holder_name()
                    }
                }, 2000);
            },
            cancel: function(){
                console.log("cancelling");
                isCancelled = true;
                self.cancel_cc_payment_transaction();
            }
        });
    },
    set_card_holder_name: function(){
        var self = this;
        
        
        console.log("confirmed");
        self.gui.show_popup('textinput',{
            title: _t('Insert cardholder name'),
            confirm: function(value) {
               console.log("setting card holder" + value);
               var order = this.pos.get_order();
               order.selected_paymentline.pos_cc_payments_card_owner_name = value;
               self.set_payment_type();
            },
            cancel: function(){
                self.cancel_cc_payment_transaction();
            }
        });

    },
    set_payment_type: function(){
        var self = this;
        self.gui.show_popup('payment-type',{
            title: _t('Select Payment Type'),
            back: function(value) {
               console.log("Go back to set card holder name");
               self.set_card_holder_name()
            },
            points: function(){
               console.log("Pay with points");
               var order = this.pos.get_order();
               order.selected_paymentline.pos_cc_payments_pay_points = true;
               self.authorize_payment();
            },
            credit: function(){
               console.log("Pay with credit");
               var order = this.pos.get_order();
               order.selected_paymentline.pos_cc_payments_pay_credit = true;
               self.authorize_payment();
            }
        });
    },
    authorize_payment: function(){
        var self = this;
        self.gui.show_popup('authorize-payment',{
            title: _t('Waiting Authorization...'),
            check: function(value) {
               var order = this.pos.get_order();
               console.log("is payed with credit "+order.selected_paymentline.pos_cc_payments_pay_credit);
               console.log("is payed with points "+order.selected_paymentline.pos_cc_payments_pay_points);
               console.log("Card owner name "+order.selected_paymentline.pos_cc_payments_card_owner_name);
               self.order_changes();
               self.render_paymentlines();
               order.trigger('change', order); // needed so that export_to_JSON gets triggered
                
            },
        });
    }


});

var PinpadCheckPopupWidget = PopupWidget.extend({
    template: 'PinpadCheckPopupWidget',
    show: function (options) {
        var self = this;
        this._super(options);
        self.check()
    },
    check: function(){
        var self = this;
        if (this.options.check) {
            this.options.check.call(this);
        }
    }
});
gui.define_popup({name:'pinpad-check', widget: PinpadCheckPopupWidget });

var PaymentTypePopupWidget = PosBaseWidget.extend({
    template: 'PaymentTypePopupWidget',
    init: function(parent, args) {
        this._super(parent, args);
        this.options = {};
    },
    events: {
        'click .button.credit':  'click_credit',
        'click .button.points': 'click_points',
        'click .button.back': 'click_back',
    },

    // show the popup !  
    show: function(options){
        if(this.$el){
            this.$el.removeClass('oe_hidden');
        }
        
        if (typeof options === 'string') {
            this.options = {title: options};
        } else {
            this.options = options || {};
        }

        this.renderElement();

        // popups block the barcode reader ... 
        if (this.pos.barcode_reader) {
            this.pos.barcode_reader.save_callbacks();
            this.pos.barcode_reader.reset_action_callbacks();
        }
    },

    // called before hide, when a popup is closed.
    // extend this if you want a custom action when the 
    // popup is closed.
    close: function(){
        if (this.pos.barcode_reader) {
            this.pos.barcode_reader.restore_callbacks();
        }
    },

    // hides the popup. keep in mind that this is called in 
    // the initialization pass of the pos instantiation, 
    // so you don't want to do anything fancy in here
    hide: function(){
        if (this.$el) {
            this.$el.addClass('oe_hidden');
        }
    },

    // what happens when we click cancel
    // ( it should close the popup and do nothing )
    click_credit: function(){
        this.gui.close_popup();
        if (this.options.credit) {
            this.options.credit.call(this);
        }
    },

    // what happens when we confirm the action
    click_points: function(){ this.gui.close_popup();
        if (this.options.points) {
            this.options.points.call(this);
        }
    },

    // Since Widget does not support extending the events declaration
    // we declared them all in the top class.
    click_back: function(){
        this.gui.close_popup();
        if (this.options.back) {
            this.options.back.call(this);
        }
    },
});

gui.define_popup({name:'payment-type', widget: PaymentTypePopupWidget });

var AuthorizePaymentPopupWidget = PinpadCheckPopupWidget.extend({
    template: 'AuthorizePaymentPopupWidget',
});

gui.define_popup({name:'authorize-payment', widget: AuthorizePaymentPopupWidget });


});
    