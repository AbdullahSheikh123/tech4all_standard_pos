<template>
  <v-card elevation="1" class="border-16 product-main-card">
    <v-row class="pl-6 pt-6 align-center">
      <v-col cols="3" class="mt-3">
        <h3>Sale Orders <span class="text-grey text-body-1">{{ filteredOrders.length }}/{{ orders.length }}</span></h3>
      </v-col>
      <v-col cols="9" class="d-flex justify-end align-center flex-wrap ga-2 pr-4">
        <v-text-field
          v-model="searchText"
          density="compact"
          variant="outlined"
          hide-details
          placeholder="Search..."
          prepend-inner-icon="mdi-magnify"
          style="max-width: 220px"
        ></v-text-field>
        <v-select
          v-model="selectedStatuses"
          :items="statusOptions"
          label="Status"
          multiple
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 180px"
        >
          <template v-slot:selection="{ index }">
            <span v-if="index === 0" class="text-caption">
              {{ selectedStatuses.length === statusOptions.length ? 'All' : selectedStatuses.join(', ') }}
            </span>
          </template>
        </v-select>
        <v-select
          v-model="selectedTypes"
          :items="typeOptions"
          label="Type"
          multiple
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 180px"
        >
          <template v-slot:selection="{ index }">
            <span v-if="index === 0" class="text-caption">
              {{ selectedTypes.length === typeOptions.length ? 'All' : selectedTypes.join(', ') }}
            </span>
          </template>
        </v-select>
        <v-btn icon size="small" color="#21A0A0" @click="get_draft_orders()">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="pl-2 pr-9">
      <v-col
        v-for="order in filteredOrders"
        :key="order.id"
        cols="12"
        sm="6"
        md="4"
        lg="4"
        class="px-8"
        v-show="!itemloading"
      >
        <v-card
          class="order-card d-flex flex-column"
          elevation="0"
          outlined
          @click="showOrderDetail(order)"
          :class="{ 'selected-card': selectedOrder == order }"
          style="
            min-height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 342px;
          "
        >
          <v-card-text class="pb-0">
            <div class="dis-grid">
              <div class="d-flex align-center">
                <div class="panda-go-div">{{order.order_type}}</div>
                <span class="ml-2 mt-1">{{ order.name || 'Not synced yet' }}</span>
                <span
                  class="ml-2 sync-status-text"
                  :class="'sync-' + order._syncStatus.toLowerCase()"
                >{{ order._syncStatus }}</span>
              </div>
              <p class="mt-2">
                <span class="text-grey">{{
                  formatDeliveryDate(order.creation)
                }}</span>
              </p>
            </div>
            <div class="mt-3">
              <p>Order Detail:</p>
              <div class="d-flex ml-2" style="height: 80px">
                <v-icon>mdi-clipboard-list-outline</v-icon>
                <p class="ml-2 text-grey">
                  <!-- Display items with "+x more" if more than 6 items -->
                  {{
                    order.items
                      .slice(0, 6)
                      .map((item) => item.item_name)
                      .join(", ")
                  }}<span v-if="order.items.length > 6"
                    >, +{{ order.items.length - 6 }} more</span
                  >
                </p>
              </div>
            </div>
            <v-divider class="mt-3 dotted-divider" :thickness="3"></v-divider>

            <div class="order-detail">
              <strong>Grand Total</strong>
              <p class="grand-p">{{pos_profile.custom_currency_symbol}}. {{ order.grand_total }}</p>
            </div>
            <v-divider class="dotted-divider mt-0" :thickness="3"></v-divider>

            <v-row v-if="order.pandago_order_status" class="d-flex align-center my-2">
              <!-- NEW -->
              <v-chip
                color="cyan lighten-4"
                text-color="cyan darken-3"
                class="ma-1"
                style="font-size: 12px"
              >
                {{order.pandago_order_status}}
              </v-chip>

              <!-- <v-chip
                color="grey lighten-4"
                text-color="grey darken-1"
                class="ma-1"
                style="font-size: 12px"
              >
                Completed
              </v-chip>

              <v-chip
                color="grey lighten-4"
                text-color="grey darken-1"
                class="ma-1"
                style="font-size: 12px"
              >
                Canceled
              </v-chip> -->
            </v-row>

            <!-- <div class="order-detail mt-3">
              <strong>By</strong>
              <p>{{ order.name }}</p>
            </div>
            <div class="order-detail mt-3 pb-3">
              <strong>At</strong>
              <p>{{ order.location }}</p>
            </div> -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-show="itemloading">
      <v-col cols="12" style="display: flex; justify-content: center">
        <v-progress-circular
          :size="100"
          :width="7"
          color="#21a0a0"
          indeterminate
        ></v-progress-circular>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import eventBus from "../../bus";
import indexedDBService from "../../indexedDB";

const orders = ref([
  // {
  //   id: "1200589C",
  //   total: "1,080,000.00",
  //   name: "Nadeem Butt",
  //   location: "ISB - 0012",
  // },
]);

const pos_profile = ref("");
const selectedOrder = ref("");
const itemloading = ref(false);

// Filter bar state (Search / Status / Type - see search_orders and
// get_draft_orders for how each order's _syncStatus/order_type is derived).
const searchText = ref("");
const statusOptions = ["Pending", "Draft", "Paid", "Completed"];
const selectedStatuses = ref([...statusOptions]);

// Type options are derived from whatever order_type values are actually on
// the loaded orders - Sales Order has no dine-in/takeaway field today (only
// the standard ERPNext "order_type", which create_sales_order_from_pos
// always sets to "Sales"), so this list will only grow once/if that's added.
const typeOptions = computed(() => {
  const types = new Set(orders.value.map((o) => o.order_type).filter(Boolean));
  return Array.from(types);
});
const selectedTypes = ref([]);
watch(
  typeOptions,
  (newTypes) => {
    // Default to "all types selected" whenever the available set changes,
    // so nothing is silently hidden after a refresh.
    selectedTypes.value = [...newTypes];
  },
  { immediate: true }
);

const filteredOrders = computed(() => {
  const text = searchText.value.trim().toLowerCase();
  return orders.value.filter((order) => {
    if (
      selectedStatuses.value.length &&
      !selectedStatuses.value.includes(order._syncStatus)
    ) {
      return false;
    }
    if (
      selectedTypes.value.length &&
      !selectedTypes.value.includes(order.order_type)
    ) {
      return false;
    }
    if (text) {
      const haystack = `${order.name || ""} ${order.customer || ""}`.toLowerCase();
      if (!haystack.includes(text)) return false;
    }
    return true;
  });
});

const showOrderDetail = (order) => {
  selectedOrder.value = order;
  console.log("selectedOrder.value", selectedOrder.value);
  eventBus.emit("load-sale-order", order);
};
const formatDeliveryDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return new Date(date).toLocaleString("en-US", options).replace(", ", " ");
};

// Four states shown on each card, derived per the actual lifecycle of a
// KOT-Print order (see posapp.py::create_sales_order_from_pos and
// invoice.py::close_linked_sales_order):
//   Pending   - created offline, not yet reached the server at all
//               (create_sales_order queue, mode 'create', unsynced)
//   Draft     - a real Sales Order exists on the server, still open/unpaid
//   Paid      - payment was taken (Sales Invoice built) but that invoice is
//               itself still sitting in its own offline queue
//               (create_invoice), so the Sales Order hasn't been
//               submitted/completed on the server yet
//   Completed - Sales Order submitted and marked Completed on the server
//               (both the order and its payment have fully synced)
const get_draft_orders = async () => {
  try {
    itemloading.value = true;

    let serverOrders = [];
    if (navigator.onLine) {
      try {
        const response = await frappe.call({
          method: "tech4all_standard_pos.tech4all_standard_pos.api.posapp.search_orders",
          args: {
            company: pos_profile.value.company,
            currency: pos_profile.value.currency,
            pos_profile: pos_profile.value
          },
        });
        if (response.message) {
          serverOrders = response.message;
        }
      } catch (error) {
        console.error("Error fetching draft orders from server:", error);
      }
    }
    serverOrders.forEach((order) => {
      order._syncStatus = order.status === "Completed" ? "Completed" : "Draft";
    });

    try {
      await indexedDBService.openDatabase();

      const soQueue = await indexedDBService.getSalesOrderQueue();
      soQueue
        .filter((record) => record.synced === false && record.mode === "create")
        .forEach((record) => {
          serverOrders.push({
            name: null,
            _queueId: record.id,
            _syncStatus: "Pending",
            order_type: (record.data && record.data.order_type) || "Sales",
            creation: record.timestamp,
            items: (record.data && record.data.items) || [],
            grand_total: (record.data && record.data.grand_total) || 0,
            customer: record.data && record.data.customer,
          });
        });

      const invoiceQueue = await indexedDBService.getSalesInvoiceQueue();
      invoiceQueue
        .filter((record) => record.synced === false && record.invoice && record.invoice.sales_order)
        .forEach((record) => {
          const match = serverOrders.find(
            (order) => order.name === record.invoice.sales_order
          );
          if (match) {
            match._syncStatus = "Paid";
          }
        });
    } catch (error) {
      console.error("Error reading offline order/invoice queues:", error);
    }

    itemloading.value = false;
    orders.value = serverOrders;
  } catch (error) {
    console.error("Error fetching draft orders:", error);
    itemloading.value = false;
  }
};
onMounted(() => {
  // const posProfile = JSON.parse(localStorage.getItem("pos_profile"));
  // pos_profile.value = posProfile;
  // get_draft_orders();

  eventBus.on("send_pos_profile", async (profile) => {
    pos_profile.value = profile;
  });
  // Refresh the list once a queued order successfully syncs so its card
  // flips from Pending to Synced (and the local placeholder becomes the
  // real Sales Order name).
  eventBus.on("sales-order-synced", () => {
    get_draft_orders();
  });
  eventBus.on("go-to-order-history", () => {
    get_draft_orders();
  });
});
</script>

<style scoped>
.product-main-card {
  max-height: 80vh;
  height: 80vh;
  overflow-y: scroll;
  overflow-x: hidden;
}

.order-card {
  border: 1px solid #d5d5d5 !important;
  transition: transform 0.2s ease-in-out;
  border-radius: 16px !important;
}

.order-card:hover {
  transform: translateY(-5px); /* Move card slightly up on hover */
}

.order-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: #ff4500;
}
.grand-p {
  color: #ff4500;
}

.order-detail {
  display: flex;
  justify-content: space-between;
}
.dis-grid {
  display: grid;
}
.selected-card {
  background: #fcdfd3 !important;
}
.dotted-divider {
  border-style: dotted !important;
  border-color: #ff4500 !important;
}
.panda-go-div {
  border: 1px solid #ff6dbd;
  padding: 1px 7px 0px;
  border-radius: 6px;
  color: #ff6dbd !important;
  background: #fceaed;
}
.text-grey {
  color: #b3b3b3;
}
.sync-status-text {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 6px;
}
.sync-completed {
  color: #1a9c5c;
  background: #e3f7ec;
}
.sync-draft {
  color: #3d6fb4;
  background: #e6eefb;
}
.sync-paid {
  color: #7a4fc2;
  background: #efe7fb;
}
.sync-pending {
  color: #b7791f;
  background: #fdf1dc;
}
</style>
