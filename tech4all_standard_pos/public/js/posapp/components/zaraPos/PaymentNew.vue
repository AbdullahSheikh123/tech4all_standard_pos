<template>
  <div>
    <v-card class="payment-card py-4 px-8">
      <!-- Payment Method Selection -->
      <p>Select Payment method</p>

      <v-row>
        <v-col cols="12" md="7" class="d-flex">
          <div class="payment-container" :class="{
            'scrollable-container-horizontal': paymentModes.length > 3,
          }">
            <v-btn v-for="category in paymentModes" :key="category.mode_type" variant="outlined" size="large"
              class="text-capitalize b-radius-8 ml-2" :color="category.selected ? '#f05d23' : '#21A0A0'"
              style="border-radius: 8px" @click="changePaymentType(category)">
              <v-icon class="pr-2">{{
                category.mode_type == "Cash" ? "mdi-cash" : "mdi-credit-card"
                }}</v-icon>
              <p class="mt-2 category-p">{{ category.mode_of_payment }}</p>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="5" class="text-right">
          <v-btn class="mr-2 b-radius-8" color="#21A0A0" size="large" variant="outlined"
            style="background-color: #d3ecec" @click="backToProductMenu()">
            <v-icon left class="pr-2">mdi-arrow-left</v-icon> Back
          </v-btn>
          <v-btn size="large" variant="outlined" color="#F05D23" class="b-radius-8" style="background-color: #fcdfd3"
            @click="cancelOrder()" :disabled="punching == 'inprocess'">
            <v-icon left class="pr-2">mdi-cancel</v-icon> Cancel Order
          </v-btn>
        </v-col>
      </v-row>
      <v-divider></v-divider>

      <!-- Payment Details Input Fields -->
      <v-row class="mt-2 pb-0">
        <v-col cols="12" md="3">
          <v-text-field class="b-radius-8" variant="outlined" label="Paid Amount"
            :suffix="`${pos_profile.custom_currency_symbol} `" v-model="amountTake" @input="validateInput"
            :disabled="paymentType.mode_type !== 'Cash' || splitPayment" ref="amountTakeField"
            @focus="activeField = 'amountTake'" />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field class="b-radius-8" variant="outlined" :label="`Discount`" v-model="discount" type="number"
            readonly @click="openDiscountDialog" />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field class="b-radius-8" variant="outlined"
            :label="`AdditionalDiscount (max ${pos_profile.posa_max_discount_allowed} %)`" v-model="discount"
            type="number" :max="pos_profile.posa_max_discount_allowed" @update="validateDiscount"
            :disabled="!pos_profile.posa_max_discount_allowed" ref="discountField" @focus="activeField = 'discount'" />
        </v-col>
        <!-- <v-col cols="12" md="2" v-show="requiredOrderId">
          <v-text-field class="b-radius-8" variant="outlined" label="Order id" v-model="orderId" />
        </v-col> -->
        <v-col cols="12" md="3">
          <v-btn class="mr-2 b-radius-8" :color="splitPayment ? '#F05D23' : '#21A0A0'" size="large" variant="outlined"
            :style="{
              backgroundColor: splitPayment ? '#fcdfd3' : '#d3ecec',
            }" @click="openSplitPaymentDialog()">
            <v-icon left class="pr-2">mdi-cash-multiple</v-icon> Split Payment
          </v-btn>
        </v-col>
        <v-col cols="12" md="1" v-show="splitPayment">
          <v-btn class="mr-8 b-radius-8 split-close" color="#21A0A0" size="large" variant="outlined"
            style="background-color: #d3ecec" @click="cancelSplit()">
            <v-icon left class="pr-2">mdi-close</v-icon>
          </v-btn>
        </v-col>

        <!-- <v-col cols="12" md="4">
            <v-text-field
              class="b-radius-8"
              variant="outlined"
              label="Add Discount"
              suffix="Rs."
            />
          </v-col> -->
      </v-row>

      <!-- Paid Amount, To Be Paid, and Change Details -->
      <v-row class="pt-0 mt-0">
        <v-col cols="2" class="pt-0">
          <div class="amount-div paid-div">
            <p class="py-0 amount-title mb-2">Paid Amount</p>
            <p class="amount-pay">
              {{ pos_profile.custom_currency_symbol }} {{ parseFloat(totalPaidAmount).toFixed(2) || 0.0 }}
            </p>
          </div>
        </v-col>
        <v-col cols="2" class="pt-0">
          <div class="amount-div to-paid-div">
            <p class="py-0 amount-title mb-2">To Be Paid</p>
            <p class="amount-pay">
              {{ pos_profile.custom_currency_symbol }} {{ parseFloat(invoice_doc.grand_total).toFixed(2) }}
            </p>
          </div>
        </v-col>
        <v-col cols="3" class="pt-0">
          <div class="amount-div to-paid-div">
            <p class="py-0 amount-title mb-2">Remaining paid amount</p>
            <p class="amount-pay">
              {{ pos_profile.custom_currency_symbol }} {{ parseFloat(invoice_doc.remaining_amount || 0).toFixed(1) }}
            </p>
          </div>
        </v-col>
        <v-col cols="2" class="pt-0">
          <div class="amount-div change-div">
            <p class="py-0 amount-title mb-2">Change</p>
            <p class="amount-pay">
              {{ pos_profile.custom_currency_symbol }} -{{ parseFloat(changeAmount.toFixed(2)) }}
            </p>
          </div>
        </v-col>
      </v-row>

      <!-- Total, Tax, Net Total, Discount, Gross Total -->
      <v-row class="my-4">
        <v-col cols="2">
          <div class="amount-title">Total Amount</div>
          <div class="grey--text amount-pay pt-2">
            {{ pos_profile.custom_currency_symbol }} {{ invoice_doc.total ? invoice_doc.total.toFixed(2) : 0 }}
          </div>
          <v-divider :thickness="2" class="border-opacity-75" style="background-color: #21a0a0"></v-divider>
        </v-col>
        <v-col cols="2">
          <div class="grey--text amount-title">
            Tax (GST {{ paymentType.tax_rate }}%)
          </div>
          <div class="black--text amount-pay-one pt-2">
            {{ pos_profile.custom_currency_symbol }}
            {{
              invoice_doc.total_taxes_and_charges
                ? parseFloat(invoice_doc.total_taxes_and_charges).toFixed(2)
                : 0
            }}
          </div>
          <v-divider :thickness="2" class="border-opacity-75" style="background-color: #21a0a0"></v-divider>
        </v-col>
        <v-col cols="2">
          <div class="grey--text amount-title">Net Total</div>
          <div class="grey--text amount-pay pt-2">
            {{ pos_profile.custom_currency_symbol }} {{ parseFloat(invoice_doc.net_total).toFixed(2) }}
          </div>
          <v-divider :thickness="2" class="border-opacity-75" style="background-color: #21a0a0"></v-divider>
        </v-col>
        <v-col cols="2">
          <div class="grey--text amount-title">Discount</div>
          <div class="grey--text amount-pay pt-2">
            {{ pos_profile.custom_currency_symbol }} {{ parseFloat(invoice_doc.discount_amount).toFixed(2) }}
          </div>
          <v-divider :thickness="2" class="border-opacity-75" style="background-color: #21a0a0"></v-divider>
        </v-col>
        <v-col cols="2">
          <div class="grey--text amount-title">Gross Total</div>
          <div class="black--text amount-pay-one pt-2">
            {{ pos_profile.custom_currency_symbol }} {{ parseFloat(invoice_doc.grand_total).toFixed(2) }}
          </div>
          <v-divider :thickness="2" class="border-opacity-75" style="background-color: #f05d23"></v-divider>
        </v-col>
      </v-row>
    </v-card>

    <!-- Action Buttons -->
    <v-row class="px-6 pt-6">
      <v-col cols="2"></v-col>
      <v-col cols="2">
        <!-- <v-btn
            size="x-large"
            variant="outlined"
            color="#21A0A0"
            class="text-capitalize ml-2"
            style="background-color: #d3ecec; border-radius: 8px"
          >
            <v-icon left class="pr-2">mdi-pause-circle</v-icon> Hold Order
          </v-btn> -->
      </v-col>
      <v-col cols="2">
        <v-btn size="x-large" variant="outlined" class="text-capitalize" color="#21A0A0"
          style="background-color: #d3ecec; border-radius: 8px" :loading="btnLoading1"
          @click="submitSaleInvoice(undefined, false, true)">
          <v-icon left>mdi-printer</v-icon> Print Receipt
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn block size="x-large" color="#21A0A0" style="border-radius: 8px" class="white--text checkout-p"
          @click="submitSaleInvoice()" :loading="btnLoading">
          <p class="checkout-p mt-3">CHECKOUT</p>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Numpad Section (Keyboard) -->
    <v-row>
      <v-col cols="12">
        <v-card class="keyboard-card">
          <div class="text-center">
            <v-row>
              <v-col v-for="(button, index) in numpad" :key="index" cols="4" class="py-1">
                <v-btn class="mx-2 text-capitalize b-radius-8" variant="outlined" color="#21A0A0" block
                  style="background-color: #d3ecec" size="large" @click="handleNumpadClick(button)">
                  <p class="mt-4 btn-p">{{ button }}</p>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <iframe id="printFrame" style="display: none"></iframe>
    <!-- Dialog for Split Payment -->
    <v-dialog v-model="showDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="headline">Split Payment</v-card-title>
        <v-card-text>
          <div><strong>Grand Total:</strong> {{ invoice_doc.grand_total }}</div>
          <div>
            <strong>Remaining Amount:</strong>
            {{ parseFloat(invoice_doc.remaining_amount).toFixed(2) }}
          </div>
          <div><strong>Paid Amount:</strong> {{ parseFloat(totalPaidAmount || 0.0).toFixed(2) }}</div>
          <div class="flex mt-3">
            <v-btn color="primary" size="small" @click="updateRemainingAmount">Add amount</v-btn>
            <v-btn color="red" size="small" @click="resetAllAmounts" style="margin-left: 4px;">Reset</v-btn>

          </div>
          <v-row>
            <v-col v-for="(mode, index) in paymentModes" :key="index" cols="12" class="mt-3">
              <div class="mb-2">
                <strong>Mode of Payment:</strong> {{ mode.mode_of_payment }}
              </div>
              <v-text-field v-model="mode.amount" :label="`Enter amount for ${mode.mode_of_payment}`" type="number"
                outlined :formatter="formatDisplayAmount"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="submitSplitPayment">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Discount Selection Dialog -->
    <v-dialog v-model="discountDialog" max-width="400">
      <v-card>
        <v-card-title>Select Discount</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(discountValue, index) in availableDiscounts" :key="index"
              @click="selectDiscount(discountValue)" class="cursor-pointer">
              <v-list-item-title>{{ discountValue.discount_percentage }}%</v-list-item-title>
            </v-list-item>
          </v-list>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" variant="text" @click="discountDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import eventBus from "../../bus.js";
import indexedDBService from "../../indexedDB";
import { printInvoice } from "../../printing";
import { sync_fbr } from "../../tax_integration";
import debounce from "lodash/debounce";

const numpad = ref([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ".",
  "0",
  "Back",
]);
const invoice_doc = ref({});
const pos_profile = ref("");
const paymentType = ref("");
const paymentModes = ref([]);
const totalPaidAmount = ref(0);
const taxRate = ref("");
const amountTake = ref("");
const changeAmount = ref(0);
const newTax = ref({});
const btnLoading = ref(false);
const btnLoading1 = ref(false);
const selectedOrderType = ref("");
const orderId = ref("");
const discount = ref("");
const showDialog = ref(false);
const splitPayment = ref(false);
const confirmSplit = ref(false);
const offlineMode = ref(false);
const punching = ref("completed");
const fbrResponse = ref("");
const activeField = ref("amountTake");
const amountTakeField = ref(null);
const discountField = ref(null);
const requiredOrderId = ref(false);

const discountDialog = ref(false);
const availableDiscounts = ref([]);

const setDefaultValue = () => {
  amountTake.value = null;
  discount.value = "";

  invoice_doc.value = {};
  // subTotal.value = 0;
  // orderSummary.value = [];
  // orderItem.value = [];
  changeAmount.value = 0;
  orderId.value = "";
  splitPayment.value = false;
  confirmSplit.value = false;
};

const validateInput = (event) => {
  let value = event.target.value;

  // Allow only numbers and a single decimal point
  value = value.replace(/[^0-9.]/g, "");

  // Prevent multiple decimal points
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }

  // Restrict to two decimal places while typing
  if (parts.length === 2 && parts[1].length > 2) {
    value = `${parts[0]}.${parts[1].substring(0, 2)}`;
  }

  // Update input value
  amountTake.value = value;
};
const openDiscountDialog = async () => {
  try {
    const r = await frappe.call(
      "tech4all_standard_pos.tech4all_standard_pos.api.posapp.get_offers",
      {
        profile: pos_profile.value.name,
      }
    );

    if (r.message) {
      console.log("get-offers...", r.message)
      availableDiscounts.value = r.message;
      discountDialog.value = true;


    }
  } catch (error) {
    console.error("Error getting offers", error);
  }

};
const selectDiscount = (value) => {
  // if (value <= pos_profile.value.posa_max_discount_allowed) {
  discount.value = value.discount_percentage;
  discountDialog.value = false; // Close dialog after selection
  // } else {
  //   // alert(`Maximum allowed discount is ${maxDiscount.value}%`);
  // }
};
const validateDiscount = (value) => {
  const maxAllowed = pos_profile.value.posa_max_discount_allowed;
  if (value > maxAllowed) {
    discount.value = maxAllowed; // Limit the value to the maximum allowed
  } else {
    discount.value = value; // Allow valid input
  }
};
const backToProductMenu = () => {
  eventBus.emit("open-product-menu");
};
const openSplitPaymentDialog = () => {
  if (paymentModes.value.length > 1) {
    showDialog.value = true;
    splitPayment.value = true;
  } else {
    eventBus.emit("show_mesage", {
      text: `Split payment is not available as only one payment mode is configured.`,
      color: "error",
    });
  }
};
const cancelSplit = () => {
  if (!invoice_doc.value.original_grand_total) {
    invoice_doc.value.original_grand_total = invoice_doc.value.grand_total;
  }
  invoice_doc.value.grand_total = invoice_doc.value.original_grand_total;
  paymentModes.value.forEach((payment) => {
    payment.amount = "";
  });
  showDialog.value = false;
  splitPayment.value = false;
  confirmSplit.value = false;
  let totalPaidAmount = 0;
  paymentModes.value.forEach((payment) => {
    totalPaidAmount += Number(payment.amount) || 0; // Convert to a number and handle non-numeric values
  });
  changeAmount.value = 0;
  let remaining_amount = 0;
  remaining_amount = invoice_doc.value.grand_total - totalPaidAmount;
  invoice_doc.value.remaining_amount = remaining_amount;
  changePaymentType(paymentType.value);

  // updateDocPayment();
};

// Close Dialog
const closeDialog = () => {
  if (!confirmSplit.value) {
    cancelSplit();
  }
  showDialog.value = false;
  // updateDocPayment();
};

// Submit Split Payment
// const submitSplitPayment = () => {
//   let totalPaidAmount = 0;
//   let validPaymentModes = 0; // Count modes with non-zero amounts

//   paymentModes.value.forEach((payment) => {
//     const paymentAmount = Number(payment.amount) || 0; // Convert to a number
//     totalPaidAmount += paymentAmount;

//     if (paymentAmount > 0) {
//       validPaymentModes++; // Count non-zero payment modes
//     }
//   });

//   // Check if the amount is split across at least two payment modes
//   if (validPaymentModes < 2) {
//     eventBus.emit("show_mesage", {
//       text: `Amount must be split between at least two modes of payment.!`,
//       color: "error",
//     });
//     return;
//   }

//   console.log("Split Payment Details:", paymentModes.value);
//   console.log("Total Entered Amount:", totalPaidAmount);
//   showDialog.value = false;
// };
// const updateRemainingAmount = () => {
//   const totalPaid = paymentModes.value.reduce((sum, mode) => {
//     const amount = Number(mode.amount) || 0;
//     return sum + amount;
//   }, 0);

//   // Update remaining amount in `invoice_doc`
//   invoice_doc.value.remaining_amount =
//     invoice_doc.value.grand_total - totalPaid;
// };
const formatDisplayAmount = (value) => {
  if (!value) return "0.00"; // Default to 0.00
  return parseFloat(value).toFixed(2); // Format to 2 decimal places
};
const resetAllAmounts = () => {
  paymentModes.value.forEach((mode) => (mode.amount = ""));
  updateRemainingAmount();
};
const updateRemainingAmount = () => {
  let totalPaid = 0;
  let cashMode = null;
  let bankModes = [];

  // Identify cash mode and bank modes
  paymentModes.value.forEach((mode) => {
    const amount = Number(mode.amount) || 0;
    if (mode.mode_of_payment.toLowerCase() === "cash") {
      cashMode = mode;
    } else {
      bankModes.push(mode);
    }
    totalPaid += amount;
  });

  // Update remaining amount
  invoice_doc.value.remaining_amount = invoice_doc.value.grand_total - totalPaid;
  if (totalPaid > invoice_doc.value.grand_total) {
    eventBus.emit("show_mesage", {
      text: `Amount must be split between at least two modes of payment.!`,
      color: "error",
    });
    return;
  }
  // **Logic to Auto-Fill Remaining Amount**
  if (cashMode && bankModes.length === 1) {
    // If only one bank mode exists, auto-fill bank if cash is entered
    if (cashMode.amount > 0) {
      bankModes[0].amount = parseFloat(invoice_doc.value.remaining_amount).toFixed(2);
    }
    // If bank mode is entered first, auto-fill cash
    else {
      cashMode.amount = invoice_doc.value.remaining_amount;
    }
  }
};


const submitSplitPayment = () => {
  let totalPaidAmount = 0;
  let validPaymentModes = 0;
  let invalidCustomCharge = false;
  let bankPaymentAmount = 0;

  paymentModes.value.forEach((payment) => {
    const paymentAmount = Number(payment.amount) || 0;
    totalPaidAmount += paymentAmount;

    if (paymentAmount > 0) {
      validPaymentModes++;
    }
    // Check custom_expense_charges condition
    if (
      !payment.custom_expense_charges &&
      paymentAmount > invoice_doc.value.grand_total
    ) {
      invalidCustomCharge = true;
    }
    // Track the total amount paid via Bank
    if (payment.mode_type === "Bank" && paymentAmount > 0) {
      bankPaymentAmount += paymentAmount;
    }
  });

  // Condition 1: Amount must be split between at least two modes
  if (validPaymentModes < 2) {
    eventBus.emit("show_mesage", {
      text: `Amount must be split between at least two modes of payment.!`,
      color: "error",
    });
    return;
  }
  // Condition 2: Remaining amount must not exceed the total
  console.log("invoice_doc.value.remaining_amount", invoice_doc.value.remaining_amount);
  if (invoice_doc.value.remaining_amount > 0) {
    eventBus.emit("show_mesage", {
      text: `Paid amount must be equal to Grand Total!`,
      color: "error",
    });
    return;
  }

  // Condition 3: Remaining amount must not exceed the total
  if (invalidCustomCharge) {
    eventBus.emit("show_mesage", {
      text: `Bank Payment cannot exceed the Grand Total!`,
      color: "error",
    });
    return;
  }

  // Condition 4: Split payment must be divided between two "Bank" mode types
  if (
    validPaymentModes === 2 &&
    bankPaymentAmount > invoice_doc.value.grand_total
  ) {
    eventBus.emit("show_mesage", {
      text: `The combined Bank Payment cannot exceed the Grand Total!`,
      color: "error",
    });
    return;
  }

  // if (totalPaidAmount > invoice_doc.value.grand_total) {
  //   eventBus.emit("show_mesage", {
  //     text: `The total amount paid exceeds the grand total!`,
  //     color: "error",
  //   });
  //   return;
  // }

  // console.log("Split Payment Details:", paymentModes.value);
  // console.log("Total Entered Amount:", totalPaidAmount);
  // console.log("Remaining Amount:", invoice_doc.value.remaining_amount);

  // Update invoice_doc remaining value to reflect the current state
  if (totalPaidAmount < invoice_doc.value.grand_total) {
    invoice_doc.value.remaining_amount =
      invoice_doc.value.grand_total - totalPaidAmount;
  } else {
    invoice_doc.value.remaining_amount = 0;
    changeAmount.value = 0;
  }
  confirmSplit.value = true;
  showDialog.value = false;
};
const handleNumpadClick = (button) => {
  let targetField = activeField.value === "discount" ? discount : amountTake;
  let targetRef = activeField.value === "discount" ? discountField : amountTakeField;

  if (button === ".") {
    if (!targetField.value.includes(".")) {
      targetField.value += "."; // Append decimal only if not already present
    }
  } else if (button === "-") {
    targetField.value = Math.max((parseFloat(targetField.value) || 0) - 1, 0);
  } else if (button === "Back") {
    targetField.value = targetField.value.toString().slice(0, -1);
  } else {
    targetField.value += button.toString();
  }

  // Ensure the correct field retains focus
  if (targetRef.value) {
    targetRef.value.focus();
  }

  if (activeField.value === "amountTake") {
    if (amountTake.value >= invoice_doc.value.grand_total) {
      changeAmount.value = amountTake.value - invoice_doc.value.grand_total;
    }
    invoice_doc.value.paid_amount = amountTake.value;
    invoice_doc.value.payments.forEach((item) => (item.amount = 0));
    let updatePaymentAmount = invoice_doc.value.payments.find(
      (item) => item.mode_of_payment == paymentType.value.mode_of_payment
    );
    if (updatePaymentAmount) {
      updatePaymentAmount.amount = amountTake.value;
    }
  } else if (activeField.value === "discount") {
    // validateDiscount();
  }
  amountTake.value = amountTake.value.replace(/[^0-9.]/g, "");
  if (activeField.value === "amountTake") {
    // Prevent multiple decimal points
    const parts = amountTake.value.split(".");
    if (parts.length > 2) {
      amountTake.value = parts[0] + "." + parts.slice(1).join("");
    }

    // Restrict to two decimal places while typing
    if (parts.length === 2 && parts[1].length > 2) {
      amountTake.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }

    // Update input value
    // amountTake.value = value;
  }

};

const updateDocPayment = (flag) => {
  let selectedPaymentMode = pos_profile.value.payments.find(
    (item) => item.mode_of_payment === paymentType.value.mode_of_payment
  );
  let totalPaidAmount = 0;
  paymentModes.value.forEach((payment) => {
    totalPaidAmount += Number(payment.amount) || 0; // Convert to a number and handle non-numeric values
  });

  if (selectedPaymentMode.mode_type == "Cash") {
    selectedPaymentMode.amount = amountTake.value;
  } else {
    totalPaidAmount = 0;
    paymentModes.value.forEach((payment) => {
      totalPaidAmount += Number(payment.amount) || 0; // Convert to a number and handle non-numeric values
    });
    if (amountTake.value) {
      selectedPaymentMode.amount = amountTake.value;
    } else {
      if (!flag) {
        // amountTake.value = invoice_doc.value.rounded_total - totalPaidAmount;
        // selectedPaymentMode.amount = amountTake.value;
      } else {
        // selectedPaymentMode.amount = amountTake.value;
      }
    }
    // // amountTake.value = invoice_doc.value.rounded_total - totalPaidAmount;
    // selectedPaymentMode.amount = amountTake.value;
  }
  totalPaidAmount = 0;
  paymentModes.value.forEach((payment) => {
    totalPaidAmount += Number(payment.amount) || 0; // Convert to a number and handle non-numeric values
  });
  if (totalPaidAmount < invoice_doc.value.grand_total) {
    let remaining_amount = 0;
    remaining_amount = invoice_doc.value.grand_total - totalPaidAmount;
    invoice_doc.value.remaining_amount = remaining_amount;
  } else {
    invoice_doc.value.remaining_amount = 0;
  }

  if (totalPaidAmount > invoice_doc.value.grand_total) {
    changeAmount.value = 0;
    changeAmount.value = totalPaidAmount - invoice_doc.value.grand_total;
  }

  // console.log("totalPaidAmount", totalPaidAmount);
  // console.log("  paymentModes.value", paymentModes.value);
};

const changePaymentType = (type) => {
  console.log("Lucum invice", type);
  console.log("invoice_doc.value", invoice_doc.value);

  // console.log("offline payments", pos_profile.value.payments);
  if (!invoice_doc.value.original_grand_total) {
    invoice_doc.value.original_grand_total = invoice_doc.value.grand_total;
  } else {
    // console.log("enter in else", invoice_doc.value.original_grand_total);
    invoice_doc.value.grand_total = invoice_doc.value.original_grand_total;
  }
  if (!splitPayment.value) {
    amountTake.value = 0;
    // Iterate through payment modes and update their states
    pos_profile.value.payments.forEach((payment) => {
      if (payment === type) {
        // Select the clicked payment mode
        payment.selected = true;

        if (payment.mode_type !== "Cash") {
          // Set full amount for non-cash modes
          payment.amount = invoice_doc.value.grand_total;
          amountTake.value = payment.amount; // Reflect the selected mode's amount in the input
          if (!type.custom_expense_chrages) {
            // amountTake.value = amountTake.value ;
            // invoice_doc.value.grand_total = invoice_doc.value.grand_total ;
          }
        } else {
          // Clear the amount for cash mode (can be user-inputted later)
          const originalGrandTotal =
            Number(invoice_doc.value.original_grand_total) || 0;
          payment.amount = "";
          changeAmount.value = 0;
          amountTake.value = payment.amount;
          invoice_doc.value.grand_total = originalGrandTotal;
        }
      } else {
        // Deselect and reset amounts for other modes
        payment.selected = false;
        payment.amount = 0;
      }
    });

    // Log the selected payment type for debugging
    // Update the selected payment type
    paymentType.value = type;
  } else {
    eventBus.emit("show_mesage", {
      text: `Cancel split payment first`,
      color: "error",
    });
  }
};

// Method to set the full amount
const set_full_amount = (idx) => {
  let getTax = pos_profile.value.payments.find(
    (item) => item.mode_of_payment == paymentType.value.mode_of_payment
  );

  // invoice_doc.value.taxes_and_charges = getTax?.taxes_and_charges;
  // taxRate.value = getTax?.tax_rate / 100 || 0;

  // const subtotal = invoice_doc.value.net_total;
  // const taxAndCharges = subtotal * taxRate.value;

  // invoice_doc.value.total_taxes_and_charges = Number(taxAndCharges);
  // invoice_doc.value.rounded_total = Math.ceil(
  //   Number(taxAndCharges) + Number(invoice_doc.value.net_total)
  // );

  // invoice_doc.value.grand_total =
  //   Number(taxAndCharges) + Number(invoice_doc.value.net_total);
  // if (paymentType.value.mode_type !== "Cash") {
  //   amountTake.value = invoice_doc.value.rounded_total;
  // }
  invoice_doc.value.remaining_amount = invoice_doc.value.grand_total;
  let updatePaymentAmount = invoice_doc.value.payments.find(
    (item) => item.mode_of_payment == paymentType.value.mode_of_payment
  );
  if (updatePaymentAmount) {
    updatePaymentAmount.amount = amountTake.value;
  }

  if (amountTake.value > invoice_doc.value.grand_total) {
    changeAmount.value = amountTake.value - invoice_doc.value.grand_total;
  }

  // if (showDeliveryCharges.value) {
  //   invoice_doc.grand_total += deliveryCharges.value;
  //   invoice_doc.rounded_total = Math.round(invoice_doc.grand_total);
  // }

  if (amountTake.value >= invoice_doc.value.grand_total) {
    changeAmount.value = amountTake.value - invoice_doc.value.grand_total;
  }
  let discountAmount = 0;

  if (
    discount.value > 0
  ) {
    discountAmount = (invoice_doc.value.grand_total * discount.value) / 100;
    invoice_doc.value.discount_amount = discountAmount;
    invoice_doc.value.grand_total =
      invoice_doc.value.grand_total - discountAmount;
  }
};

const offlineProfileData = () => {
  indexedDBService
    .openDatabase()
    .then(() => {
      return indexedDBService.getPosProfile();
    })
    .then((data) => {
      console.log("offline pos profile from iindexed db", data[0]);
      pos_profile.value = data[0];
      // paymentModes.value = pos_profile.value.payments;
      paymentModes.value = pos_profile.value.payments.filter((payment) => {
        return payment.custom_order_type == selectedOrderType.value;
      });
      paymentModes.value.forEach((item) => {
        if (item.default) {
          item.selected = true;
          paymentType.value = item;
        } else {
          item.selected = false;
        }
      });
    })
    .catch((error) => {
      console.error("Error with IndexedDB operation getting prfile:", error);
    });
};

const cancelOrder = () => {
  eventBus.emit("open-product-menu");
  eventBus.emit("set-default-value");
  eventBus.emit("show_mesage", {
    text: "Order Cancel Successfully",
    color: "success",
  });
  // const doc = invoice_doc.value;
  // frappe.call({
  //   method: "tech4all_standard_pos.tech4all_standard_pos.api.posapp.delete_invoice",
  //   args: { invoice: doc.name },
  //   async: true,
  //   callback: (r) => {
  //     if (r.message) {
  //       eventBus.emit("open-product-menu");
  //       eventBus.emit("set-default-value");
  //       eventBus.emit("show_mesage", {
  //         text: r.message,
  //         color: "warning",
  //       });
  //     }
  //   },
  // });
};
const getFormattedPrintFormat = () => {
  const printFormat = pos_profile.value.print_format || "";
  return encodeURIComponent(printFormat.trim());
};
const load_print_page = (invoice) => {
  const print_format =
    pos_profile.value.print_format_for_online || pos_profile.value.print_format;
  const letter_head = pos_profile.value.letter_head || 0;
  const formattedValue = getFormattedPrintFormat();

  const url =
    frappe.urllib.get_base_url() +
    "/printview?doctype=Sales%20Invoice&name=" +
    invoice +
    "&trigger_print=1" +
    "&format=" +
    formattedValue +
    "&no_letterhead=" +
    letter_head;
  console.log("Print-url", url);

  const printFrame = document.getElementById("printFrame");
  printFrame.src = url;

  printFrame.onload = function () {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  };
  // const printWindow = window.open(url, "Print");
  // printWindow.addEventListener(
  //   "load",
  //   function () {
  //     printWindow.print();
  //     // printWindow.close();
  //     // NOTE : uncomoent this to auto closing printing window
  //   },
  //   true
  // );
};
const submitSaleInvoice = async (
  event,
  payment_received = false,
  print = false
) => {
  console.log("submit invoice...", invoice_doc.value);
  // if (discount.value > pos_profile.value.posa_max_discount_allowed) {
  //   eventBus.emit("show_mesage", {
  //     text: `Only ${pos_profile.value.posa_max_discount_allowed}% discount allowed`,
  //     color: "error",
  //   });
  //   frappe.utils.play_sound("error");
  //   btnLoading.value = false;
  //   btnLoading1.value = false;
  //   return;
  // }

  if (requiredOrderId.value) {
    if (!orderId.value) {
      eventBus.emit("show_mesage", {
        text: `Order Id is required!`,
        color: "error",
      });
      frappe.utils.play_sound("error");
      btnLoading.value = false;
      btnLoading1.value = false;
      return;
    }
    invoice_doc.value.custom_foodpanda_order_id = orderId.value;
  }

  let matchingPayment = pos_profile.value.payments.find(
    (item) => item.mode_of_payment === paymentType.value.mode_of_payment
  );
  newTax.value = matchingPayment;
  let totalAmount = 0;
  paymentModes.value.forEach((payment) => {
    totalAmount += Number(payment.amount) || 0; // Convert to a number and handle non-numeric values
  });
  // amountTake.value = totalAmount;

  if (totalAmount >= invoice_doc.value.grand_total) {
    if (!btnLoading.value && !btnLoading1.value) {
      if (print) {
        btnLoading1.value = true;
      } else {
        btnLoading.value = true;
      }

      invoice_doc.value.payments = invoice_doc.value.payments.map((payment) => {
        const matchedPayment = paymentModes.value.find(
          (mode) => mode.mode_of_payment === payment.mode_of_payment
        );

        return {
          ...payment,
          amount: matchedPayment ? matchedPayment.amount : payment.amount, // Use the existing amount if no match
        };
      });

      if (invoice_doc.value.is_return && totalPayedAmount == 0) {
        invoice_doc.value.is_pos = 0;
      }

      let data = {};
      let totalChange = -changeAmount.value;
      data.paid_change = changeAmount.value;
      data.total_change = changeAmount.value;
      data.credit_change = 0;
      data.redeemed_customer_credit = 0;
      data.customer_credit_dict = [];
      data.is_cashback = true;
      invoice_doc.value.custom_invoice_status = "In Queue";
      if (
        navigator.onLine &&
        !offlineMode.value &&
        punching.value == "completed"
      ) {
        try {
          const response = await frappe.call({
            method:
              "tech4all_standard_pos.tech4all_standard_pos.api.posapp.sales_invoice",
            args: {
              data: data,
              invoice: invoice_doc.value,
              taxvalue: pos_profile.value.posa_tax_inclusive
                ? ""
                : newTax.value.tax_and_charges,
            },
            async: true,
          });

          if (response.message) {
            invoice_doc.value.name = response.message.name;
            invoice_doc.value.bill_no = response.message.bill_no;
            // Sales Order (KOT) already shows its own Bill No via
            // saleOrderPayload in OrderSummary.vue - this covers the
            // walk-up-sale case, where the invoice is the first (and only)
            // place a number gets assigned.
            eventBus.emit("bill-no-assigned", response.message.bill_no);
            if (invoice_doc.value.holdOrderId) {
              const heldOrders =
                JSON.parse(localStorage.getItem("heldOrders")) || [];

              // Filter out the item with the matching holdOrderId
              const updatedHeldOrders = heldOrders.filter(
                (order) => order.id !== invoice_doc.value.holdOrderId
              );
              // Update local storage
              localStorage.setItem(
                "heldOrders",
                JSON.stringify(updatedHeldOrders)
              );
            }
            load_print_page(response.message.name);
            eventBus.emit("sync-offline-invoice");
            punching.value = "completed";
            eventBus.emit("punching-status", punching.value);
            console.log("submit-invoice Successfully", response.message);
            btnLoading1.value = false;
            const hasBankPayment = invoice_doc.value.payments.some(
              (payment) => payment.amount > 0 && payment.type === "Bank"
            );
            load_print_page(response.message.name);

            if (hasBankPayment && !print) {
              try {
                const responseCode = await sync_fbr(
                  invoice_doc.value,
                  pos_profile.value,
                  false
                );
                console.log("Response Code123:", responseCode);
              } catch (error) {
                console.error("Error syncing FBR:", error);
              }
            }

            if (print) {
              try {
                const responseCode = await sync_fbr(
                  invoice_doc.value,
                  pos_profile.value,
                  false
                );
                console.log("fbr-response", responseCode);
                if (responseCode) {
                  load_print_page(response.message.name);
                } else {
                  console.error(
                    "FBR synchronization failed. Print page will not be loaded."
                  );
                }
              } catch (error) {
                console.error(
                  "Error during FBR sync and print handling:",
                  error
                );
              }
            }

            eventBus.emit("show_mesage", {
              text: `Invoice ${response.message.name} is Submitted`,
              color: "success",
            });
            btnLoading.value = false;
            btnLoading1.value = false;
            amountTake.value = "";
            frappe.utils.play_sound("submit");
            setDefaultValue();
            // localStorage.setItem("get-all-item-status", false);
            eventBus.emit("open-product-menu");
            eventBus.emit("set-default-value");
            // eventBus.emit("set-default-data");
            // eventBus.emit("update-selected-discount");
            amountTake.value = "";
          }
        } catch (error) {
          eventBus.emit("show_mesage", {
            text: `An error occurred while submitting the invoice`,
            color: "error",
          });
          frappe.utils.play_sound("error");
          btnLoading.value = false;
          btnLoading1.value = false;
        }
      } else {
        console.log("Submit invoive in offline mode");
        btnLoading.value = false;
        btnLoading1.value = false;
        const randomReference = `${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;
        invoice_doc.value.pos_referrence = randomReference;

        let invoice_log = invoice_doc.value;

        // Get the sales invoice data payload saved to use it offline.
        indexedDBService
          .openDatabase()
          .then(() => {
            return indexedDBService.getUpdateInvoice("Sales Invoice");
          })
          .then(async (data) => {
            console.log("offline-print-data", data);
            punching.value = "completed";
            eventBus.emit("punching-status", punching.value);
            invoice_log.paid_change = changeAmount.value;
            invoice_log.amount_paid = amountTake.value;
            invoice_log.custom_invoice_status = "In Queue";

            let dataObj = {};
            let payload = {};

            dataObj["total_change"] = changeAmount.value;
            dataObj["paid_change"] = changeAmount.value;
            dataObj["credit_change"] = 0;
            dataObj["redeemed_customer_credit"] = 0;
            dataObj["customer_credit_dict"] = [];
            dataObj["is_cashback"] = true;

            payload["data"] = dataObj;
            // payload["invoice"] = invoice_log;
            payload["taxvalue"] = pos_profile.value.posa_tax_inclusive
              ? ""
              : newTax.value.tax_and_charges;
            const hasBankPayment = invoice_doc.value.payments.some(
              (payment) => payment.amount > 0 && payment.type === "Bank"
            );
            if (hasBankPayment && !print) {
              try {
                const responseCode = await sync_fbr(
                  invoice_doc.value,
                  pos_profile.value,
                  true
                );
                fbrResponse.value = responseCode;

                console.log("Response Code without print:", responseCode);
              } catch (error) {
                console.error("Error syncing FBR:", error);
              }
            }

            if (print) {
              try {
                const responseCode = await sync_fbr(
                  invoice_doc.value,
                  pos_profile.value,
                  true
                );
                // const obj = {
                //   fbrInvoiceId: "123",
                //   qrCode:
                //     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQgAAAEIAQAAAACLjVdSAAAA2klEQVR4nO2VUQ7DMAhDff9LMy2YkEzrdoAHrRCF1x/LIYp/oSGGGGKIZ0IZq8je7jCJkkaLeb9xD2mEsqumVRydWNUQ7i7/PCtGIZwNqDtMwvv1eB52MoOokG+hu0kkPHLqOwhKKIutWK1cKJE9NRiq1cskMvkKSjuVmYjEFirkkTWjErZLpjj+pBIf5tnrhUm0dXb9uXFRxFKoGvKXAkyY89GSayqhliiP02EgJFGlLyH5Ly5RepVYORecuIZDxJatjQQlOp9KiUrcR8iqCUv8jCGGGGKI7/ECbxLxUgrJEnIAAAAASUVORK5CYII=",
                // };
                fbrResponse.value = responseCode;
                console.log("fbr-response", responseCode);
              } catch (error) {
                console.error(
                  "Error during FBR sync and print handling:",
                  error
                );
              }
            }
            if (fbrResponse.value) {
              invoice_doc.value.fbr_invoice_id = fbrResponse.value.fbrInvoiceId;
              invoice_doc.value.qr_code = fbrResponse.value.qrCode;
            }
            payload["invoice"] = invoice_doc.value;

            indexedDBService
              .openDatabase()
              .then((db) => {
                return Promise.all([
                  indexedDBService.saveSalesInvoice(JSON.stringify(payload)),
                ]);
              })
              .then(async (recordId) => {
                if (print) {
                  printInvoice(
                    recordId,
                    invoice_doc.value.grand_total,
                    changeAmount.value,
                    invoice_doc.value,
                    fbrResponse.value
                  );
                }
                if (invoice_doc.value.holdOrderId) {
                  const heldOrders =
                    JSON.parse(localStorage.getItem("heldOrders")) || [];

                  const updatedHeldOrders = heldOrders.filter(
                    (order) => order.id !== invoice_doc.value.holdOrderId
                  );
                  localStorage.setItem(
                    "heldOrders",
                    JSON.stringify(updatedHeldOrders)
                  );
                }
                frappe.utils.play_sound("submit");
                setDefaultValue();
                eventBus.emit("sync-offline-invoice");

                eventBus.emit("open-product-menu");
                eventBus.emit("set-default-value");
                amountTake.value = "";
                eventBus.emit("show_mesage", {
                  text: `Invoice is Submitted`,
                  color: "success",
                });
              })
              .catch((error) => {
                console.error("Error saving to IndexedDB:", error);
              });
          });
      }
    }
    localStorage.setItem("order-items", JSON.stringify([]));
    localStorage.setItem("current-screen", 0);

    localStorage.setItem("net-total", JSON.stringify(0));
    localStorage.setItem("gst-amount", JSON.stringify(0));
  } else {
    eventBus.emit("show_mesage", {
      text: `Paid amount must be greater than amount to be paid`,
      color: "error",
    });
    frappe.utils.play_sound("error");
    btnLoading.value = false;
    btnLoading1.value = false;
    return;
  }
};

watch(
  paymentModes,
  (newModes) => {
    console.log("Filtered paymentModes", newModes);
    totalPaidAmount.value = newModes.reduce(
      (total, mode) => total + Number(mode.amount || 0),
      0
    );
    if (totalPaidAmount.value < invoice_doc.value.grand_total) {
      let remaining_amount = 0;
      remaining_amount = invoice_doc.value.grand_total - totalPaidAmount.value;
      invoice_doc.value.remaining_amount = remaining_amount;
    } else {
      invoice_doc.value.remaining_amount = 0;
    }
    if (totalPaidAmount.value > invoice_doc.value.grand_total) {
      changeAmount.value = 0;
      changeAmount.value =
        totalPaidAmount.value - invoice_doc.value.grand_total;
    }
    const hasDefaultPayment = paymentModes.value.some(
      (mode) => mode.default === 1 || mode.selected
    );

    if (!hasDefaultPayment && paymentModes.value.length > 0) {
      // If no default payment mode is found, set the first mode as default
      console.log("Default Mode....");
      paymentModes.value[0].default = 1;
      paymentModes.value[0].selected = true;
      paymentType.value = paymentModes.value[0];
      // if (invoice_doc.value.length > 0) {
      console.log("enter for default cahnge Paymen type.....");
      // changePaymentType(paymentModes.value[0]);
      // }

      // Log the update for debugging
      console.log(
        "No default payment mode found. Setting the first mode as default:",
        paymentModes.value[0]
      );
    }
    if (discount.value) {
      const discountValue = Number(discount.value) || 0;
      const maxAllowedDiscount =
        Number(pos_profile.value.posa_max_discount_allowed) || 0;
      const originalNetTotal =
        Number(invoice_doc.value.original_net_total) || 0;
      const originalGrandTotal =
        Number(invoice_doc.value.original_grand_total) || 0;

      // if (discountValue <= maxAllowedDiscount) {
      const discountAmount = (originalNetTotal * discountValue) / 100;
      invoice_doc.value.discount_amount = discountAmount;

      invoice_doc.value.net_total = originalNetTotal - discountAmount;

      invoice_doc.value.grand_total = originalGrandTotal - discountAmount;
      // invoice_doc.value.grand_total = Math.ceil(
      //   invoice_doc.value.grand_total
      // );
      if (!paymentType.value.custom_expense_chrages) {
        invoice_doc.value.grand_total =
          Number(invoice_doc.value.grand_total);
      }

      amountTake.value = invoice_doc.value.grand_total;
      // }
    }
  },
  { deep: true }
);
watch(
  confirmSplit,
  (newVal) => {
    if (newVal) {
      let posFeeAdded = false;
      if (!invoice_doc.value.original_grand_total) {
        invoice_doc.value.original_grand_total = invoice_doc.value.grand_total;
      }
      paymentModes.value.forEach((payment) => {
        let paymentAmount = Number(payment.amount) || 0;

        if (
          payment.mode_type !== "Cash" &&
          paymentAmount > 0 &&
          !payment.custom_expense_chrages &&
          !posFeeAdded
        ) {
          // Add 1 rupee fee for the first eligible non-cash payment
          payment.amount = Number(payment.amount);
          invoice_doc.value.grand_total = invoice_doc.value.grand_total;
          posFeeAdded = true;
        }
        console.log("fee addeed", payment.amount);
      });
    }
  },
  { deep: true } // Ensures nested changes in objects are tracked
);
watch(
  paymentType,
  (newModes) => {
    //   let selectedPaymentMode = pos_profile.value.payments.find(
    //   (item) => item.mode_of_payment === paymentType.value.mode_of_payment
    // );
    // if(!paymentType.value.custom_expense_chrages){
    //   paymentType.value.amount=paymentType.value.amount+1
    // }
    // else{
    //   paymentType.value.amount=paymentType.value.amount+1
    // }
  },
  { deep: true } // Ensures nested changes in objects are tracked
);
watch(
  amountTake,
  (newVal, oldVal) => {
    if (!splitPayment.value) {
      if (Number(newVal) == 0) {
        amountTake.value = "";
        let selectedPaymentMode = pos_profile.value.payments.find(
          (item) => item.mode_of_payment === paymentType.value.mode_of_payment
        );
        selectedPaymentMode.amount = 0;
        updateDocPayment(true);
      }
      if (newVal) {
        if (
          !newVal ||
          Number(newVal) === 0 ||
          newVal === "" ||
          newVal === null ||
          newVal === undefined
        ) {
          amountTake.value = 0;
          changeAmount.value = 0;
        } else if (amountTake.value >= invoice_doc.value.grand_total) {
          // changeAmount.value = amountTake.value - invoice_doc.value.grand_total;
          // let updatePaymentAmount = invoice_doc.value.payments.find(
          //   (item) => item.mode_of_payment == paymentType.value.mode_of_payment
          // );
          // updatePaymentAmount.amount = amountTake.value;
        } else {
          changeAmount.value = 0;
        }
        const activeMode = paymentModes.value.find((mode) => mode.selected);
        if (activeMode) {
          // Update the active mode's amount
          activeMode.amount = amountTake.value;
        }
        // let totalAmount = 0;
        // paymentModes.value.forEach((payment) => {
        //   totalAmount += Number(payment.amount) || 0; // Convert to a number and handle non-numeric values
        // });
        // console.log("watcher...totalAmount", totalAmount);
        // if (totalAmount > invoice_doc.value.grand_total) {
        //   changeAmount.value = 0;
        //   changeAmount.value = totalAmount - invoice_doc.value.grand_total;
        // }
        updateDocPayment();
      }
    }
  },
  { deep: true }
);
watch(
  selectedOrderType,
  (newVal, oldVal) => {
    if (newVal) {
      console.log("In payment sselectedOrderType", newVal);
      console.log("In payment  paymentModes.value", paymentModes.value);

      //   if (paymentModes.value && paymentModes.value.length > 0) {
      //   // Find the default payment item
      //   const defaultPayment = paymentModes.value.find((item) => item.default);
      //   // If a default exists, set it as selected; otherwise, set the first item as selected
      //   paymentModes.value.forEach((item) => {
      //     item.selected = false; // Initialize all items as not selected
      //   });

      //   if (defaultPayment) {
      //     defaultPayment.selected = true;
      //     paymentType.value = defaultPayment;
      //   } else {
      //     paymentType.value = paymentModes.value[0];
      //     paymentModes.value[0].selected = true; // Mark the first item as selected
      //   }
      // }
      paymentModes.value = pos_profile.value.payments.filter((payment) => {
        return payment.custom_order_type == newVal;
      });
    }
  },
  { deep: true }
);

watch(discount, (newVal) => {
  // Parse the original net total and grand total (ensure they're stored once)
  if (!invoice_doc.value.original_net_total) {
    invoice_doc.value.original_net_total = invoice_doc.value.net_total;
  }

  if (!invoice_doc.value.original_grand_total) {
    invoice_doc.value.original_grand_total = invoice_doc.value.grand_total;
  }

  const originalNetTotal = Number(invoice_doc.value.original_net_total) || 0;
  const originalGrandTotal =
    Number(invoice_doc.value.original_grand_total) || 0;

  // If no discount value, reset both net total and grand total
  if (!newVal || Number(newVal) === 0) {
    invoice_doc.value.net_total = originalNetTotal;
    invoice_doc.value.grand_total = originalGrandTotal;
    invoice_doc.value.discount_amount = 0; // Reset the discount amount
    // invoice_doc.value.grand_total=Math.round(invoice_doc.value.grand_total);
    amountTake.value = invoice_doc.value.grand_total;
    if (
      !paymentType.value.custom_expense_chrages &&
      paymentType.value.mode_type !== "Cash"
    ) {
      amountTake.value = amountTake.value;
      invoice_doc.value.grand_total = invoice_doc.value.grand_total;
    }

    // console.log(
    //   "No discount applied. Net total and grand total reset to original:",
    //   originalNetTotal,
    //   originalGrandTotal
    // );
    return;
  }

  // Ensure `discount` is a valid number and apply the discount
  const discountValue = Number(newVal) || 0;
  const maxAllowedDiscount =
    Number(pos_profile.value.posa_max_discount_allowed) || 0;

  // if (discountValue <= maxAllowedDiscount) {
  // Calculate discount amount as a percentage of original net total
  const discountAmount = (originalNetTotal * discountValue) / 100;
  invoice_doc.value.discount_amount = discountAmount;

  // Update net total by subtracting the discount amount
  invoice_doc.value.net_total = originalNetTotal - discountAmount;

  // Now subtract the same discount amount from grand total
  invoice_doc.value.grand_total = originalGrandTotal - discountAmount;
  // invoice_doc.value.grand_total = Math.ceil(invoice_doc.value.grand_total);

  amountTake.value = invoice_doc.value.grand_total;
  if (!paymentType.value.custom_expense_chrages) {
    // amountTake.value = amountTake.value + 1;
  }

  // console.log(
  //   "Discount applied. Updated net total and grand total:",
  //   invoice_doc.value.net_total,
  //   invoice_doc.value.grand_total
  // );
  // } else {
  //   // console.warn(`Discount exceeds the allowed limit of ${maxAllowedDiscount}`);
  // }
});
watch(
  invoice_doc,
  (newVal) => {
    console.log("watcher for invoice_doc", newVal);
    localStorage.setItem("invoice-data", JSON.stringify(newVal));
  },
  { deep: true }
);

onMounted(() => {
  eventBus.on("punching-status", (data) => {
    console.log("Offline Punching status", data);
    punching.value = data;
  });

  eventBus.on("app-internet-status", (newStatus) => {
    console.log("IN payment screen internet status", newStatus);
    offlineMode.value = !newStatus;
    offlineProfileData();
  });
  eventBus.on("updated-invoice", (data) => {
    console.log("received-invoice", data);
    invoice_doc.value = data;
    invoice_doc.value.custom_invoice_status = "On Hold";

    paymentModes.value = pos_profile.value.payments.filter((payment) => {
      return payment.custom_order_type == selectedOrderType.value;
    });

    const hasDefaultPayment = paymentModes.value.some(
      (mode) => mode.default === 1 || mode.selected
    );

    if (!hasDefaultPayment && paymentModes.value.length > 0) {
      // If no default payment mode is found, set the first mode as default
      paymentModes.value[0].default = 1;
      paymentModes.value[0].selected = true;
      paymentType.value = paymentModes.value[0];
      changePaymentType(paymentModes.value[0]);
      // Log the update for debugging
      console.log(
        "No default payment mode found. Setting the first mode as default:",
        paymentModes.value[0]
      );
    } else {
      console.log("Selected Mode", paymentType.value);
      // changePaymentType(paymentType.value);
    }
    set_full_amount();
  });
  eventBus.on("selected_order_type", (type) => {
    console.log("In payment Order type", type);
    selectedOrderType.value = type;
    paymentModes.value = pos_profile.value.payments.filter((payment) => {
      return payment.custom_order_type == selectedOrderType.value;
    });
  });
  eventBus.on("required-order-id", (data) => {
    requiredOrderId.value = data;
  });
  eventBus.on("go-for-payment", () => {
    offlineProfileData();
    changeAmount.value = 0;
    discount.value = "";
    amountTake.value = "";
    // console.log("offline=pos prfile",pos_profile.value)

    pos_profile.value.payments.forEach((item) => {
      item.amount = "";
      // Set selected to false for all items
      // Set selected to true if the item is the default
      if (item.default) {
        item.selected = true;
        paymentType.value = item;
      } else {
        item.selected = false;
      }
    });
    updateDocPayment();
  });

  eventBus.on("send_pos_profile", (profile) => {
    pos_profile.value = profile;
    paymentModes.value = profile.payments;
    pos_profile.value.payments.forEach((item) => {
      // Set selected to false for all items
      // Set selected to true if the item is the default
      if (item.default) {
        item.selected = true;
        paymentType.value = item;
      } else {
        item.selected = false;
      }
    });
    // if (paymentModes.value && paymentModes.value.length > 0) {
    //   // Find the default payment item
    //   const defaultPayment = paymentModes.value.find((item) => item.default);

    //   // If a default exists, set it as selected; otherwise, set the first item as selected
    //   paymentModes.value.forEach((item) => {
    //     item.selected = false; // Initialize all items as not selected
    //   });

    //   if (defaultPayment) {
    //     defaultPayment.selected = true;
    //     paymentType.value = defaultPayment;
    //   } else {
    //     paymentType.value = paymentModes.value[0];
    //     paymentModes.value[0].selected = true; // Mark the first item as selected
    //   }
    // }
  });
  if (!navigator.onLine) {
    offlineProfileData();
    console.log("offline-pos prfile", pos_profile.value);
    // paymentModes.value = pos_profile.value.payments;
    // pos_profile.value.payments.forEach((item) => {
    //   if (item.default) {
    //     item.selected = true;
    //     paymentType.value = item;
    //   } else {
    //     item.selected = false;
    //   }
    // });
  }
});
onUnmounted(() => {
  eventBus.off("punching-status");
  eventBus.off("app-internet-status");
  eventBus.off("updated-invoice");
  eventBus.off("selected_order_type");
  eventBus.off("required-order-id");
  eventBus.off("go-for-payment");
  eventBus.off("send_pos_profile");
});
</script>

<style scoped>
.payment-container {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
}

.scrollable-container-horizontal {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 8px;
}

.scrollable-container-horizontal {
  /* scrollbar-width: none;
    -ms-overflow-style: none; */
}

.scrollable-container-horizontal::-webkit-scrollbar {
  /* display: none; */
}

.payment-card {
  border-radius: 16px !important;
}

.amount-title {
  font-size: 16px;
  font-weight: 600;
  color: #818181;
}

.amount-pay {
  font-size: 16px;
  font-weight: 700;
  color: #818181;
}

.amount-pay-one {
  font-size: 16px;
  font-weight: 700;
}

.payment-method-btn {
  width: 150px;
  border-radius: 8px;
}

.payment-info-card {
  border-radius: 8px;
  text-align: center;
}

.keyboard-card {
  border-radius: 12px;
  padding: 20px;
  border-radius: 16px !important;
}

.b-radius-8 {
  border-radius: 8px !important;
}

.amount-div {
  border-radius: 8px;
  padding-left: 20px;
  padding-top: 8px;
}

.paid-div {
  border: 1px solid #21a0a0;
  box-shadow: 0 4px 0 #21a0a0;
}

.to-paid-div {
  border: 1px solid #f05d23;
  box-shadow: 0 4px 0 #f05d23;
}

.change-div {
  border: 1px solid #0d1821;
  box-shadow: 0 4px 0 #0d1821;
}

.checkout-p {
  font-size: 20px;
  font-weight: 700;
}

.btn-p {
  font-size: 20px;
  font-weight: 600;
}

.split-close {
  position: relative;
  right: 64px;
}

@media (max-width: 768px) {
  .payment-info-card {
    font-size: 12px;
  }

  .keyboard-card {
    height: 100px;
  }
}
</style>
<style>
.v-text-field .v-field {
  border-radius: 10px !important;
}
</style>
