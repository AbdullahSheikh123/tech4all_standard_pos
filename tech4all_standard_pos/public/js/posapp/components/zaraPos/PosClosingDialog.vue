<template>
  <v-row justify="center">
    <v-dialog v-model="closingDialog" max-width="1200px">
      <v-card>
        <v-card-title>
          <span class="headline primary--text">Closing POS Shift</span>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container>
            <v-row>
              <v-col cols="12" class="pa-1">
                <v-data-table
                  :headers="headers"
                  :items="dialog_data.payment_reconciliation"
                  item-key="mode_of_payment"
                  :items-per-page="itemsPerPage"
                  hide-default-footer
                >
                  <!-- Editable Closing Amount -->
                  <template v-slot:item.closing_amount="{ item }">
                    <v-text-field
                      v-model="item.closing_amount"
                      type="number"
                      outlined
                      dense
                      class="closing-amount-input"
                      :rules="[max25chars]"
                      hide-details
                    />
                  </template>

                  <!-- Difference -->
                  <template v-slot:item.difference="{ item }">
                    <!-- {{ currencySymbol(pos_profile.currency) }} -->
                    {{ pos_profile.custom_currency_symbol }}  {{ Math.ceil(item.expected_amount - item.closing_amount) }}
                  </template>

                  <!-- Opening Amount -->
                  <template v-slot:item.opening_amount="{ item }">
                    <!-- {{ currencySymbol(pos_profile.currency) }} -->
                    {{ pos_profile.custom_currency_symbol }} {{ Math.ceil(item.opening_amount) }}
                  </template>

                  <!-- Expected Amount -->
                  <template v-slot:item.expected_amount="{ item }">
                    <!-- {{ currencySymbol(pos_profile.currency) }} -->
                    {{ pos_profile.custom_currency_symbol }} {{ Math.ceil(item.expected_amount) }}
                  </template>
                  <template v-slot:item.difference_detail="{ item }">
                    <v-text-field
                      v-model="item.difference_detail"
                      outlined
                      dense
                      class="closing-amount-input"
                      hide-details
                    />
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="closeDialog">Close</v-btn>
          <v-btn color="success" @click="submitDialog">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog max-width="600" v-model="confirmDialog" persistent>
      <v-card>
        <v-card-text class="d-flex justify-center">
          <p class="dialog-text pt-12">Are You Sure You Want to Close Shift?</p>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="confirmDialog = false">No</v-btn>
          <v-btn text @click="closeShift" color="red" :loading="loadingBtn"
            >Yes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import eventBus from "../../bus";
import useFormat from "../../CurrencyFormat";
// Composition API
const {
  flt,
  formtCurrency,
  formtFloat,
  setFormatedCurrency,
  setFormatedFloat,
  currencySymbol,
  isNumber,
} = useFormat();

const closingDialog = ref(false);
const confirmDialog = ref(false);
const loadingBtn = ref(false);
const itemsPerPage = ref(20);
const dialog_data = ref("");
const pos_profile = ref("");

const headers = ref([
  {
    title: "Mode of Payment",
    value: "mode_of_payment",
    align: "start",
    sortable: true,
  },
  {
    title: "Opening Amount",
    align: "end",
    sortable: true,
    value: "opening_amount",
  },
  {
    title: "Closing Amount",
    value: "closing_amount",
    align: "end",
    sortable: true,
  },
]);

const max25chars = (v) => v.length <= 20 || "Input too long!";

// Methods
const closeDialog = () => {
  closingDialog.value = false;
};
const submitDialog = () => {
  // Calculate the difference for all payment modes
  dialog_data.value.payment_reconciliation.forEach((item) => {
    item.difference = item.expected_amount - item.closing_amount;
  });

  // Check for invalid closing amounts across all payment modes
  const invalidClosingAmounts = dialog_data.value.payment_reconciliation.filter(
    (item) => item.expected_amount > 0 && item.closing_amount <= 0
  );

  // Check for missing difference reasons across all payment modes
  const missingDifferenceReasons = dialog_data.value.payment_reconciliation.filter(
    (item) =>
      item.difference > 0 &&
      (!item.difference_detail || item.difference_detail.trim() === "")
  );

  // Handle validations
  if (invalidClosingAmounts.length > 0) {
    eventBus.emit("show_mesage", {
      text: "Closing amount must be greater than zero for payments with an expected amount.",
      color: "error",
    });
    return;
  }

  if (missingDifferenceReasons.length > 0) {
    eventBus.emit("show_mesage", {
      text: "Please specify a reason for the amount difference for all payment modes.",
      color: "error",
    });
    return;
  }

  // If all validations pass
  confirmDialog.value = true;

  // Uncomment the below lines to handle submission logic
  // eventBus.emit("submit_closing_pos", dialog_data.value);
  // closingDialog.value = false;
};


// const submitDialog = () => {
//   dialog_data.value.payment_reconciliation.forEach((item) => {
//     if (item.mode_of_payment.startsWith("Cash")) {
//       item.difference = item.expected_amount - item.closing_amount;
//     }
//   });

//   const filteredItems = dialog_data.value.payment_reconciliation.filter(
//     (item) =>
//       item.mode_of_payment.startsWith("Cash") &&
//       item.difference > 0 &&
//       (!item.difference_detail || item.difference_detail.trim() === "")
//   );

//   if (filteredItems.length > 0) {
//     eventBus.emit("show_mesage", {
//       text: "Please specify a reason for the amount difference in cash mode.",
//       color: "error",
//     });
//     return;
//   }
//   confirmDialog.value = true;

//   // eventBus.emit("submit_closing_pos", dialog_data.value);
//   // closingDialog.value = false;
// };
const closeShift = () => {
  loadingBtn.value = true;
  eventBus.emit("submit_closing_pos", dialog_data.value);
  // closingDialog.value = false;
};

// Lifecycle hooks
onMounted(() => {
  // Listening to event bus for opening dialog
  eventBus.on("open_ClosingDialog", (data) => {
    closingDialog.value = true;
    dialog_data.value = data;
  });
  eventBus.on("shift-closed", () => {
    loadingBtn.value = false;
    confirmDialog.value = false;
    closingDialog.value = false;
  });

  // Registering POS profile data
  eventBus.on("register_pos_profile", (data) => {
    pos_profile.value = data.pos_profile;

    if (!pos_profile.value.hide_expected_amount) {
      headers.value.push(
        {
          title: "Expected Amount",
          value: "expected_amount",
          align: "end",
          sortable: false,
        },
        {
          title: "Difference",
          value: "difference",
          align: "end",
          sortable: false,
        },
        {
          title: "Difference Reason",
          value: "difference_detail",
          align: "end",
          sortable: false,
        }
      );
    }
  });
});
</script>
<style scoped>
.dialog-text {
  font-size: 20px;
  font-weight: 500;
}
</style>
