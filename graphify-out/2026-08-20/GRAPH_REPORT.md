# Graph Report - tech4all_standard_pos  (2026-08-20)

## Corpus Check
- 236 files · ~98,882 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 991 nodes · 1156 edges · 197 communities (121 shown, 76 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `15a2441c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- posapp.py
- OrderSummary.vue
- ProductList.vue
- PaymentNew.vue
- payment_entry.py
- invoice.py
- devDependencies
- POSClosingShift
- dependencies
- pos_closing_shift.js
- Header.vue
- zaraPos/Home.vue
- PosClosingDialog.vue
- pos_opening_shift.py
- MaterialRequestOverride
- compilerOptions
- MpesaPaymentRegister
- What You Must Do When Invoked
- customer.py
- setup
- CustomerScreen.vue
- AutomatedBOMManufacturing
- get_invoice_doc
- format.js
- posapp/Home.vue
- HoldOrders.vue
- OrderHistory.vue
- printing.js
- README.md
- plugins/index.js
- custom_calculate_taxes_and_totals
- bus.js
- tax_integration.js
- stock_entry_tech4all_pos.py
- goForPayment
- js/posapp/posapp.js
- BranchRequisitionTemplate
- branch_warehouses
- download_feedback_qr_code
- submitSaleInvoice
- POSPRA
- BranchDiscountPolicyEmployees
- get_items
- defaultValue
- docs.py
- get_item_details_custom
- sales_invoice_custom.py
- submitCustomerDialog
- cancelSplit
- sales_order_on_submit
- get_qr_data
- TestAutomatedBOMManufacturing
- BranchDiscountPolicy
- TestBranchDiscountPolicyEmployees
- TestBranchDiscountPolicy
- BranchRequisitionTemplateItems
- TestBranchRequisitionTemplate
- BranchRequisitionTypeMapping
- BranchWarehouse
- DeliveryChargesPOSProfile
- DeliveryChargesRange
- PaymentIntegrationMethods
- TestPOSBranchDepository
- POSClosingShiftDetail
- POSClosingShiftTaxes
- POSCouponDetail
- POSOfferDetail
- POSOffer
- POSOpeningShiftDetail
- POSPaymentEntryReference
- POSPaymentIntegration
- TestPOSPaymentIntegration
- POSProfileEmployee
- SalesInvoiceReference
- SentimentAnalysisReport
- TestSentimentAnalysisReport
- page/posapp/posapp.js
- pra_data.py
- uninstall.py
- loads
- sales_invoice
- dependencies
- Vuetify (Default)
- Customer.vue
- defaultSaleOrderValue
- deleteItem
- resetAllAmounts
- get_variants
- nextStep
- store/index.js
- test_delivery_charges.py
- test_mpesa_c2b_register_url.py
- test_mpesa_payment_register.py
- test_pos_coupon.py
- test_pos_offer.py
- test_pos_opening_shift.py
- test_referral_code.py
- AppFooter.vue
- graphify reference: extra exports and benchmark
- vuetify-project/package.json
- create_payment_request
- get_item_detail
- graphify reference: query, path, explain
- create_sales_order_from_pos
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- createPreInvoice
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- get_customer_groups
- Components
- CLAUDE.md
- .claude/CLAUDE.md
- extraction-spec.md
- eslint-config-standard
- eslint-plugin-import
- eslint-plugin-n
- eslint-plugin-node
- eslint-plugin-promise
- get_app_branch
- get_root_of
- get_version
- unplugin-fonts
- unplugin-vue-components
- vite-plugin-vuetify
- @vitejs/plugin-vue
- pages/README.md
- plugins/README.md
- styles/README.md

## God Nodes (most connected - your core abstractions)
1. `loads()` - 28 edges
2. `eventBus` - 12 edges
3. `What You Must Do When Invoked` - 12 edges
4. `/graphify` - 11 edges
5. `sales_invoice()` - 9 edges
6. `AutomatedBOMManufacturing` - 9 edges
7. `POSClosingShift` - 9 edges
8. `MaterialRequestOverride` - 8 edges
9. `indexedDBService` - 8 edges
10. `compilerOptions` - 8 edges

## Surprising Connections (you probably didn't know these)
- `create_automated_bom_manufacturing()` --calls--> `loads()`  [EXTRACTED]
  tech4all_standard_pos/tech4all_standard_pos/doctype/automated_bom_manufacturing/automated_bom_manufacturing.py → tech4all_standard_pos/json_compat.py
- `setup()` --calls--> `logOut()`  [INFERRED]
  tech4all_standard_pos/public/js/posapp/components/Navbar1.vue → tech4all_standard_pos/public/js/posapp/components/zaraPos/Header.vue
- `setup()` --calls--> `getHoldOrders()`  [INFERRED]
  tech4all_standard_pos/public/js/posapp/components/Navbar1.vue → tech4all_standard_pos/public/js/posapp/components/zaraPos/HoldOrders.vue
- `setup()` --indirect_call--> `handleOffline()`  [INFERRED]
  tech4all_standard_pos/public/js/posapp/components/Navbar1.vue → tech4all_standard_pos/public/js/posapp/components/zaraPos/ProductList.vue
- `sales_invoice()` --calls--> `get_bank_cash_account()`  [INFERRED]
  tech4all_standard_pos/tech4all_standard_pos/api/posapp.py → tech4all_standard_pos/tech4all_standard_pos/api/payment_entry.py

## Import Cycles
- None detected.

## Communities (197 total, 76 thin omitted)

### Community 0 - "posapp.py"
Cohesion: 0.11
Nodes (28): build_item_cache(), check_opening_shift(), create_bundle_from_item(), create_opening_voucher(), create_sales_invoice_from_order(), delete_invoice(), delete_sales_invoice(), get_active_gift_coupons() (+20 more)

### Community 1 - "OrderSummary.vue"
Cohesion: 0.04
Nodes (39): customerLoading, customers, dispathLoading, formData, getSpeedRes, grandTotal, grandTotalCard, gstAmount (+31 more)

### Community 2 - "ProductList.vue"
Cohesion: 0.04
Nodes (34): addOnPanel, bundleArray, calledBundleApi, categories, currentStep, defaultImg, filteredProducts, getAllItems (+26 more)

### Community 3 - "PaymentNew.vue"
Cohesion: 0.05
Nodes (27): activeField, amountTake, amountTakeField, availableDiscounts, btnLoading, btnLoading1, changeAmount, confirmSplit (+19 more)

### Community 4 - "payment_entry.py"
Cohesion: 0.10
Nodes (20): JSON helpers backed by orjson while retaining the stdlib json API shape., confirmation(), get_mpesa_draft_payments(), get_mpesa_mode_of_payment(), get_token(), whitelist, submit_mpesa_payment(), validation() (+12 more)

### Community 5 - "invoice.py"
Cohesion: 0.10
Nodes (22): add_loyalty_point(), auto_set_delivery_charges(), before_cancel(), before_submit(), calc_delivery_charges(), close_linked_sales_order(), create_sales_order(), make_sales_order() (+14 more)

### Community 6 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, eslint-plugin-vue, sass, unplugin-vue-router, vite, devDependencies, eslint, eslint-plugin-vue (+5 more)

### Community 7 - "POSClosingShift"
Cohesion: 0.16
Nodes (11): patch, get_cashiers(), get_payments_entries(), make_closing_shift_from_opening(), POSClosingShift, Document, get_pos_invoices(), whitelist (+3 more)

### Community 8 - "dependencies"
Cohesion: 0.11
Nodes (17): lodash, mitt, dependencies, lodash, mitt, qrcode, quasar, vue (+9 more)

### Community 9 - "pos_closing_shift.js"
Cohesion: 0.23
Nodes (14): add_pos_payment_to_payments(), add_to_payments(), add_to_pos_payments(), add_to_pos_transaction(), add_to_taxes(), get_pos_payments(), get_value(), get_pos_invoices() (+6 more)

### Community 10 - "Header.vue"
Cohesion: 0.13
Nodes (8): currentScreen, emitSearchEvent, orderTypes, pos_profile, searchValue, selectedOrderType, selectedTable, tableArray

### Community 11 - "zaraPos/Home.vue"
Cohesion: 0.15
Nodes (10): check_opening_entry(), coupons, create_opening_voucher(), dialog, offers, payment, pos_opening_shift, pos_profile (+2 more)

### Community 12 - "PosClosingDialog.vue"
Cohesion: 0.14
Nodes (9): closingDialog, confirmDialog, dialog_data, {
  flt,
  formtCurrency,
  formtFloat,
  setFormatedCurrency,
  setFormatedFloat,
  currencySymbol,
  isNumber,
}, headers, itemsPerPage, loadingBtn, pos_profile (+1 more)

### Community 13 - "pos_opening_shift.py"
Cohesion: 0.19
Nodes (8): OverAllowanceError, Document, StatusUpdater, add_opening_cash(), change_status_to_open(), check_opening_cash(), POSOpeningShift, whitelist

### Community 14 - "MaterialRequestOverride"
Cohesion: 0.26
Nodes (7): MaterialRequest, get_branch_stock_and_rate(), make_in_transit_stock_entry(), MaterialRequestOverride, whitelist, receive_in_transit_stock_entry(), receive_purchase_order()

### Community 15 - "compilerOptions"
Cohesion: 0.15
Nodes (12): dom, dom.iterable, esnext, scripthost, compilerOptions, allowJs, baseUrl, lib (+4 more)

### Community 16 - "MpesaPaymentRegister"
Cohesion: 0.21
Nodes (8): get_invoiced_qty_map(), get_returned_qty_map(), make_purchase_invoice(), whitelist, returns a map: {so_detail: returned_qty}, returns a map: {pr_detail: invoiced_qty}, MpesaPaymentRegister, Document

### Community 17 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 18 - "customer.py"
Cohesion: 0.23
Nodes (8): after_insert(), create_customer_referral_code(), create_gift_coupon(), validate(), validate_referral_code(), create_referral_code(), Document, ReferralCode

### Community 19 - "setup"
Cohesion: 0.22
Nodes (10): setup(), logOut(), getHoldOrders(), fetchUnsyncedSalesInvoiceRecords(), handleOnline(), markRecordAsSynced(), syncSalesInvoiceRecord(), syncSalesInvoicesFromIndexedDB() (+2 more)

### Community 20 - "CustomerScreen.vue"
Cohesion: 0.20
Nodes (8): grandTotal, gstAmount, invoiceDoc, items, netTotal, screen, constructor(), make_body()

### Community 21 - "AutomatedBOMManufacturing"
Cohesion: 0.27
Nodes (3): AutomatedBOMManufacturing, create_automated_bom_manufacturing(), Document

### Community 22 - "get_invoice_doc"
Cohesion: 0.29
Nodes (6): generateKotPrint(), get_invoice_doc(), get_payments(), getCurrentDate(), pushToSalesOrder(), printKot()

### Community 23 - "format.js"
Cohesion: 0.24
Nodes (4): formtCurrency(), formtFloat(), setFormatedCurrency(), setFormatedFloat()

### Community 25 - "HoldOrders.vue"
Cohesion: 0.22
Nodes (3): orders, pos_profile, selectedOrder

### Community 26 - "OrderHistory.vue"
Cohesion: 0.20
Nodes (5): itemloading, orders, pos_profile, selectedOrder, indexedDBService

### Community 28 - "README.md"
Cohesion: 0.12
Nodes (15): An open-source Point of Sale for [Tech4All](https://github.com/frappe/erpnext) using [Vue.js](https://github.com/vuejs/vue) and [Vuetify](https://github.com/vuetifyjs/vuetify), Community Support:, Contributing, Dependencies:, How to Install, How To Use:, License, Main Features (+7 more)

### Community 29 - "plugins/index.js"
Cohesion: 0.32
Nodes (3): app, registerPlugins(), router

### Community 30 - "custom_calculate_taxes_and_totals"
Cohesion: 0.33
Nodes (4): calculate_taxes_and_totals, SalesInvoice, custom_calculate_taxes_and_totals, customSalesInvoice

### Community 32 - "tax_integration.js"
Cohesion: 0.48
Nodes (5): fetchQRData(), get_fbr_invoice_id(), get_items_list_for_fbr(), get_order_data_for_fbr(), sync_fbr()

### Community 33 - "stock_entry_tech4all_pos.py"
Cohesion: 0.53
Nodes (5): before_validate(), on_update(), on_update_after_submit(), update_material_request_status(), validate_warehouse()

### Community 34 - "goForPayment"
Cohesion: 0.33
Nodes (6): getInvoiceFromOrderDoc(), goForPayment(), onEnterKey(), paymentProcess(), processInvoiceFromOrder(), updateInvoiceFromOrder()

### Community 37 - "branch_warehouses"
Cohesion: 0.50
Nodes (4): branch_warehouses(), get_pos_submit_report_items(), whitelist, validate_and_sanitize_search_inputs

### Community 38 - "download_feedback_qr_code"
Cohesion: 0.40
Nodes (3): download_feedback_qr_code(), whitelist, Download QR Code for feedback

### Community 39 - "submitSaleInvoice"
Cohesion: 0.40
Nodes (5): getFormattedPrintFormat(), load_print_page(), setDefaultValue(), submitSaleInvoice(), printInvoice()

### Community 43 - "get_items"
Cohesion: 0.67
Nodes (3): changeCategory(), get_items(), handleOffline()

### Community 44 - "defaultValue"
Cohesion: 0.50
Nodes (4): closeDialog(), defaultValue(), getItemBundle(), submitSelection()

### Community 48 - "submitCustomerDialog"
Cohesion: 0.67
Nodes (3): closeCustomerDialog(), getCustomerNames(), submitCustomerDialog()

### Community 49 - "cancelSplit"
Cohesion: 0.67
Nodes (3): cancelSplit(), changePaymentType(), closeDialog()

### Community 81 - "loads"
Cohesion: 0.14
Nodes (15): memoryview, loads(), Deserialize JSON from the input types accepted by Frappe request methods., create_customer(), create_customer_with_address(), get_all_Table_names(), get_customer_by_mobile(), get_customer_names() (+7 more)

### Community 82 - "sales_invoice"
Cohesion: 0.25
Nodes (11): Any, dumps(), Serialize JSON to text, as ``json.dumps`` does. orjson returns UTF-8 bytes.…, add_taxes_from_tax_template(), Automatically select `batch_no` for outgoing items in item table, redeeming_customer_credit(), sales_invoice(), set_batch_nos_for_bundels() (+3 more)

### Community 83 - "dependencies"
Cohesion: 0.18
Nodes (11): core-js, @mdi/font, roboto-fontface, dependencies, core-js, @mdi/font, roboto-fontface, vue (+3 more)

### Community 84 - "Vuetify (Default)"
Cohesion: 0.20
Nodes (9): Building for Production, ✨ Features, ❗️ Important Links, 💿 Install, 📑 License, Starting the Development Server, 💪 Support Vuetify Development, 💡 Usage (+1 more)

### Community 165 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 166 - "vuetify-project/package.json"
Cohesion: 0.25
Nodes (7): name, scripts, build, dev, lint, preview, version

### Community 167 - "create_payment_request"
Cohesion: 0.29
Nodes (7): create_payment_request(), get_amount(), get_existing_payment_request(), get_new_payment_request(), get_payment_gateway_account(), make_payment_request(), get amount based on doctype

### Community 168 - "get_item_detail"
Cohesion: 0.29
Nodes (7): get_item_attributes(), get_item_detail(), get_item_with_rate(), get_price_list(), get_stock_availability(), get_variant_with_rate(), get_variants_addons()

### Community 169 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 170 - "create_sales_order_from_pos"
Cohesion: 0.40
Nodes (5): create_sales_order_from_pos(), Create a draft Sales Order from the current POS cart - used by KOT Print so the…, Re-write the items on a draft Sales Order created via…, _set_sales_order_items_from_pos(), update_sales_order_from_pos()

### Community 171 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 172 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 173 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 174 - "createPreInvoice"
Cohesion: 0.50
Nodes (3): createPreInvoice(), holdOrder(), printPreInvoice()

### Community 177 - "get_customer_groups"
Cohesion: 0.67
Nodes (3): get_child_nodes(), get_customer_group_condition(), get_customer_groups()

## Knowledge Gaps
- **260 isolated node(s):** `lodash`, `mitt`, `qrcode`, `quasar`, `vue` (+255 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **76 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `eventBus` connect `bus.js` to `OrderSummary.vue`, `ProductList.vue`, `PaymentNew.vue`, `Header.vue`, `zaraPos/Home.vue`, `PosClosingDialog.vue`, `HoldOrders.vue`, `OrderHistory.vue`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `indexedDBService` connect `OrderHistory.vue` to `OrderSummary.vue`, `ProductList.vue`, `PaymentNew.vue`, `Header.vue`, `zaraPos/Home.vue`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `loads()` connect `loads` to `posapp.py`, `payment_entry.py`, `create_payment_request`, `get_item_detail`, `POSClosingShift`, `create_sales_order_from_pos`, `sales_invoice`, `AutomatedBOMManufacturing`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `lodash`, `mitt`, `qrcode` to the rest of the system?**
  _260 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `posapp.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11491935483870967 - nodes in this community are weakly interconnected._
- **Should `OrderSummary.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `ProductList.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._