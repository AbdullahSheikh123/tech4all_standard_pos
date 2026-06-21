<template>
  <v-row class="pt-0 px-2">
    <v-col cols="12" md="8">
      <v-card elevation="1" class="border-16 title-card d-flex align-center px-4 py-2">
        <v-row align="center" class="flex-nowrap">
          <!-- Logo -->
          <v-col cols="2" class="d-flex align-center">
            <img src="/assets/tech4all_standard_pos/js/posapp/components/pos/client.png" alt="Logo"
              style="height: 60px; width: auto;" />
          </v-col>

          <!-- Table No -->
          <v-col cols="3">
            <v-select v-model="selectedTable" :items="tableArray" label="Table No" style="border-radius: 6px; height: 51px;" class="pr-2 " density="compact"
              variant="outlined" item-title="table_no" :disabled="currentScreen !== 0" />
          </v-col>

          <!-- Order Type -->
          <v-col cols="3">
            <v-select v-model="selectedOrderType" :items="orderTypes" label="Order Type" style="border-radius: 6px; height: 51px;" class="pr-2" density="compact"
              variant="outlined" item-title="order_type" :disabled="currentScreen !== 0" />
          </v-col>

          <!-- Search Input -->
          <v-col cols="4">
            <v-text-field v-model="searchValue" variant="outlined" append-inner-icon="mdi-magnify"
              placeholder="Find Your Item" density="compact" class="mr-2" style="border-radius: 6px; height: 51px;" />
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- POS Info / Logout -->
    <v-col cols="12" md="4" class="p-4">
      <div class="d-flex align-center">
        <div class="d-flex align-center">
          <p class="mt-0 mr-2 font-weight-bold">POS:</p>
          <div class="pos-id">{{ pos_profile.name }}</div>
        </div>
        <v-spacer></v-spacer>
        <div class="pos-close d-flex align-center cursor-pointer" @click="go_desk()">
          <v-icon color="black">mdi-logout</v-icon>
          <p class="ml-2 mb-0">Close POS</p>
        </div>
      </div>
    </v-col>
  </v-row>

</template>

<script setup>
import eventBus from "../../bus";
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import indexedDBService from "../../indexedDB";

const searchValue = ref("");
const pos_profile = ref("");
const selectedOrderType = ref("");
const currentScreen = ref(null);

const orderTypes = ref([]);
const tableArray = ref([])
const selectedTable = ref("");



const logOut = () => {
  eventBus.emit("logout-pos");
};

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, 500);
  };
};

const emitSearchEvent = debounce((value) => {
  eventBus.emit("search-item", value); // Emit the search event when typing stops
}, 500); // 500ms delay (you can change the delay as needed)
const go_desk = () => {
  frappe.set_route("/");
  location.reload();
};
const changeOrderType = (newValue) => {
  eventBus.emit("update_get_item", newValue);
  let orderRequired =
    orderTypes.value.find((orderType) => orderType.order_type == newValue) ||
    "";
  if (orderRequired.order_required) {
    eventBus.emit("required-order-id", true);
  } else {
    eventBus.emit("required-order-id", false);
  }
};
// Fetch order types
const fetchOrderTypes = async () => {
  try {
    const response = await frappe.call({
      method: "tech4all_standard_pos.tech4all_standard_pos.api.posapp.get_Order_type",
      args: {
        pos_profile: pos_profile.value,
      },
    });

    // Assign response to order types
    orderTypes.value = response.message;
    // selectedOrderType.value = response.message[0].name;
    // eventBus.emit("selected_order_type", selectedOrderType.value);

    // Emit the order type via event bus
    //    eventBus.emit("send_order_type", selectedOrderType.value);

    // Save the order types to IndexedDB
    await indexedDBService.openDatabase();
    await indexedDBService.saveOrderType(JSON.stringify(orderTypes.value));
    // console.log("Order Type saved successfully!");
  } catch (error) {
    console.error("Error fetching order types:", error);
  }
};
const fetchTableOptions = async (key) => {
  try {
    const response = await frappe.call({
      method: "tech4all_standard_pos.tech4all_standard_pos.api.posapp.get_all_Table_names",
      args: {
        pos_profile: pos_profile.value,
      },
    });
    if (response) {
      console.log("table array", response)
      tableArray.value = response.message.filter((table) => table.status === "Available");
    }


  } catch (error) {
    console.error("Error fetching table names:", error);
  }
};

const offlineProfileData = async () => {
  try {
    // Wait for the IndexedDBService to open the database and get the pos_profile
    const data = await indexedDBService
      .openDatabase()
      .then(() => indexedDBService.getPosProfile());

    console.log("offline pos profile Header ..", data);

    if (data && data.length > 0) {
      pos_profile.value = data[0]; // Assuming pos_profile is in the first index
      orderTypes.value = pos_profile.value.applicable_for_order_type;
      selectedOrderType.value =
        orderTypes.value.find((orderType) => orderType.default === 1)
          ?.order_type || orderTypes.value[0].order_type;

      let orderRequired =
        orderTypes.value.find(
          (orderType) => orderType.order_type === selectedOrderType.value
        ) || "";

      // Emit event if the order is required
      eventBus.emit("required-order-id", orderRequired.order_required);
    } else {
      console.error("No profile data found in IndexedDB.");
    }
  } catch (error) {
    console.error("Error with IndexedDB operation getting profile:", error);
  }
};

watch(searchValue, (newValue) => {
  emitSearchEvent(newValue); // Trigger debounce when searchValue changes
});
watch(selectedOrderType, (newValue) => {
  eventBus.emit("selected_order_type", newValue);
  changeOrderType(newValue);
});
watch(selectedTable, (newValue) => {
  eventBus.emit("selected-table", newValue);
});
onMounted(() => {
  if (!navigator.onLine) {
    offlineProfileData();
  }
  // window.addEventListener("offline", () => {
  //   // console.log("in-header You are offline");
  //   // offlineProfileData();
  // });
  eventBus.on("send_pos_profile", (profile) => {
    pos_profile.value = profile;
    orderTypes.value = pos_profile.value.applicable_for_order_type;
    selectedOrderType.value =
      orderTypes.value.find((orderType) => orderType.default === 1)
        ?.order_type || orderTypes.value[0].order_type;
    let orderRequired =
      orderTypes.value.find(
        (orderType) => orderType.order_type == selectedOrderType.value
      ) || "";
    if (orderRequired.order_required) {
      eventBus.emit("required-order-id", true);
    } else {
      eventBus.emit("required-order-id", false);
    }
    fetchTableOptions()

  });

  eventBus.on("current-screen", (newVal) => {
    currentScreen.value = newVal;
  });
  eventBus.on("open-product-menu", () => {
    fetchTableOptions();
  })

  eventBus.on("app-internet-status", (newStatus) => {
    offlineProfileData();
  });
  // eventBus.on("internet-status", (newVal) => {
  //   if(!newVal){
  //     offlineProfileData()
  //   }
  // });
});
onBeforeUnmount(() => {
  eventBus.off("send_pos_profile");
  eventBus.off("current-screen");
  eventBus.off("app-internet-status");
});
</script>

<style scoped>
.title-card {
  padding: 9px 0px 9px 0px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2) !important;
  border-radius: 12px;
}

.search-div {
  height: 60px;
  width: 100%;
  max-width: 350px;
}

.v-text-field--outlined {
  border-radius: 16px !important;
}

.pos-id {
  border: 1px solid;
  border-radius: 6px;
  width: 195px;
  height: 48px;
  padding-top: 15px;
  padding-left: 8px;
  margin-left: 14px;
  background: white;
}

.pos-close {
  border: 1px solid #f05d23;
  border-radius: 6px;
  width: 195px;
  height: 48px;
  padding-left: 8px;
  margin-left: 14px;
  background: #fcdfd3;
}

.pos-p {
  font-size: 16px;
  font-weight: 600;
}

.order-type-select {
  padding-top: 3px;
  height: 95px;
  width: 290px;
}
</style>
<style>
.v-field.v-field--appended.v-field--center-affix.v-field--no-label.v-field--variant-outlined.v-theme--light.v-locale--is-ltr {
  padding-top: 7px !important;
  border-radius: 12px !important;
}

.v-select__selection {
  position: relative;
  top: 8px;
}
</style>
