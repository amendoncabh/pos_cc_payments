Pos Credit Card Payments
========================

This module is just a mock.

1. Add new pos payment method “Credit Card” → by xml data → pos payment (account.journal) type “bank”.
1. When selected → Display: “Waiting pinpad feedback…” in a pop up (only mock up)

    * Use js settimeout to display another popup (step 3) and hide current popup
    * Cancel button will lead us to go back to payment screen (no payment added)

    ![screenshot1](/pos_cc_payments/_docs/screenshot1.png?raw=true)

1. Pop up: “Insert Cardholder name” ( will stored on new field on payment object -
card_holder → char → account.bank.statement.line)

    * Confirm, pass to step 4 (system records cardholder name) → cannot be empty
    * Cancel button will lead us to go back to payment screen (no payment added)

    ![screenshot2](/pos_cc_payments/_docs/screenshot2.png?raw=true)

1. POS asks whether to pay for the transaction in credit or with points. Display the following pop up → user select point/credit then go to step 5

    * Add additional button “back” → will go to previous popup (in case cashier want to change card holder name)
    * Data selected will stored on new field on payment object account.bank.statement.line
        * Pay_point = boolean
        * Pay_credit = boolean

    ![screenshot3](/pos_cc_payments/_docs/screenshot3.png?raw=true)

1. Loading popup will appear (loading progress only mock up)

    ![screenshot4](/pos_cc_payments/_docs/screenshot4.png?raw=true)

1. Payment added → this payment can be combined with normal cash payment → pos order validated and data inputed stored in new fields on backend accordingly.