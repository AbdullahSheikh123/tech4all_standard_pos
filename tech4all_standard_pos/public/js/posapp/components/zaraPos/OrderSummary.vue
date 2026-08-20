<template>
  <v-card elevation="1" class="border-16 summary-main-card">
    <v-card class="pa-4 ma-3 order-card" style="background: #f4f4f4" elevation="0">
      <!-- Table Heading -->
      <v-row class="table-header">
        <v-col cols="5">
          <strong>ITEM</strong>
        </v-col>
        <v-col cols="3" class="mr-0">
          <strong>QTY.</strong>
        </v-col>
        <v-col cols="3">
          <strong>PRICE </strong>
        </v-col>
      </v-row>

      <!-- Image to show when items are empty -->
      <!-- <div v-else class="image-container">
        <img
          src="/assets/tech4all_standard_pos/js/posapp/components/pos/layerlogo.png"
          alt="No items"
          class="animated-image"
          style=""
        />
      </div> -->

      <!-- Items List -->
      <v-divider></v-divider>
      <v-row v-for="(item, index) in items" :key="item.sku" class="py-0 align-center mr-0"
        @click="openDialog(item, true)">
        <v-col cols="5" class="pr-0 pb-0">
          <div >{{ item.item_name || item.bundle_doc.custom_parent_item_name || item.bundle_doc.item_name}}</div>
          <!-- <div class="text-caption grey--text">{{ item.sku }}</div> -->
          <!-- <div class="text-caption grey--text">{{ item.rate }}</div> -->
        </v-col>
        <v-col cols="2" class="text-center px-0 pb-0">
          {{ item.qty }}
        </v-col>
        <v-col cols="4" class="text-right teal--text text--accent-4 pb-0">
          <strong>{{ pos_profile.custom_currency_symbol }} {{ item.rate * item.qty }}</strong>
        </v-col>

        <v-col cols="1" class="text-right pb-0" v-show="screen == 0">
          <!-- Delete icon -->
          <v-icon @click.stop="deleteItem(index)" color="red">mdi-delete</v-icon>
        </v-col>
        <v-col cols="12" class="py-0">
          <div v-if="item.bundle_doc?.items?.length">
            <div v-for="(bundleItem, bIndex) in item.bundle_doc.items" :key="bundleItem.item_code"
              class="text-caption grey--text ml-2">
              <div class="d-flex justify-space-between">
                <div>- {{ bundleItem.custom_item_name }}</div>
                <div>{{ bundleItem.rate }}</div>
              </div>

            </div>
          </div>
          <v-divider class="dotted-divider"></v-divider>
        </v-col>
      </v-row>
    </v-card>
    <v-row class="px-4">
      <v-col cols="12" v-show="saleOrderBtns">
        <v-btn size="large" variant="outlined" class="text-capitalize" color="#21A0A0" block
          style="background-color: #d3ecec; border-radius: 8px" @click="processSaleOrder" :loading="dispathLoading">
          <v-icon left>mdi-check-circle-outline</v-icon> Dispatch
        </v-btn>
      </v-col>
      <v-col cols="12" v-show="saleOrderBtns">
        <v-btn size="large" variant="outlined" class="text-capitalize" color="#F05D23" block
          style="background-color: #ffe4d9; border-radius: 8px" @click="defaultSaleOrderValue">
          <v-icon left>mdi-cancel</v-icon> Decline
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="px-4">
      <v-col cols="8" class="" style="  height: 64px;">
        <v-autocomplete :custom-filter="customFilter" :items="customers" item-title="customer_name" item-value="name"
          label="Select Customer" v-model="selectedCustomer" variant="outlined" class="mr-2"></v-autocomplete>
      </v-col>
      <v-col cols="4" class="" style="  height: 64px;">
        <v-btn block class="white--text font-weight-bold payment-button" height="52" color="#21A0A0"
          @click="addNewCustomer()">
          <v-icon class="mr-2" style="color: white;">mdi-plus</v-icon>
          <p class="mt-2 payment-p">New</p>
        </v-btn>
      </v-col>
    </v-row>
    <!-- <v-row class="px-4">
      <v-col
        cols="12"
        :md="paymentModes.length == 2 ? '6' : '4'"
        v-for="category in paymentModes"
        :key="category.mode_type"
        class=""
      >
        <v-btn
          variant="outlined"
          size="large"
          class="text-capitalize mr-2"
          :color="category.selected ? '#f05d23' : '#21A0A0'"
          style="
            border-radius: 8px;
            width: 300px;
            display: flex;
            align-items: center;
          "
          @click="changePaymentMode(category)"
          width="300px"
        >
          <v-icon class="pr-3">{{
            category.mode_type == "Cash" ? "mdi-cash" : "mdi-credit-card"
          }}</v-icon>
          <p class="category-p mt-2" style="white-space: normal; width: 180px">
            {{ category.mode_of_payment }}
          </p>
        </v-btn>
      </v-col>
    </v-row> -->

    <v-row justify="center" class="pb-0">
      <v-col cols="12" md="12">
        <v-card class="pa-3 mx-3 payment-card" elevation="0" style="background: #f4f4f4">
          <!-- Order Summary Header -->
          <v-row justify="space-between" align="center" class="px-3 py-2">
            <v-col cols="6">
              <strong>Order Summary</strong>
            </v-col>
            <!-- <v-col cols="6" class="text-right">
              <strong>#1200569C</strong>
            </v-col> -->
          </v-row>

          <v-divider class="mb-3"></v-divider>

          <!-- Order Details -->
          <!-- 
          <v-row justify="space-between" class="px-6 py-0">
            <v-col cols="4" class="py-0 payment-text-color">Total items:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              {{ totalItems }}
            </v-col>
          </v-row> -->
          <v-row justify="space-between" class="px-6 pb-0">
            <v-col cols="4" class="py-0 payment-text-color">Total Quantity:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              {{ totalQuantity }}
            </v-col>
          </v-row>
          <v-row justify="space-between" class="px-6 py-0">
            <v-col cols="4" class="pb-0 payment-text-color">Net Total:</v-col>
            <v-col cols="4">
              <v-divider class="mt-3 dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right pb-0 payment-text-color">
              {{ pos_profile.custom_currency_symbol }} {{ netTotal.toFixed(2) }}
            </v-col>
          </v-row>

          <v-row justify="space-between" class="px-6 py-0">
            <v-col cols="4" class="py-0 payment-text-color">GST {{ selectedPaymentMode.tax_rate }}%:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              {{ pos_profile.custom_currency_symbol }} {{ gstAmount.toFixed(2) }}
            </v-col>
          </v-row>

          <v-row justify="space-between" class="px-6 py-0">
            <v-col cols="4" class="py-0 payment-text-color">Discounts:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              {{ pos_profile.custom_currency_symbol }} 0.00
            </v-col>
          </v-row>

          <!-- Grand Total -->
          <v-row justify="space-between" class="mt-6 px-6 pb-0">
            <v-col cols="6">
              <p class="font-20">Grand Total:</p>
            </v-col>
            <v-col cols="6" class="text-right total-amount">
              <p class="total-p">{{ pos_profile.custom_currency_symbol }} {{ grandTotal.toFixed(2) }}</p>
            </v-col>
          </v-row>

          <!-- Payment Button -->
          <v-row class="mt-3 px-6 pb-1">
            <v-col cols="12">
              <v-btn block class="white--text font-weight-bold payment-button" height="48" color="#21A0A0"
                @click="goForPayment" :loading="loadingBtn" :disabled="pandaGoOrder || isSalesOrderSyncPending">
                <p class="mt-2 payment-p">PAYMENT</p>
              </v-btn>
              <p v-if="isSalesOrderSyncPending" class="text-caption text-center mt-1" style="color: #b7791f">
                This order hasn't synced yet - please wait until you're back online.
              </p>
            </v-col>
          </v-row>
          <v-row class="mt-3 px-6 pb-1">
            <v-col cols="4">
              <v-btn block class="white--text font-weight-bold payment-button" height="48" color="#21A0A0"
                @click="holdOrder()" :loading="loadingBtn">
                <p class="mt-2 payment-p">Hold</p>
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn block class="white--text font-weight-bold payment-button" height="48" color="#F05D23"
                @click="createPreInvoice()" :disabled="screen != 0">
                <p class="mt-2 print-p">Pre Invoice</p>
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn block class="white--text font-weight-bold payment-button" height="48" color="#F05D23"
                @click="generateKotPrint()" :disabled="screen != 0">
                <p class="mt-2 print-p">KOT Print</p>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <!-- Add Customer -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card style="border-radius: 24px;">
        <!-- Dialog Header -->
        <v-card-title class="d-flex justify-center align-center mt-2">
          <div class="d-flex align-center gap-2">
          </div>
          <div class="d-flex align-center gap-2">
            <v-icon color="#3D464D">mdi-account-plus</v-icon>
            <span style="color: #3D464D; font-size: 15px;font-weight: 500;" class="ml-2">Add Customer</span>
          </div>
          <div style="background: #F05D23;
              height: 21px;
              border-radius: 15px;
              position: relative;
              left: 139px;">
            <v-icon color="white" size="20px" @click="closeCustomerDialog" style="position: relative;
              bottom: 7px;">mdi-close</v-icon>

          </div>
        </v-card-title>

        <!-- Dialog Content -->
        <v-card-text class="px-15">
          <v-form ref="form" v-model="isFormValid">
            <v-text-field v-model="formData.name" label="Name" outlined required
              :rules="[rules.required]"></v-text-field>

            <v-text-field v-model="formData.phone" label="Phone Number" outlined required
              :rules="[rules.required]"></v-text-field>

            <v-text-field v-model="formData.email" label="Email Address" outlined></v-text-field>
            <v-text-field v-model="formData.cnic_ntn" label="CNIC/NTN" outlined></v-text-field>
            <v-text-field v-model="formData.post_code" label="Post code" outlined></v-text-field>


            <v-text-field v-model="formData.address" label="Address" outlined></v-text-field>

            <!-- Submit Button -->
            <v-btn block class="white--text font-weight-bold payment-button" height="45" color="#21A0A0"
              @click="submitCustomerDialog" :disabled="!isFormValid" :loading="customerLoading">
              Add Customer
            </v-btn>
          </v-form>

          <!-- Note Section -->
          <!-- <div class="mt-4 text-center">
            <span class="caption">
              NOTE: Looking for an existing customer?
              <a href="#" class="text-decoration-underline">Re-Call Customer</a>
            </span>
          </div> -->
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  watch,
  onUnmounted,
  onBeforeUnmount,
} from "vue";
import eventBus from "../../bus.js";
import indexedDBService from "../../indexedDB";
import { printPreInvoice } from "../../preinvoice";
import { printKotSmart } from "../../qzKotPrint.js";

const items = ref([
  // {
  //   name: "Gul Bahaar",
  //   sku: "SKU:10145687-c12",
  //   qty: 1,
  //   rate: "Rs. 270,000/-",
  //   netTotal: "Rs. 270,000/-",
  // },
]);

const paymentModes = ref([
  // {
  //   type: "Card",
  //   icon: "mdi-credit-card",
  //   selected:false
  // },
  // {
  //   type: "Cash",
  //   icon: "mdi-cash",
  //   selected:true
  // },
  // {
  //   type: "Transfer",
  //   icon: "mdi-swap-horizontal",
  //   selected:false
  // },
]);
const selectedCustomer = ref('');
const customers = ref([
  // Example customer list
  // { text: "John Doe", value: 1 },
  // { text: "Jane Smith", value: 2 },
  // { text: "Alice Johnson", value: 3 },
]);
const showDialog = ref(false); // Control the dialog visibility
const isFormValid = ref(false); // Form validation state
const customerLoading = ref(false); // Form validation state


// Form data
const formData = ref({
  name: "",
  phone: "",
  email: "",
  address: "",
  cnic_ntn: "",
  post_code: ''
});

// Validation rules
const rules = {
  required: (value) => !!value || "This field is required",
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || pattern.test(value) || "Invalid email address";
  },
  phone: (value) => {
    const pattern = /^[0-9]{10}$/;
    return pattern.test(value) || "Invalid phone number";
  },
};
const pos_profile = ref("");
const pos_opening_shift = ref("");
const invoice_doc = ref({});
const invoiceItems = ref([]);
const selectedPaymentMode = ref("");
const loadingBtn = ref(false);
const saleOrder = ref(false);
const loadingHold = ref(false);
const saleOrderDetail = ref("");
const selectedOrderType = ref("");
const offlineMode = ref(false);
const punching = ref("completed");
const screen = ref(0);
const speedMbps = ref(null); // Measured internet speed in Mbps
const getSpeedRes = ref(false);
const pandaGoOrder = ref(false);
// Blocks checkout while this cart is a KOT-Print order that was created/edited
// offline and hasn't synced to a real Sales Order yet (see pushToSalesOrder /
// ProductList.vue::syncSalesOrdersFromIndexedDB). Prevents an invoice from
// being settled with nothing to link to, and the queued create from landing
// later as an orphaned Sales Order.
const isSalesOrderSyncPending = computed(() => {
  return !!(
    saleOrderPayload.value &&
    saleOrderPayload.value._queueId &&
    !saleOrderPayload.value.name
  );
});
const holdOrderId = ref(null);
const saleOrderBtns = ref(false);
const saleOrderPayload = ref("");
const dispathLoading = ref(false);
const tableNo = ref("");



const totalQuantity = computed(() => {
  return items.value.reduce((acc, item) => acc + item.qty, 0);
});
const totalItems = computed(() => items.value.length);

// const netTotal = ref(0);
// const gstAmount = ref(0);
// const grandTotal = ref(0);

const netTotal = computed(() => {
  const total = items.value.reduce((acc, item) => acc + item.netTotal, 0);
  let taxrate = selectedPaymentMode.value?.tax_rate / 100 || 0;

  // Calculate GST amount with the correct tax rate
  const gstAmount = parseFloat((total * taxrate).toFixed(2));
  let taxIncludeNetamount = 0;
  if (pos_profile.value.posa_tax_inclusive) {
    taxrate = 1 + selectedPaymentMode.value?.tax_rate / 100 || 0;
    taxIncludeNetamount = total / taxrate;
  }

  // If posa_tax_inclusive is true, subtract GST amount from total
  const finalAmount = pos_profile.value.posa_tax_inclusive
    ? taxIncludeNetamount
    : total;
  return finalAmount;
});
const netTotalCard = computed(() => {
  const total = items.value.reduce((acc, item) => acc + item.netTotal, 0);
  let taxrate = 5 / 100 || 0;

  // Calculate GST amount with the correct tax rate
  const gstAmount = parseFloat((total * taxrate).toFixed(2));
  let taxIncludeNetamount = 0;
  if (pos_profile.value.posa_tax_inclusive) {
    taxrate = 1 + (5 / 100 || 0);
    taxIncludeNetamount = total / taxrate;
  }

  // If posa_tax_inclusive is true, subtract GST amount from total
  const finalAmount = pos_profile.value.posa_tax_inclusive
    ? taxIncludeNetamount
    : total;
  return finalAmount;
});

const gstAmount = computed(() => {
  const total = items.value.reduce((acc, item) => acc + item.netTotal, 0);
  let taxrate = selectedPaymentMode.value?.tax_rate / 100 || 0;

  // Calculate GST amount with the correct tax rate
  let gstAmount = parseFloat((total * taxrate).toFixed(2));
  if (pos_profile.value.posa_tax_inclusive) {
    taxrate = 1 + selectedPaymentMode.value?.tax_rate / 100 || 0;
    taxIncludeNetamount = total / taxrate;
    gstAmount = total - taxIncludeNetamount;
  }

  return gstAmount; // 16% GST
});
const gstAmountCard = computed(() => {
  const total = items.value.reduce((acc, item) => acc + item.netTotal, 0);
  let taxrate = 5 / 100 || 0;

  // Calculate GST amount with the correct tax rate
  let gstAmount = parseFloat((total * taxrate).toFixed(2));
  if (pos_profile.value.posa_tax_inclusive) {
    taxrate = 1 + (5 / 100 || 0);
    taxIncludeNetamount = total / taxrate;
    gstAmount = total - taxIncludeNetamount;
  }

  return gstAmount; // 16% GST
});
const grandTotal = computed(() => {
  return netTotal.value + gstAmount.value;
});
const grandTotalCard = computed(() => {
  return netTotalCard.value + gstAmountCard.value;
});
// watch(
//   items,
//   (newVal) => {
//     if (newVal) {
//       const total = items.value.reduce(
//         (acc, item) => acc + item.netTotal,
//         0
//       );
//       const taxRate = (selectedPaymentMode.value?.tax_rate || 0) / 100;

//       if (pos_profile.value.posa_tax_inclusive) {
//         // Tax-Inclusive Calculations
//         const taxDivisor = 1 + taxRate;
//         netTotal.value = parseFloat((total / taxDivisor).toFixed(2)); // Net total excluding tax
//         gstAmount.value = parseFloat((total - netTotal.value).toFixed(2)); // GST amount
//         grandTotal.value = total; // Grand total remains the original total
//       } else {
//         // Tax-Exclusive Calculations
//         netTotal.value = parseFloat(total.toFixed(2)); // Net total is the sum of all items
//         gstAmount.value = parseFloat((total * taxRate).toFixed(2)); // GST amount
//         grandTotal.value = parseFloat(
//           (netTotal.value + gstAmount.value).toFixed(2)
//         ); // Grand total
//       }
//     }
//   },
//   { deep: true } // Ensures nested changes in objects are tracked
// );
const changePaymentMode = (mode) => {
  selectedPaymentMode.value = mode;
  paymentModes.value.forEach((item) => {
    if (item == mode) {
      item.selected = true;
    } else {
      item.selected = false;
    }
  });
};
const openDialog = (product, flag) => {
  if (!saleOrder.value) {
    const obj = {
      product,
      flag,
    };
    eventBus.emit("open-product-dialog", obj);
  }
};
const addNewCustomer = () => {
  showDialog.value = true;
}

const submitCustomerDialog = async () => {
  try {
    const args = {
      customer_id: '',
      customer_name: formData.value.name,
      company: pos_profile.value.company,
      mobile_no: formData.value.phone,
      email_id: formData.value.email,
      post_code: formData.post_code,
      custom_cnic__ntn: formData.cnic_ntn,
      customer_group: pos_profile.value.customer_groups[0].customer_group,
      method: 'create',
      pos_profile_doc: pos_profile.value,
    };
    customerLoading.value = true
    const response = await frappe.call({
      method: "tech4all_standard_pos.tech4all_standard_pos.api.posapp.create_customer",
      args: args,
    });
    console.log("res", response)
    if (response.message) {
      selectedCustomer.value = response.message.name
      eventBus.emit("show_mesage", {
        text: `Customer created successfully...`,
        color: "success",
      });
      frappe.utils.play_sound('submit');
      closeCustomerDialog();
    } else {
      frappe.utils.play_sound('error');
      eventBus.emit("show_mesage", {
        text: `Customer creation failed.`,
        color: "success",
      });
    }
    getCustomerNames(pos_profile.value)
    customerLoading.value = false
  } catch (error) {
    customerLoading.value = false
    console.error("Error fetching invoice document:", error);
  }
};
const closeCustomerDialog = () => {
  showDialog.value = false;
  formData.value = {
    name: '',
    phone: '',
    email: '',
    address: ''
  };
}
const getCustomerNames = (profile) => {
  frappe.call({
    method: 'tech4all_standard_pos.tech4all_standard_pos.api.posapp.get_customer_names',
    args: {
      pos_profile: profile,
    },
    callback: (response) => {
      if (response.message) {
        const customerData = response.message;
        customers.value = customerData;
        // customers.value = customerData;
        // if (pos_profile.value.posa_local_storage) {
        //   localStorage.setItem('customer_storage', '');
        //   localStorage.setItem('customer_storage', JSON.stringify(customerData));
        // }
      }
    },
  });
};
const customFilter = (itemTitle, queryText, item) => {
  const textOne = item.raw.name.toLowerCase()
  const textTwo = item.raw.mobile_no ? item.raw.mobile_no.toLowerCase() : ""; // Handle null or undefined
  const searchText = queryText.toLowerCase()

  return textOne.indexOf(searchText) > -1 ||
    textTwo.indexOf(searchText) > -1
}
const createPreInvoice = async () => {
  if (items.value.length > 0) {
    const doc = await get_invoice_doc();
    doc.grand_total = grandTotal.value;
    doc.gstAmountCash = gstAmount.value;
    doc.gstAmountCard = gstAmountCard.value;
    doc.grand_total_card = grandTotalCard.value;
    
    // Add the cart items data to the document
    doc.cart_items = items.value.map(item => ({
      item_name: item.bundle_doc?.custom_parent_item_name || item.item_name || item.bundle_doc?.item_name,
      qty: item.qty,
      rate: item.rate,
      amount: item.rate * item.qty,
      bundle_items: item.bundle_doc?.items?.map(bundleItem => ({
        item_name: bundleItem.custom_item_name,
        rate: bundleItem.rate
      })) || []
    }));

    console.log("pre-invoice with cart data", doc);
    printPreInvoice(doc);
    holdOrder();
  }
};
const generateKotPrint = async () => {
  if (items.value.length > 0) {
    const doc = await get_invoice_doc();
    doc.grand_total = grandTotal.value;
    doc.gstAmountCash = gstAmount.value;
    doc.gstAmountCard = gstAmountCard.value;

    // Add the items data specifically for KOT
    doc.kot_items = items.value.map(item => ({
      item_code: item.item_code,
      name: item.bundle_doc?.custom_parent_item_name || item.item_name || item.bundle_doc?.item_name,
      qty: item.qty,
      rate: item.rate,
      bundle_items: item.bundle_doc?.items?.map(bundleItem => ({
        name: bundleItem.custom_item_name,
        rate: bundleItem.rate
      })) || []
    }));

    console.log("KOT data", doc);
    printKotSmart(doc, pos_profile.value.custom_branch);
    await pushToSalesOrder(doc);
  }
};



// const holdOrder = () => {
//   // Start loading indicator
//   if (items.value.length > 0) {
//     loadingHold.value = true;

//     // Create a unique ID for the order
//     const heldOrders = JSON.parse(localStorage.getItem("heldOrders")) || [];
//     const nextOrderId = `Hold-Order-${heldOrders.length + 1}`;

//     // Add the current order with a holdOrderId
//     const currentOrder = {
//       id: nextOrderId,
//       items: items.value,
//       grand_total: grandTotal.value,
//       timestamp: new Date().toISOString(),
//     };
//     heldOrders.push(currentOrder);

//     localStorage.setItem("heldOrders", JSON.stringify(heldOrders));

//     // Clear the current order for a new one
//     items.value = [];

//     // Stop loading indicator
//     loadingHold.value = false;
//     eventBus.emit("open-product-menu");
//     eventBus.emit("set-default-value");
//     console.log("Order held successfully:", currentOrder);
//   }
// };
const holdOrder = () => {
  if (items.value.length > 0) {
    loadingHold.value = true; // Start loading indicator

    // Retrieve held orders from localStorage
    const heldOrders = JSON.parse(localStorage.getItem("heldOrders")) || [];

    if (holdOrderId.value) {
      // Update existing order if holdOrderId is present
      const existingOrderIndex = heldOrders.findIndex(
        (order) => order.id === holdOrderId.value
      );

      if (existingOrderIndex !== -1) {
        // Update the existing order
        heldOrders[existingOrderIndex] = {
          ...heldOrders[existingOrderIndex],
          items: items.value,
          grand_total: grandTotal.value,
          timestamp: new Date().toISOString(),
        };
        console.log(
          `Order updated successfully: ${heldOrders[existingOrderIndex].id}`
        );
      } else {
        console.warn(`Order with ID ${holdOrderId.value} not found.`);
      }
    } else {
      // Create a new order if no holdOrderId is present
      const nextOrderId = `Hold-Order-${heldOrders.length + 1}`;
      const currentOrder = {
        id: nextOrderId,
        items: items.value,
        grand_total: grandTotal.value,
        timestamp: new Date().toISOString(),
      };
      heldOrders.push(currentOrder);
      console.log("Order held successfully:", currentOrder);
    }

    // Update localStorage with the modified held orders
    localStorage.setItem("heldOrders", JSON.stringify(heldOrders));

    // Clear the current order for a new one
    items.value = [];
    loadingHold.value = false; // Stop loading indicator
    eventBus.emit("open-product-menu");
    eventBus.emit("set-default-value");
  }
};

// KOT Print no longer goes into Hold Orders (that list is reserved for the
// explicit Hold button). Instead it creates/updates a draft Sales Order so
// the ticket shows up on the Sale Orders screen. The Sales Order stays a
// draft - editable via reprints - until final checkout submits it (see
// invoice.py::close_linked_sales_order).
//
// Works the same whether online or offline: online writes straight to the
// Sales Order doctype; offline queues the same payload in IndexedDB
// (create_sales_order store) and ProductList.vue's background sync pushes it
// once connectivity returns - mirrors how Sales Invoice offline queuing works.
const pushToSalesOrder = async (doc) => {
  loadingHold.value = true; // Start loading indicator
  const isOffline = !navigator.onLine || offlineMode.value;

  try {
    if (isOffline) {
      await indexedDBService.openDatabase();

      if (saleOrderPayload.value && saleOrderPayload.value._queueId) {
        // Same not-yet-synced offline ticket reprinted - update the queued record in place
        await indexedDBService.updateSalesOrderQueue(
          saleOrderPayload.value._queueId,
          doc
        );
      } else if (saleOrderPayload.value && saleOrderPayload.value.name) {
        // Editing an already-synced Sales Order while offline - queue an update against it
        await indexedDBService.saveSalesOrderQueue(
          "update",
          saleOrderPayload.value.name,
          doc
        );
      } else {
        const queueId = await indexedDBService.saveSalesOrderQueue(
          "create",
          null,
          doc
        );
        saleOrderPayload.value = {
          _queueId: queueId,
          _syncStatus: "Pending",
          name: null,
          items: doc.items,
          grand_total: doc.grand_total,
          customer: doc.customer,
        };
      }
    } else if (saleOrderPayload.value && saleOrderPayload.value.name) {
      // Same ticket printed again (items were added/removed) - update it in place
      await frappe.call({
        method:
          "tech4all_standard_pos.tech4all_standard_pos.api.posapp.update_sales_order_from_pos",
        args: { name: saleOrderPayload.value.name, data: doc },
      });
    } else {
      const response = await frappe.call({
        method:
          "tech4all_standard_pos.tech4all_standard_pos.api.posapp.create_sales_order_from_pos",
        args: { data: doc },
      });
      if (response && response.message) {
        saleOrderPayload.value = response.message;
      }
    }
  } catch (error) {
    console.error("Error saving Sales Order from KOT print:", error);
    eventBus.emit("show_mesage", {
      text: "Failed to save order",
      color: "error",
    });
    loadingHold.value = false;
    return;
  }

  // Clear the current order for a new one, same as Hold does today
  items.value = [];
  loadingHold.value = false; // Stop loading indicator
  eventBus.emit("open-product-menu");
  eventBus.emit("set-default-value");
};

const processSaleOrder = async () => {
  try {
    dispathLoading.value = true
    const response = await frappe.call({
      method:
        "tech4all_standard_pos.tech4all_standard_pos.api.posapp.create_sales_invoice_from_order",
      args: {
        sales_order: saleOrderPayload.value.name,
      },
    });
    console.log("response", response);
    if (response && response.message) {
      // eventBus.emit("open-product-menu");
      eventBus.emit("show_mesage", {
        text: "Sale Order Proccessed Successfully",
        color: "success",
      });
      console.log("end....")
      dispathLoading.value = false
      defaultSaleOrderValue()



    }
  } catch (error) {
    console.error("Error fetching invoice document:", error);
    dispathLoading.value = false

  }
};
const defaultSaleOrderValue = () => {
  eventBus.emit("open-product-menu");
  saleOrderBtns.value = false;
  saleOrderPayload.value = "";
  items.value = [];
  pandaGoOrder.value = false;
};

const goForPayment = async () => {
  // eventBus.emit("go-for-payment");
  if (items.value.length > 0) {
    if (isSalesOrderSyncPending.value) {
      // Guards the Enter-key path too - the button itself is already
      // disabled for this case (see isSalesOrderSyncPending).
      eventBus.emit("show_mesage", {
        text: "This order hasn't synced yet. Please wait until you're back online before settling the bill.",
        color: "error",
      });
      return;
    }

    if (saleOrder.value) {
      const invoice_doc = await processInvoiceFromOrder();
      invoice_doc.value = invoice_doc;
    } else {
      // loadingBtn.value = true;
      const doc = get_invoice_doc();
      console.log("doc-payload-ready", doc);
      invoice_doc.value = doc;
      paymentProcess(invoice_doc.value);

      // if (doc.name) {
      //   return update_invoice(doc);
      // } else {
      //   return update_invoice(doc);
      // }
    }
  }
};
const paymentProcess = (doc) => {
  let grandTotalValue = grandTotal.value;
  doc.total = grandTotalValue;
  doc.net_total = netTotal.value.toFixed(2);
  doc.grand_total = grandTotalValue;
  doc.rounded_total = Math.ceil(grandTotalValue);
  doc.total_taxes_and_charges = gstAmount.value.toFixed(2);
  eventBus.emit("go-for-payment");
  eventBus.emit("updated-invoice", invoice_doc.value);
};

const processInvoiceFromOrder = async () => {
  // Fetch the invoice document
  const doc = await getInvoiceFromOrderDoc();

  // Set additional discount percentage
  // doc.additional_discount_percentage = Number(additionalDiscountPercentage.value);

  // Update or create the invoice based on the presence of `doc.name`
  if (doc.name) {
    return await updateInvoiceFromOrder(doc);
  } else {
    return updateInvoiceFromOrder(doc);
  }
};
const getInvoiceFromOrderDoc = async () => {
  let doc = {};
  try {
    const response = await frappe.call({
      method:
        "tech4all_standard_pos.tech4all_standard_pos.api.posapp.create_sales_invoice_from_order",
      args: {
        sales_order: saleOrderDetail.value.name,
      },
    });

    if (response && response.message) {
      doc = response.message;
    }
  } catch (error) {
    console.error("Error fetching invoice document:", error);
  }

  return doc;
};
const updateInvoiceFromOrder = async (doc) => {
  try {
    const response = await frappe.call({
      method:
        "tech4all_standard_pos.tech4all_standard_pos.api.posapp.update_invoice_from_order",
      args: {
        data: doc,
      },
    });

    if (response && response.message) {
      invoice_doc.value = response.message;
      eventBus.emit("go-for-payment");
      eventBus.emit("updated-invoice", invoice_doc.value);
    }
  } catch (error) {
    console.error("Error updating invoice from order:", error);
  }

  return invoice_doc.value;
};

const get_invoice_doc = () => {
  let doc = {};
  if (invoice_doc.value?.name) {
    doc = { ...invoice_doc.value };
  }
  doc.doctype = "Sales Invoice";
  doc.is_pos = 1;
  doc.ignore_pricing_rule = 1;
  doc.company = doc.company || pos_profile.value.company;
  doc.pos_profile = doc.pos_profile || pos_profile.value.name;
  doc.campaign = doc.campaign || pos_profile.value.campaign;
  doc.currency = doc.currency || pos_profile.value.currency;
  doc.naming_series = doc.naming_series || pos_profile.value.naming_series;
  doc.customer = pos_profile.value.customer;
  // Sent through to create/update_sales_order_from_pos (KOT Print's push to
  // Sales Order) so it doesn't need its own server-side POS Profile lookup -
  // this is already the same cached copy the rest of the cart is built from.
  doc.warehouse = doc.warehouse || pos_profile.value.warehouse;
  doc.items = invoiceItems.value;
  doc.total = netTotal.value;
  doc.discount_amount = 0;
  doc.additional_discount_percentage = 0;
  doc.posa_pos_opening_shift = pos_opening_shift.value.name;
  doc.payments = get_payments();
  doc.taxes = [];
  doc.is_return = "";
  doc.return_against = "";
  doc.posa_offers = [];
  doc.posa_coupons = [];
  doc.posa_delivery_charges = "";
  doc.posa_delivery_charges_rate = 0;
  doc.posting_date = getCurrentDate();
  doc.table_no = tableNo.value;
  doc.resturent_type = selectedOrderType.value;
  // doc.order_summery_for_pos = orderItems.value;
  doc.cost_center = pos_profile.value.cost_center;
  doc.custom_invoice_status = "On Hold";
  doc.sales_order = saleOrderPayload.value.name;
  (doc.total_qty = totalQuantity.value),
    (doc.holdOrderId = holdOrderId.value ? holdOrderId.value : "");

  // doc.cover = cover.value;

  return doc;
};
const get_payments = () => {
  const payments = [];
  // Filter payments by custom_order_type matching the selected order type
  pos_profile.value.payments
    .filter(
      (payment) => payment.custom_order_type === selectedOrderType.value
    )
    .forEach((payment) => {
      payments.push({
        amount: 0,
        mode_of_payment: payment.mode_of_payment,
        default: payment.default,
        account: "",
        type: payment.mode_type,
      });
    });

  return payments;
};
// const get_payments = () => {
//   const payments = [];
//   pos_profile.value.payments.forEach((payment) => {
//     payments.push({
//       amount: 0,
//       mode_of_payment: payment.mode_of_payment,
//       default: payment.default,
//       account: "",
//     });
//   });
//   return payments;
// };
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so we add 1
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const onEnterKey = (event) => {
  if (items.value.length > 0 && !loadingBtn.value) {
    goForPayment();
  }
};

const update_invoice = (doc, key, print) => {
  if (
    navigator.onLine &&
    !offlineMode.value &&
    !loadingBtn.value &&
    screen.value == 0
  ) {
    // const cleanedDoc = JSON.parse(JSON.stringify(toRaw(doc)));
    loadingBtn.value = true;
    frappe.call({
      method:
        "tech4all_standard_pos.tech4all_standard_pos.api.posapp.update_invoice",
      args: {
        data: doc,
      },
      async: false,
      callback: function (r) {
        if (r.message) {
          console.log("Online Invoice draft", r.message);
          invoice_doc.value = r.message;
          invoice_doc.value.custom_invoice_status = "On Hold";
          loadingBtn.value = false;
          eventBus.emit("go-for-payment");
          eventBus.emit("updated-invoice", invoice_doc.value);
        }
      },
      error: function (requestError) {
        loadingBtn.value = false;
        console.error("Request Error: ", requestError);
        eventBus.emit("show_message", {
          text: `Something went wrong with the request..`,
          color: "error",
        });
        frappe.utils.play_sound("error");
        loadingBtn.value = false;
      },
    });
  } else {
    punching.value = "inprocess";
    let grandTotalValue = grandTotal.value;
    doc.net_total = netTotal.value.toFixed(2);
    doc.grand_total = grandTotalValue;
    doc.rounded_total = Math.ceil(grandTotalValue);
    doc.total_taxes_and_charges = gstAmount.value.toFixed(2);
    const randomReference = `${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;
    doc.pos_referrence = randomReference;

    console.log("offline-invoice...doc", doc);
    indexedDBService
      .openDatabase()
      // .then(() => {
      //   return indexedDBService.getTableInfo("1");
      // })
      .then((tableInfo) => {
        return indexedDBService.saveUpdateInvoice(JSON.stringify(doc));
      })
      .then(() => {
        // evntBus.$emit("offline-invoice-doc",doc)
        // console.log("Invoice Data saved successfully");
        eventBus.emit("go-for-payment");
        eventBus.emit("updated-invoice", doc);
        eventBus.emit("punching-status", punching.value);

        loadingBtn.value = false;
      })
      .catch((error) => {
        loadingBtn.value = false;
        console.error("Error with IndexedDB operation:", error);
      });
  }
};
const checkInternetSpeed = async (threshold = 2) => {
  const imageAddr =
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Brandenburger_Tor_abends.jpg"; // Test image URL
  const downloadSize = 2707459; // File size in bytes

  try {
    const download = new Image();
    const startTime = new Date().getTime();

    // Start downloading the test image
    const cacheBuster = `?cacheBuster=${startTime}`;
    download.src = imageAddr + cacheBuster;

    return new Promise((resolve, reject) => {
      download.onload = () => {
        const endTime = new Date().getTime();
        const duration = (endTime - startTime) / 1000; // Duration in seconds

        const bitsLoaded = downloadSize * 8; // Convert to bits
        const calculatedSpeedMbps = (
          bitsLoaded /
          duration /
          1024 /
          1024
        ).toFixed(2); // Mbps

        speedMbps.value = calculatedSpeedMbps;
        getSpeedRes.value = false;
        // if (speedMbps.value > 1) {
        //   eventBus.emit("sync-offline-invoice");
        // }

        // Update online status based on threshold
        // isInternet.value = parseFloat(calculatedSpeedMbps) >= threshold;
        // if (calculatedSpeedMbps > 2) {
        //   isInternet.value = true;
        // } else {
        //   console.log("offline mode on");
        //     isInternet.value = false;
        // }

        console.log(`Internet speed: ${calculatedSpeedMbps} Mbps.`);
        resolve({
          speedMbps: calculatedSpeedMbps,
        });
      };

      download.onerror = () => {
        speedMbps.value = null;
        console.error("Error measuring internet speed.");
        reject(new Error("Error measuring internet speed."));
      };
    });
  } catch (error) {
    console.error("Error checking internet speed:", error);
    throw error;
  }
};
const makePayloadForInvoice = () => {
  invoiceItems.value = [];

  items.value.forEach((item, index) => {
    let taxIncludeNetamount = 0;
    const total = item.rate;
    let taxrate = 1 + selectedPaymentMode.value?.tax_rate / 100 || 0;
    taxIncludeNetamount = total / taxrate;

    const mainItemObject = {
      item_code: item.item_code,
      item_group: item.item_group,
      item_name: item.item_name,
      qty: item.qty,
      rate: item.rate,
      amount: item.rate,
      net_amount: taxIncludeNetamount,
    };
    invoiceItems.value.push(mainItemObject);
  });

  localStorage.setItem("order-items", JSON.stringify(invoiceItems.value));
  localStorage.setItem("net-total", JSON.stringify(netTotal.value));
  localStorage.setItem("gst-amount", JSON.stringify(gstAmount.value));

  // checkInternetSpeed();
};
const makePayloadForSalesOrder = () => {
  invoiceItems.value = [];

  items.value.forEach((item, index) => {
    const mainItemObject = {
      item_code: item.item_code,
      item_group: item.item_group,
      item_name: item.item_name,
      qty: item.qty,
      rate: item.rate,
    };
    invoiceItems.value.push(mainItemObject);
  });
};

const deleteItem = (index) => {
  items.value.splice(index, 1);
  makePayloadForInvoice();
};
const toggleDelete = (index) => {
  // Toggle the visibility of the delete button for the clicked item
  items.value[index].showDelete = !items.value[index].showDelete;
};

const offlineProfileData = async () => {
  try {
    // Wait for the IndexedDBService to open the database and get the pos_profile
    const data = await indexedDBService
      .openDatabase()
      .then(() => indexedDBService.getPosProfile());

    // console.log("offline pos profile from order summary", data);

    if (data && data.length > 0) {
      pos_profile.value = data[0];
      console.log("order summary OFFline profile", pos_profile.value);
      paymentModes.value = pos_profile.value.payments;
      const hasDefaultPayment = paymentModes.value.some(
        (mode) => mode.default === 1 || mode.selected
      );
      if (!hasDefaultPayment && paymentModes.value.length > 0) {
        // If no default payment mode is found, set the first mode as default
        paymentModes.value[0].default = 1;
        paymentModes.value[0].selected = true;
      }
      paymentModes.value.forEach((item) => {
        if (item.default) {
          item.selected = true;
          selectedPaymentMode.value = item;
        } else {
          item.selected = false;
        }
      });
    } else {
      console.error("No profile data found in IndexedDB.");
    }
  } catch (error) {
    console.error("Error with IndexedDB operation getting profile:", error);
  }
};
const createSaleOrder = async (order) => {
  // if (selected.value.length > 0) {
  let invoiceDocForLoad = {};

  // Fetch the sales invoice from order
  const response = await frappe.call({
    method:
      "tech4all_standard_pos.tech4all_standard_pos.api.posapp.create_sales_invoice_from_order",
    args: {
      sales_order: order.name,
    },
  });

  if (response.message) {
    invoiceDocForLoad = response.message;
    // eventBus.emit("flag-for-sale-order", true);
  }

  // if (invoiceDocForLoad.items) {
  //   const selectedItems = selected.value[0].items;
  //   const loadedItems = invoiceDocForLoad.items;

  //   const loadedItemsMap = {};
  //   loadedItems.forEach((item) => {
  //     loadedItemsMap[item.item_code] = item;
  //   });

  //   // Iterate through selectedItems and update or discard items
  //   for (let i = 0; i < selectedItems.length; i++) {
  //     const selectedItem = selectedItems[i];
  //     const loadedItem = loadedItemsMap[selectedItem.item_code];

  //     if (loadedItem) {
  //       // Update the fields of selected item with loaded item's values
  //       selectedItem.qty = loadedItem.qty;
  //       selectedItem.amount = loadedItem.amount;
  //       selectedItem.uom = loadedItem.uom;
  //       selectedItem.rate = loadedItem.rate;
  //     } else {
  //       // If 'item_code' doesn't exist in loadedItems, discard the item
  //       selectedItems.splice(i, 1);
  //       i--; // Adjust the index as items are removed
  //     }
  //   }
  // }

  // Emit updated order data
  // eventBus.emit("load_order", selected.value[0]);
  // draftsDialog.value = false;

  // Call delete_sales_invoice API to delete the generated sales invoice
  await frappe.call({
    method:
      "tech4all_standard_pos.tech4all_standard_pos.api.posapp.delete_sales_invoice",
    args: {
      sales_invoice: invoiceDocForLoad.name,
    },
  });
  // }
};
onMounted(() => {
  // checkInternetSpeed();
  // // intervalId = setInterval(() => {
  // //   if (navigator.onLine && !getSpeedRes.value) {
  // //     getSpeedRes.value = true;
  // //     checkInternetSpeed();
  // //   }
  // // }, 8000);

  if (!navigator.onLine) {
    offlineProfileData();
  }
  eventBus.on("app-internet-status", (newStatus) => {
    offlineMode.value = !newStatus;
    offlineProfileData();
  });
  eventBus.on("set-default-value", () => {
    items.value = [];
  });
  eventBus.on("exist-item-cart", (data) => {
    const existingItem = items.value.find(
      (item) => item.item_code === data.item_code
    );
    if (existingItem) {
      existingItem.qty = data.qty;
      existingItem.netTotal = existingItem.rate * existingItem.qty;
    } else {
      items.value.push({ ...data });
    }
    makePayloadForInvoice();
  });

  eventBus.on("add-to-cart", (data) => {
    data.netTotal = 0;
    data.netTotal = data.rate * data.qty;

    // Find if the item already exists in the array
    const existingItem = items.value.find(
      (item) => item.item_code === data.item_code
    );

    if (existingItem) {
      // If item exists, add the new quantity
      existingItem.qty += data.qty;
      existingItem.netTotal = existingItem.rate * existingItem.qty;
    } else {
      // If item doesn't exist, add it to the array
      // selectedProduct.value.netTotal =
      //   selectedProduct.value.rate * selectedProduct.value.qty;
      items.value.push({ ...data });
    }

    makePayloadForInvoice();
  });

  eventBus.on("show-sale-order", (order) => {
    order.items.forEach((item) => {
      item.netTotal = item.rate * item.qty;
    });
    items.value = [];
    items.value = order.items;
    saleOrder.value = true;
    saleOrderDetail.value = order;
    createSaleOrder(order);
  });

  eventBus.on("send_pos_profile", (profile) => {
    pos_profile.value = profile;
    paymentModes.value = profile.payments;
    selectedCustomer.value = pos_profile.value.customer;

    const hasDefaultPayment = paymentModes.value.some(
      (mode) => mode.default === 1 || mode.selected
    );
    if (!hasDefaultPayment && paymentModes.value.length > 0) {
      // If no default payment mode is found, set the first mode as default
      paymentModes.value[0].default = 1;
      paymentModes.value[0].selected = true;
    }
    paymentModes.value.forEach((item) => {
      if (item.default) {
        item.selected = true;
        selectedPaymentMode.value = item;
      } else {
        item.selected = false;
      }
    });
  });
  eventBus.on("register_pos_profile", (data) => {
    pos_profile.value = data.pos_profile;
    pos_opening_shift.value = data.pos_opening_shift;
  });
  eventBus.on("set-default-value", () => {
    invoice_doc.value = {};
    saleOrder.value = false;
    saleOrderDetail.value = "";
    items.value = [];
    invoiceItems.value = [];
    holdOrderId.value = null;
    defaultSaleOrderValue()
  });
  eventBus.on("selected_order_type", (type) => {
    selectedOrderType.value = type;
    items.value = [];
    invoiceItems.value = [];
    invoice_doc.value = {};
  });
  eventBus.on("load-hold-order", (order) => {
    console.log("hold order", order);
    items.value = [];
    holdOrderId.value = order.id;
    items.value = order.items;
    makePayloadForInvoice();
  });
  eventBus.on("current-screen", (newVal) => {
    screen.value = newVal;
  });
  eventBus.on("enter-key-called", () => {
    onEnterKey();
  });
  eventBus.on("go-to-order-history", () => {
    // pandaGoOrder.value = true;
  });
  eventBus.on("selected-table", (table) => {
    tableNo.value = table;
  });

  eventBus.on("load-sale-order", (order) => {
    console.log("saleorder", order)
    saleOrderPayload.value = order;
    // saleOrderBtns.value = true;
    items.value = [];
    order.items.forEach((item) => {
      item.netTotal = item.rate * item.qty;
      item.sales_order = order.name

    });
    items.value = order.items;
    invoiceItems.value = order.items;
    // makePayloadForSalesOrder();
  });

  // Fired by ProductList.vue once a queued Sales Order (KOT Print made
  // offline) reaches the server. If it's the order currently open in this
  // cart, fill in the real name so the Payment button unlocks right away
  // instead of waiting for the cashier to reopen it from Sale Orders.
  eventBus.on("sales-order-synced", (synced) => {
    if (
      saleOrderPayload.value &&
      saleOrderPayload.value._queueId === synced.queueId
    ) {
      saleOrderPayload.value = {
        ...saleOrderPayload.value,
        name: synced.name,
      };
    }
  });
});
onUnmounted(() => {
  eventBus.off("app-internet-status");
  eventBus.off("set-default-value");
  eventBus.off("exist-item-cart");
  eventBus.off("add-to-cart");
  eventBus.off("show-sale-order");
  eventBus.off("send_pos_profile");
  eventBus.off("register_pos_profile");
  eventBus.off("set-default-value");
  eventBus.off("selected_order_type");
  eventBus.off("load-hold-order");
  eventBus.off("current-screen");
  eventBus.off("enter-key-called");
})
</script>

<style scoped>
.summary-main-card {
  max-height: calc(100vh - 176px);
  height: calc(100vh - 176px);
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2) !important;
}

.order-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 360px;
  height: 300px;
}

@media (max-width: 959px) {
  .summary-main-card {
    height: auto;
    max-height: none;
  }

  .order-card {
    height: auto;
    min-height: 240px;
  }
}

.table-header {
  font-weight: 400;
  font-size: 12px;
  font-family: Noto Sans;
  color: grey;
}

.v-divider {
  margin: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.teal--text.text--accent-4 {
  color: #009688 !important;
}

.text-caption {
  font-size: 12px;
}

.payment-card {
  border-radius: 16px !important;
}

.dotted-divider {
  border-style: dotted !important;
  border-color: black !important;
}

.payment-text-color {
  color: #626262;
}

.font-20 {
  font-size: 20px;
  font-weight: 700;
}

.total-p {
  color: orangered;
  font-size: 20px;
  font-weight: 700;
}

.payment-button {
  border-radius: 8px;
}

.image-container {
  text-align: center;
  /* Center the image */
}

.payment-p {
  font-size: 20px;
  font-weight: 700;
  font-family: Archivo;
}

.print-p {
  font-size: 16px;
  font-weight: 700;
  font-family: Archivo;
}


.animated-image {
  width: 535px;
  max-width: 600px;
  position: relative;
  animation: move 8s linear infinite;
  /* Infinite left-to-right animation */
}

@keyframes move {
  0% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}

@media (max-width: 600px) {
  .table-header {
    font-size: 12px;
  }

  .text-caption {
    font-size: 10px;
  }
}
</style>
