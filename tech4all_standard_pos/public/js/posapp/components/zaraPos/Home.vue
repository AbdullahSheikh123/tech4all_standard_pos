<template>
  <div fluid class="pos-shell" style="background: #f4f4f4">
    <Header v-if="!dialog" />
    <ProductDialog />
    <PosOpeningDialog v-if="dialog" :dialog="dialog" />
    <PosClosingDialog />
    <!-- product Items row -->
    <v-row class="pos-content" v-show="!dialog">
      <v-col cols="12" md="8" class="pos-products-column">
        <ProductList v-show="screen === 0" />
        <Payment v-show="screen === 1" />
        <OrderHistory v-show="screen === 2" />
        <HoldOrder v-show="screen === 3" />
      </v-col>
      <v-col cols="12" md="4" class="pos-summary-column">
        <OrderSummary />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted, watch } from "vue";
import Header from "./Header.vue";
import ProductList from "./ProductList.vue";
import OrderSummary from "./OrderSummary.vue";
import Payment from "./PaymentNew.vue";
import OrderHistory from "./OrderHistory.vue";
import HoldOrder from "./HoldOrders.vue";

import ProductDialog from "./ProductDialog.vue";
import eventBus from "../../bus.js";
import PosOpeningDialog from "./PosOpeningDialog.vue";
import PosClosingDialog from "./PosClosingDialog.vue";
import indexedDBService from "../../indexedDB";

const screen = ref(null);
const dialog = ref(false);
const pos_profile = ref("");
const pos_opening_shift = ref("");
const payment = ref(false);
const offers = ref(false);
const coupons = ref(false);
const check_opening_entry = async () => {
  try {
    const r = await frappe.call(
      "tech4all_standard_pos.tech4all_standard_pos.api.posapp.check_opening_shift",
      {
        user: frappe.session.user,
      }
    );

    if (r.message) {
      indexedDBService
        .openDatabase()
        .then(() => {
          return indexedDBService.deleteAllPosProfiles();
        })
        .then(() => {
          // console.log('In start All POS Profiles deleted from IndexedDB');
        })
        .catch((error) => {
          console.error("Error get offers:", error);
        });
      pos_profile.value = r.message.pos_profile;
      pos_opening_shift.value = r.message.pos_opening_shift;
      eventBus.emit("register_pos_profile", r.message);
      eventBus.emit("set_company", r.message.company);
      eventBus.emit("send_pos_profile", pos_profile.value);
      // Save emitted values in localStorage
      // localStorage.setItem(
      //   "pos_profile",
      //   JSON.stringify(r.message.pos_profile)
      // );
      localStorage.setItem("company", r.message.company);
      localStorage.setItem(
        "pos_opening_shift",
        JSON.stringify(r.message.pos_opening_shift)
      );

      // get_offers(pos_profile.value.name);
      // Open the IndexedDB once and then perform all operations within the chain
      indexedDBService
        .openDatabase()
        .then((db) => {
          // Save POS Profile and POS Opening Shift in IndexedDB
          return Promise.all([
            indexedDBService.savePosItems(JSON.stringify(pos_profile.value)),
            indexedDBService.savePosOpeningShift(
              JSON.stringify(pos_opening_shift.value)
            ),
          ]);
        })
        .then(() => {
          // console.log("POS items and opening shift saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving to IndexedDB:", error);
        });
    } else {
      create_opening_voucher();
    }
  } catch (error) {
    console.error("Error checking opening entry", error);
  }
};

const create_opening_voucher = () => {
  dialog.value = true;
};

const get_offers = async (pos_profile_name) => {
  try {
    const r = await frappe.call(
      "tech4all_standard_pos.tech4all_standard_pos.api.posapp.get_offers",
      {
        profile: pos_profile_name,
      }
    );

    if (r.message) {
      eventBus.emit("set_offers", r.message);
      if (r.message.length > 0) {
        indexedDBService
          .openDatabase()
          .then(() => {
            return indexedDBService.saveOffers(JSON.stringify(r.message));
          })
          .then(() => {
            // console.log("get offers saved successfully!");
          })
          .catch((error) => {
            console.error("Error get offers:", error);
          });
      }
    }
  } catch (error) {
    console.error("Error getting offers", error);
  }
};

const get_closing_data = async () => {
  try {
    const posOpeningShift = JSON.parse(
      localStorage.getItem("pos_opening_shift")
    );
    pos_opening_shift.value = posOpeningShift;
    const r = await frappe.call(
      "tech4all_standard_pos.tech4all_standard_pos.doctype.pos_closing_shift.pos_closing_shift.make_closing_shift_from_opening",
      { opening_shift: pos_opening_shift.value }
    );
    if (r.message) {
      eventBus.emit("open_ClosingDialog", r.message);
    }
  } catch (error) {
    console.error("Error fetching closing data", error);
  }
};

const submit_closing_pos = async (data) => {
  try {
    const r = await frappe.call(
      "tech4all_standard_pos.tech4all_standard_pos.doctype.pos_closing_shift.pos_closing_shift.submit_closing_shift",
      { closing_shift: data }
    );

    if (r.message) {
      eventBus.emit("show_mesage", {
        text: `POS Shift Closed`,
        color: "success",
      });
      eventBus.emit("shift-closed");
      pos_profile.value = "";
      pos_opening_shift.value = "";
      // localStorage.setItem("pos_profile", JSON.stringify(pos_profile.value));
      localStorage.setItem("company", "");
      localStorage.setItem(
        "pos_opening_shift",
        JSON.stringify(pos_opening_shift.value)
      );
      localStorage.setItem("get-all-item-status", false);
      localStorage.setItem("All-items_storage", []);
      localStorage.clear();
      indexedDBService
        .openDatabase()
        .then(() => {
          return indexedDBService.deleteAllPosProfiles();
        })
        .then(() => {
          // console.log('get response All POS Profiles deleted from IndexedDB');
        })
        .catch((error) => {
          console.error("Error get offers:", error);
        });

      check_opening_entry();
    }
  } catch (error) {
    console.error("Error submitting closing POS", error);
  }
};

const get_pos_setting = async () => {
  try {
    const doc = await frappe.db.get_doc("POS Settings", undefined);
    eventBus.emit("set_pos_settings", doc);
    // Save POS settings in IndexedDB
    indexedDBService
      .openDatabase()
      .then(() => {
        return indexedDBService.savePosSettings(JSON.stringify(doc));
      })
      .then(() => {
        // console.log("POS settings saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving POS settings:", error);
      });
  } catch (error) {
    console.error("Error getting POS settings", error);
  }
};
const onEnterKey = (event) => {
  if (event.key === "Enter") {
    eventBus.emit("enter-key-called");
  }
};
watch(
  screen,
  (newVal, oldVal) => {
    if (newVal) {
      eventBus.emit("current-screen", newVal);
    }
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("keydown", onEnterKey);

  screen.value = 0;
  check_opening_entry();
  get_pos_setting();
  window.addEventListener("offline", () => {
    // console.log("In home You are offline");
    eventBus.emit("internet-status", false);
  });

  window.addEventListener("online", () => {
    // console.log("In Home You are online");
    eventBus.emit("internet-status", true);
  });
  eventBus.on("close_opening_dialog", () => {
    dialog.value = false;
  });
  eventBus.emit("current-screen", screen.value);

  eventBus.on("register_pos_data", (data) => {
    pos_profile.value = data.pos_profile;
    // pos_opening_shift.value = data.pos_opening_shift;
    // get_offers(pos_profile.value.name);
    eventBus.emit("register_pos_profile", data);
  });

  eventBus.on("show_payment", (data) => {
    payment.value = data === "true";
    offers.value = false;
    coupons.value = false;
  });

  eventBus.on("show_offers", (data) => {
    offers.value = data === "true";
    payment.value = false;
    coupons.value = false;
  });

  eventBus.on("show_coupons", (data) => {
    coupons.value = data === "true";
    offers.value = false;
    payment.value = false;
  });

  eventBus.on("open_closing_dialog", () => {
    get_closing_data();
  });

  eventBus.on("submit_closing_pos", (data) => {
    submit_closing_pos(data);
  });

  eventBus.on("go-for-payment", () => {
    screen.value = 1;
  });
  eventBus.on("go-to-order-history", () => {
    screen.value = 2;
  });

  eventBus.on("go-to-hold-order", () => {
    screen.value = 3;
  });

  eventBus.on("open-product-menu", () => {
    screen.value = 0;
    eventBus.emit("current-screen", screen.value);
  });
  eventBus.on(" open-product-screen", () => {
    screen.value = 0;
  });
});
onBeforeUnmount(() => {});
onUnmounted(() => {
  // Remove keydown event listener
  window.removeEventListener("keydown", onEnterKey);
  eventBus.off("close_opening_dialog");
  eventBus.off("register_pos_data");
  eventBus.off("LoadPosProfile");
  eventBus.off("show_offers");
  eventBus.off("show_coupons");
  eventBus.off("open_closing_dialog");
  eventBus.off("submit_closing_pos");
});
</script>

<style scoped>
.v-application {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2) !important;
}

.pos-shell {
  min-height: calc(100vh - 48px);
  padding: 12px 16px 16px;
}

.pos-content {
  margin: 0 -6px;
}

.pos-products-column,
.pos-summary-column {
  padding: 6px;
}

@media (max-width: 959px) {
  .pos-shell {
    padding: 8px;
  }
}

.zara-title {
  font-family: Noto Sans;
  font-weight: 500;
  font: Noto Sans;
  font-size: 20px;
  margin-left: 14px;
}
</style>
