<template>
  <v-container>
    <v-card elevation="1" class="border-16 summary-main-card" :class="{'no-data-card':items.length==0}">
      <v-row
        no-gutters
        class="d-flex justify-center align-center"
        v-show="items.length > 0"
      >
        <v-col sm="12" v-if="items.length > 0">
          <div class="bg-white rounded-xl table-data pa-8">
            <div class="align-center d-flex justify-center">
              <div align="center">
                <img
                  src="/assets/tech4all_standard_pos/js/posapp/components/pos/client.png"
                  class="w-50"
                  alt="logo"
                />
                <p
                  class="mt-5 text-center"
                  style="font-size: 28px; font-weight: 600"
                >
                  Welcome to Standard
                </p>
              </div>
            </div>
            <div
              style="
                background: #f7f7f7;
                box-shadow: 0px 0px 4px 0px #00000040 inset;
              "
              class="pa-8 rounded-xl mt-2"
            >
              <v-table
                style="max-height: 400px; overflow-y: auto; background: #f7f7f7"
                class="custom-scroll"
                fixed-header
              >
                <thead class="custom-thead">
                  <tr class="custom-header">
                    <th class="text-left table-header" style="width: 60%">
                      ITEM
                    </th>
                    <!-- <th class="text-left table-header" style="width: 15%">
                      NET
                    </th> -->
                    <th class="text-left table-header" style="width: 15%">
                      QTY.
                    </th>
                    <th class="text-left table-header" style="width: 25%">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in items"
                    :key="item.item"
                    style="height: 80px"
                  >
                    <td class="td-data">
                      <div class="d-flex align-center">
                        <!-- <img
                          :src="fashionImage"
                          class="images me-2"
                          alt="colth image"
                        /> -->
                        <span>
                          {{ item.item_name }}
                        </span>
                      </div>
                    </td>
                    <!-- <td class="td-data">Rs.{{ item.net }}</td> -->
                    <td class="td-data">{{ item.qty }}</td>
                    <td class="td-data" style="color: #f69e7b">
                      Rs.{{ item.rate }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div
                style="background: #000; width: 100%; height: 1px"
                class="mt-10"
              ></div>
            </div>

            <div class="mt-3">
              <v-row v-show="screen == 0">
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Total Amount</h5>
                    <h6 class="amount py-2" style="color: #818181">
                      Rs. {{ parseFloat(grandTotal).toFixed(2) }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #21a0a0"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Tax (GST)</h5>
                    <h6 class="amount py-2" style="color: #000">
                      Rs. {{ parseFloat(gstAmount).toFixed(2) }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #21a0a0"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Net Total</h5>
                    <h6 class="amount py-2" style="color: #818181">
                      Rs. {{ parseFloat(netTotal).toFixed(2) }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #21a0a0"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Discount</h5>
                    <h6 class="amount py-2" style="color: #818181">Rs. 0.00</h6>
                    <div
                      style="width: 100%; height: 1px; background: #21a0a0"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Gross Total</h5>
                    <h6 class="amount py-2" style="color: #f05d23">
                      Rs. {{ parseFloat(grandTotal).toFixed(2) }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #f05d23"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
              </v-row>
              <v-row v-show="screen == 1">
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Total Amount</h5>
                    <h6 class="amount py-2" style="color: #818181">
                      Rs. {{ parseFloat(invoiceDoc.total).toFixed(2) }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #21a0a0"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Tax (GST %)</h5>
                    <h6 class="amount py-2" style="color: #000">
                      Rs.
                      {{
                        parseFloat(invoiceDoc.total_taxes_and_charges).toFixed(
                          2
                        )
                      }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #21a0a0"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Net Total</h5>
                    <h6 class="amount py-2" style="color: #818181">
                      Rs. {{ parseFloat(invoiceDoc.net_total).toFixed(2) }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #21a0a0"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Discount</h5>
                    <h6 class="amount py-2" style="color: #818181">
                      Rs.
                      {{ parseFloat(invoiceDoc.discount_amount).toFixed(2) }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #21a0a0"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Gross Total</h5>
                    <h6 class="amount py-2" style="color: #000">
                      Rs. {{ parseFloat(invoiceDoc.grand_total).toFixed(2) }}
                    </h6>
                    <div
                      style="width: 100%; height: 1px; background: #f05d23"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
              </v-row>

              <!--  -->
            </div>
          </div>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="d-flex justify-center align-center"
        v-show="items.length == 0"
      >
        <v-col sm="12" v-show="items.length == 0">
          <div class="align-center d-flex justify-center">
            <div align="center">
              <img
                src="/assets/tech4all_standard_pos/js/posapp/components/pos/client.png"
              class="w-50"
                alt="logo"
              />
              <p
                class="mt-5 text-center"
                style="font-size: 28px; font-weight: 600"
              >
                Welcome to YAY Restaurant
              </p>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  watch,
  computed,
} from "vue";
const items = ref([
  //   {
  //     name: "Gul Bahaar",
  //     sku: "SKU:10145687-c12",
  //     qty: 1,
  //     rate: "270,000/-",
  //     netTotal: "Rs. 270,000/-",
  //   },
]);
const screen = ref(0);
const netTotal = ref("");
const gstAmount = ref("");
const invoiceDoc = ref("");
const grandTotal = ref("");

watch(
  items,
  (newVal, oldVal) => {
    if (newVal) {
      //   eventBus.emit("current-screen", newVal);
      console.log("watcher ", newVal);
    }
  },
  { deep: true }
);

// const grandTotal = computed(() => {
//       return netTotal.value + gstAmount.value;
//     });

onMounted(() => {
  console.log("Second-screen", window);
  console.log("Customer-screen", localStorage.getItem("order-items"));
  window.addEventListener("storage", (event) => {
    console.log("Local storage updated:", event);
    const storedItems = localStorage.getItem("order-items");
    const invoiceItemsArray = storedItems ? JSON.parse(storedItems) : [];
    console.log("Retrieved invoice items:", invoiceItemsArray);
    items.value = invoiceItemsArray;
    const currentScreen = localStorage.getItem("current-screen");
    const invoiceData = localStorage.getItem("invoice-data");
    invoiceDoc.value = JSON.parse(invoiceData);
    console.log("local invoiceData", invoiceDoc.value);
    screen.value = Number(currentScreen);
    const gst = localStorage.getItem("gst-amount");
    const netPrice = localStorage.getItem("net-total");
    netTotal.value = JSON.parse(netPrice);
    gstAmount.value = JSON.parse(gst);
    grandTotal.value = Number(netTotal.value) + Number(gstAmount.value);
  });
});
onBeforeUnmount(() => {});
onUnmounted(() => {});
</script>

<style scoped>
.v-application {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2) !important;
}
.no-data-card{
  margin-top: 60px;
}

.zara-title {
  font-family: Noto Sans;
  font-weight: 500;
  font: Noto Sans;
  font-size: 20px;
  margin-left: 14px;
}
.table-data {
  box-shadow: 0px 0px 8px 0px #00000026;
}
.custom-thead {
  background-color: transparent !important;
}

/* Style the header rows */
.custom-header th {
  background-color: #f7f7f7 !important;
  color: #333; /* Text color for headers */
  font-weight: bold;
  padding: 12px 8px;
  border-bottom: 1px solid #ddd;
}

/* Add spacing to rows in tbody */
.custom-row {
  margin-top: 8px;
  margin-bottom: 8px;
  display: table-row; /* Required to keep table layout */
  border-bottom: 1px solid #e0e0e0;
}
.table-header {
  width: 50%;
  font-size: 10px;
  font-weight: 400;
  line-height: 13.62px;
}
.td-data {
  font-size: 16px;
  font-weight: 400;
  line-height: 32px;
}
.images {
  width: 48px;
  height: 48px;
  top: 6;
  left: 6;
  border-radius: 4px;
}
.title {
  font-size: 16px;
  font-weight: 600;
  line-height: 25px;
  text-align: center;
  color: #818181;
}
.amount {
  font-size: 20px;
  font-weight: 700;
  line-height: 25px;
  text-align: center;
  text-decoration-skip-ink: none;
}
.custom-row {
  padding-top: 12px;
  padding-bottom: 12px;
  display: table-row; /* Ensures padding applies */
}
/* scroll */
.custom-scroll {
  max-height: 400px;
  overflow-y: auto;
}

/* Scrollbar Styling */
.custom-scroll::-webkit-scrollbar {
  width: 7px;
  margin-right: 50px; /* Width of the scrollbar */
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #000; /* Thumb color */
  border-radius: 20px; /* Rounded corners for the scrollbar thumb */
}

.custom-scroll::-webkit-scrollbar-track {
  background-color: #f0f0f0; /* Track color */
  border-radius: 8px;
}
</style>
<style>
.v-table__wrapper {
  border-radius: inherit;
  overflow: visible;
  flex: 1 1 auto;
}
</style>
