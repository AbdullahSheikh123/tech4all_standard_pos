<template>
  <!-- <v-app> -->
  <!-- App Bar (Navbar) -->
  <div>
    <v-app-bar app color="white" height="55" class="elevation-0">
      <!-- <v-app-bar-nav-icon @click="drawer = !drawer" /> -->
      <v-img
        src="/assets/tech4all_standard_pos/js/posapp/components/pos/logox.png"
        alt="Tech4All POS"
        max-width="42"
        class="mr-2 ml-2"
        @click="go_desk"
      ></v-img>
      <v-toolbar-title
        style="cursor: pointer"
        class="text-uppercase primary--text ml-1"
        @click="go_desk"
      >
        <span class="font-weight-light primary--text">Tech4All</span>
        <span class="ml-2 primary--text">pos</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
<!-- 
      <v-btn
        color="#21A0A0"
        class="mr-3"
        style="background-color: rgb(211, 236, 236)"
        @click="openCustomerScreen"
      >
        Customer screen
      </v-btn> -->

      <v-switch
        v-model="isInternet"
        :label="isInternet ? 'System is Online' : 'System is Offline'"
        hide-details
        inset
        class="switch-btn"
        color="#21A0A0"
        @click="isInternet = !isInternet"
      ></v-switch>
      <v-btn style="cursor: unset" text color="#21A0A0">
        <span right>{{ pos_profile.name }}</span>
      </v-btn>
      <div class="text-center">
        <v-menu transition="slide-x-transition">
          <template v-slot:activator="{ props }">
            <v-btn color="#21A0A0" dark text v-bind="props"> Menu </v-btn>
          </template>

          <v-list>
            <v-list-item class="d-flex" @click="closeShift()">
              <div style="display: flex">
                <v-icon class="mr-2 mt-1">mdi-content-save-move-outline</v-icon>
                <v-list-item-title>Close Shift</v-list-item-title>
              </div>
            </v-list-item>
            <v-list-item class="d-flex" @click="logOut()">
              <div style="display: flex">
                <v-icon class="mr-2 mt-1">mdi-logout</v-icon>
                <v-list-item-title>Logout</v-list-item-title>
              </div>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Navigation Drawer -->

    <v-navigation-drawer
      style="background-color: #0d1821; width: 63px"
      permanent
      rail
    >
      <v-list-item>
        <!-- <v-img
          src="/assets/tech4all_standard_pos/js/posapp/components/pos/logo.png"
          alt="POS"
          max-width="70"
          @click="go_desk"
          class="ml-1 pt-3"
        ></v-img> -->
      </v-list-item>

      <v-divider></v-divider>

      <v-list
        density="compact"
        nav
        class="px-0 curser-pointer"
        style="padding-top: 124px"
      >
        <v-list-item @click="goToDashboard()">
          <v-img
            class="img pl-1"
            src="/assets/tech4all_standard_pos/js/posapp/components/pos/dashboard.png"
            alt=""
            cover
            style="width: 38px; height: 40px"
          ></v-img>
          <p style="color: white" class="mb-0 pl-1">Dash</p>
          <p style="color: white" class="pt-0">board</p>
        </v-list-item>
        <v-list-item class="mt-4" @click="goToHoldOrder()">
          <v-img
            class="img pl-1"
            src="/assets/tech4all_standard_pos/js/posapp/components/pos/receipt.png"
            alt=""
            cover
            style="width: 38px; height: 40px"
          ></v-img>
          <p style="color: white" class="ml-1 mb-0 pt-1">Hold</p>
          <p style="color: white" class="pt-0">Orders</p>
        </v-list-item>
        <v-list-item class="mt-4" @click="goToOrderHistory()">
          <v-badge
            v-if="newOrder"
            color="error"
            content="New"
            inline
            class="badge-position"
          ></v-badge>
          <v-img
            class="img pl-1"
            src="/assets/tech4all_standard_pos/js/posapp/components/pos/store.png"
            alt=""
            cover
            style="width: 38px; height: 40px"
          ></v-img>
          <p style="color: white" class="ml-1 mb-0 pt-1">Sale</p>
          <p style="color: white" class="pt-0">Orders</p>
        </v-list-item>
      </v-list>
      <div style="padding-top: 300px">
        <v-tooltip bottom style="" theme="black">
          <template #activator="{ props }">
            <v-badge color="error" :content="unsyncInvoice" class="">
              <v-icon
                v-bind="props"
                size="32"
                color="white"
                class="pl-7 curser-pointer"
              >
                mdi-sync-off
              </v-icon>
            </v-badge>
          </template>
          <span>Unsync Invoice: {{ unsyncInvoice }} </span>
        </v-tooltip>
      </div>
    </v-navigation-drawer>

    <!-- <v-navigation-drawer
      app
      expand-on-hover
      rail
      v-model="drawer"
      temporary
      style="background-color: #0d1821"
    >
      <div>
        <v-list density="compact" nav>
          <v-list-item
            title="Dashboard"
            value="Dashboard"
            style="color: white"
            @click="goToDashboard()"
          >
            <template v-slot:prepend>
              <v-icon size="36" color="white" class="pr-3"
                >mdi-view-dashboard</v-icon
              >
            </template>
          </v-list-item>
          <v-list-item
            title="Order History"
            value="Order history"
            style="color: white"
            @click="goToOrderHistory()"
          >
            <template v-slot:prepend>
              <v-icon size="36" color="white" class="pr-3">mdi-receipt</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            title="Hold Order"
            value="Hold Order"
            style="color: white"
            @click="goToHoldOrder()"
          >
            <template v-slot:prepend>
              <v-icon size="36" color="white" class="pr-3">mdi-receipt</v-icon>
            </template>
          </v-list-item>
          <v-list-item style="color: white">
            <template v-slot:prepend>
              <v-icon size="36" color="white" class="pr-3">mdi-sync-off</v-icon>
            </template>
            <template v-slot:title>
              Unsync Invoice: <span>{{ unsyncInvoice }}</span>
            </template>
          </v-list-item>
        </v-list>
    
      </div>
    </v-navigation-drawer> -->

    <div>
      <v-snackbar
        v-model="snack"
        top
        right
        :elevation="0"
        :timeout="5000"
        :color="snackColor"
        class="snack custom-snackbar"
        :class="'snack-type-' + type"
      >
        <div class="notification-content">
          <div class="notification-icon" :class="type">
            <v-icon v-if="type === 'success'">mdi-check-bold</v-icon>
            <v-icon v-if="type === 'error'">mdi-alert-circle</v-icon>
            <i class="fa fa-info-circle" v-if="type === 'info'"></i>
          </div>

          <div
            class="notification-message"
            style="font-size: 16px; font-weight: 500"
          >
            {{ snackText }}
          </div>
        </div>
        <template v-slot:action="{ attrs }">
          <a class="close-notification-button" v-bind="attrs">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </v-snackbar>
    </div>

    <!-- Main Content -->
    <v-main>
      <!-- <v-container>
        <h1>Main Content Area</h1>
        <p>This is where the content of your application will go.</p>
      </v-container> -->
      <!-- <POS/> -->
    </v-main>
  </div>
  <!-- </v-app> -->
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from "vue";
import POS from "./zaraPos/Home.vue";
import eventBus from "../bus";

export default {
  name: "NavDrawer",
  components: {
    POS,
  },
  setup() {
    // Reactive state for controlling the drawer visibility
    const drawer = ref(false);
    const loggedOut = ref(false); // Ref to track logged-out state
    const pos_profile = ref("");
    const snack = ref(false);
    const snackColor = ref("");
    const snackText = ref("");
    const type = ref("");
    const isInternet = ref(true);
    const unsyncInvoice = ref(0);
    const speedMbps = ref(null); // Measured internet speed in Mbps
    let intervalId = null; // Interval ID for clearing later
    const punching = ref("completed");
    const test = ref(false);
    const newOrder = ref(false);

    const goToOrderHistory = () => {
      newOrder.value = false;
      eventBus.emit("go-to-order-history");
    };
    const openCustomerScreen = () => {
      console.log("oopenCustomerScreen", window.location.pathname);
      const customerScreenUrl = `${window.location.origin}/app/customerscreen`; // Update the path if using Vue Router
      window.open(customerScreenUrl, "_blank");
    };

    const getHoldOrders = async () => {
      try {
        // Retrieve hold orders from local storage
        // orders.value = [];
        const heldOrders =
          (await JSON.parse(localStorage.getItem("heldOrders"))) || [];
        eventBus.emit("go-to-hold-order", heldOrders);

        console.log("Hold orders retrieved successfully:", heldOrders);
      } catch (error) {
        console.error("Failed to retrieve hold orders:", error);
      }
    };
    const goToHoldOrder = () => {
      getHoldOrders();

      // eventBus.emit("go-to-hold-order");
    };
    const goToDashboard = () => {
      eventBus.emit("open-product-menu");
    };

    const go_desk = () => {
      frappe.set_route("/");
      location.reload();
    };
    const closeShift = () => {
      eventBus.emit("open_closing_dialog");
    };

    const logOut = () => {
      loggedOut.value = true;

      // Assuming 'frappe' is available in your scope, modify accordingly if necessary
      return frappe.call({
        method: "logout",
        callback: (r) => {
          if (r.exc) {
            return;
          }
          frappe.set_route("/login");
          location.reload();
        },
      });
    };
    const showNotification = (data) => {
      snackText.value = data.text;
      snackColor.value = data.color;
      type.value = data.color;
      snack.value = true;
    };
    const syncSalesInvoicesFromIndexedDB = async () => {
      try {
        // Await the promise returned by openDatabase
        const db = await indexedDBService.openDatabase();
        const allRecords = await fetchUnsyncedSalesInvoiceRecords(db);
        // console.log("Fetched unsynced records length:", allRecords.length);
        unsyncInvoice.value = allRecords.length;
      } catch (error) {
        console.error("Error during synchronization:", error);
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

            // Update online status based on threshold
            isInternet.value = parseFloat(calculatedSpeedMbps) >= threshold;
            if (calculatedSpeedMbps > 2) {
              isInternet.value = true;
            } else {
              console.log("offline mode on");
              isInternet.value = false;
            }

            console.log(
              `Internet speed: ${calculatedSpeedMbps} Mbps. ${
                isInternet.value ? "Online" : "Offline"
              }`
            );
            resolve({
              speedMbps: calculatedSpeedMbps,
              isOnline: isInternet.value,
            });
          };

          download.onerror = () => {
            speedMbps.value = null;
            isInternet.value = false;
            console.error("Error measuring internet speed.");
            reject(new Error("Error measuring internet speed."));
          };
        });
      } catch (error) {
        console.error("Error checking internet speed:", error);
        throw error;
      }
    };

    watch(isInternet, (newStatus) => {
      if (newStatus) {
        // Logic to handle going online
        console.log("Internet is now Online");
        // Place any additional functionality for "Online" state here
      } else {
        // Logic to handle going offline
        console.log("Internet is now Offline");
        // Place any additional functionality for "Offline" state here
      }
      eventBus.emit("app-internet-status", newStatus);
    });
    watch(drawer, (newStatus) => {
      if (newStatus) {
        // syncSalesInvoicesFromIndexedDB;
      }
    });
    onMounted(() => {
      // checkInternetSpeed()
      // intervalId = setInterval(() => {
      //   if (navigator.onLine) {
      //   checkInternetSpeed();
      //   }
      // }, 15000);
      
      frappe.realtime.on("sales_order_created", function (data) {
        console.log("New sales order created Navbar:", data);
        if (data.sender == pos_profile.value.custom_branch) {
          newOrder.value = true;
          frappe.utils.play_sound("submit");
   
          eventBus.emit("show_mesage", {
            text: `You have received a new Order`,
            color: "success",
          });
        }
      });
      if (navigator.onLine) {
        isInternet.value = true;
      } else {
        isInternet.value = false;
      }
      window.addEventListener("offline", () => {
        isInternet.value = false;
      });

      window.addEventListener("online", () => {
        isInternet.value = true;
      });

      eventBus.on("punching-status", (data) => {
        punching.value = data;
      });

      // console.log("navbar-internet", isInternet.value);
      eventBus.on("internet-status", (newVal) => {
        isInternet.value = newVal;
      });

      eventBus.on("logout-pos", () => {
        logOut();
      });
      eventBus.on("send_pos_profile", (profile) => {
        pos_profile.value = profile;
      });
      eventBus.on("show_mesage", (data) => {
        showNotification(data);
      });
      eventBus.on("Unsync-record", (data) => {
        unsyncInvoice.value = data;
      });
    });
    onUnmounted(() => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      eventBus.off("punching-status");
      eventBus.off("internet-status");
      eventBus.off("logout-pos");
      eventBus.off("send_pos_profile");
      eventBus.off("Unsync-record");
    });

    return {
      drawer,
      goToOrderHistory,
      loggedOut,
      logOut,
      pos_profile,
      go_desk,
      closeShift,
      snack,
      snackColor,
      snackText,
      type,
      goToDashboard,
      goToHoldOrder,
      isInternet,
      unsyncInvoice,
      checkInternetSpeed,
      syncSalesInvoicesFromIndexedDB,
      punching,
      newOrder,
      // getHoldOrders,
      openCustomerScreen,
    };
  },
};
</script>

<style scoped>
/* Add custom styling as necessary */
.custom-snackbar {
  position: fixed !important;
  top: 40px !important;
  right: 20px;
  z-index: 9999; /* Ensures it appears on top of other content */
  margin: 0;
}
.badge-position {
  position: absolute;
  top: -11px;
  right: 2px;
}
</style>
<style>
.v-switch .v-label {
  margin-top: 8px;
}
.notification-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.notification-content .notification-icon.success {
  background-color: #3fbf62;
}
.notification-content .notification-icon.error {
  background-color: #ec4f2b;
}
.notification-content .notification-icon.info {
  background-color: #016de6;
}
.notification-content .notification-icon.warning {
  background-color: #ee9401;
}

.v-snack.snack-type-success .v-snack__wrapper {
  background-color: #eaf7ee !important;
  border: 1px solid #a4ddb4 !important;
}
.v-snack.snack-type-error .v-snack__wrapper {
  background-color: #fcece9 !important;
  border: 1px solid #f4c5bb !important;
}
.v-snack.snack-type-info .v-snack__wrapper {
  background-color: #e4effa !important;
  border: 1px solid #abcdf1 !important;
}
.v-snack.snack-type-warning .v-snack__wrapper {
  background-color: #fef7e9 !important;
  border: 1px solid #fde0af !important;
}
.notification-content .notification-message {
  color: white !important;
}
.notification-content .notification-icon i {
  width: 27px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.notification-content .notification-icon {
  font-size: 25px !important;
  padding: 5px;
  border-radius: 8px;
  margin-right: 10px;
}

.v-snack__btn.close-notification-button {
  color: #484848;
  margin-right: 10px;
}

.v-snack__content {
  padding: 5px 7px !important;
}
.v-snackbar--variant-elevated {
  position: fixed !important;
  top: 40px !important;
}
.curser-pointer {
  cursor: pointer;
}
</style>
