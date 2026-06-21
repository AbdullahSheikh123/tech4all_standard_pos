<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" persistent max-width="600px">
      <v-card>
        <v-card-title class="mt-2">
          <span class="headline pl-6">Create POS Opening Shift</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Company Dropdown -->
              <v-col cols="12">
                <v-select
                  v-model="selectedCompany"
                  :items="companies"
                  label="Company"
                  required
                ></v-select>
              </v-col>

              <!-- POS Profile Dropdown -->
              <v-col cols="12">
                <v-select
                  v-model="selectedPosProfile"
                  :items="pos_profiles_data"
                  label="POS Profile"
                  required
                  item-title="name"
                ></v-select>
              </v-col>

              <!-- Payment Methods Data Table -->
              <v-col cols="12">
                <v-data-table
                  :headers="tableHeaders"
                  :items="payments_methods"
                  class="elevation-1"
                  hide-default-footer
                >
                  <template v-slot:header.amount="{ header }">
                    <span style="padding-right: 84px">Opening Amount</span>
                  </template>
                  <!-- Slot for editable 'Opening Amount' -->
                  <template v-slot:item.amount="{ item }">
                    <v-text-field
                      v-model="item.amount"
                      type="number"
                      min="0"
                      :rules="[rules.required, rules.maxLength]"
                      outlined
                      dense
                      hide-details="auto"
                      readonly
                    ></v-text-field>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <!-- Dialog Actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="goDesk()">Cancel</v-btn>
          <v-btn color="success" @click="submitDialog">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import eventBus from "../../bus";
import indexedDBService from "../../indexedDB";

export default {
  props: ["dialog"],
  setup(props) {
    const isOpen = ref(props.dialog ? props.dialog : false);
    const selectedCompany = ref(null);
    const selectedPosProfile = ref(null);
    // const company = ref('');

    const pos_profiles_data = ref([]);
    const pos_profiles = ref([]);
    const is_loading = ref(false);

    // const pos_profile = ref('');

    const payments_methods = ref([]);
    const payments_method_data = ref([]);
    const branch_account_balances = ref([]);

    // Dummy Data for Dropdowns
    const companies = ref([]);
    // const posProfiles = ref([
    //   "Nandos Emporium Mall",
    //   "Nandos DHA",
    //   "Nandos Gulberg",
    // ]);

    // Payment Methods Data
    const paymentMethods = ref([]);

    // Table Headers
    const tableHeaders = ref([
      { title: "Mode of Payment", value: "mode_of_payment" },
      { title: "Opening Amount", value: "amount", align: "end" },
    ]);

    const rules = {
      required: (value) => !!value || "Input required!",
      maxLength: (value) => String(value).length <= 12 || "Input too long!",
    };

    // Close Dialog
    const closeDialog = () => {
      isOpen.value = false;
    };
    const goDesk = () => {
      frappe.set_route("/");
      location.reload();
    };
    const closeOpeningDialog = () => {
      eventBus.emit("close_opening_dialog");
    };

    const getOpeningDialogData = () => {
      frappe.call({
        method:
          "tech4all_standard_pos.tech4all_standard_pos.api.posapp.get_opening_dialog_data",
        args: {},
        callback: (r) => {
          if (r.message) {
            companies.value = r.message.companies.map(
              (element) => element.name
            );
            selectedCompany.value = companies.value[0];
            pos_profiles_data.value = r.message.pos_profiles_data;
            payments_method_data.value = r.message.payments_method;
            branch_account_balances.value = r.message.branch_account_balances;
          }
        },
      });
    };
    const submitDialog = () => {
      if (
        !payments_methods.value.length ||
        !selectedCompany.value ||
        !selectedPosProfile.value
      ) {
        eventBus.emit("show_message", {
          text: "Please ensure all required fields are filled.",
          color: "error",
        });
        return;
      }

      is_loading.value = true;

      // Ensure frappe.call is wrapped in a Promise if it doesn't return one
      Promise.resolve(
        frappe.call(
          "tech4all_standard_pos.tech4all_standard_pos.api.posapp.create_opening_voucher",
          {
            pos_profile: selectedPosProfile.value,
            company: selectedCompany.value,
            balance_details: payments_methods.value,
          }
        )
      )
        .then((r) => {
          if (r.message) {
            indexedDBService
          .openDatabase()
          .then(() => {
            return indexedDBService.deleteAllPosProfiles();
          })
          .then(() => {
        console.log('get response All POS Profiles deleted from IndexedDB');
          })
          .catch((error) => {
            console.error("Error get offers:", error);
          });
            eventBus.emit("current-screen", 0);
            setTimeout(() => {
              eventBus.emit("register_pos_profile", r.message);
              eventBus.emit("set_company", r.message.company);
              eventBus.emit("send_pos_profile", r.message.pos_profile);
              eventBus.emit("current-screen", 0);
            }, 100);

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
            indexedDBService
        .openDatabase()
        .then((db) => {
          // Save POS Profile and POS Opening Shift in IndexedDB
          return Promise.all([
            indexedDBService.savePosItems(JSON.stringify(r.message.pos_profile)),
            indexedDBService.savePosOpeningShift(
              JSON.stringify(r.message.pos_opening_shift)
            ),
          ]);
        })
        .then(() => {
          console.log("POS items and opening shift saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving to IndexedDB:", error);
        });
            closeOpeningDialog();
          } else {
            eventBus.emit("show_message", {
              text: "An unexpected error occurred. Please try again.",
              color: "error",
            });
          }
        })
        .catch((error) => {
          console.error("Error creating opening voucher:", error);
          is_loading.value = false;

          // Show user-friendly error message
          eventBus.emit("show_message", {
            text: "Failed to create opening voucher. Please check your network connection or contact support.",
            color: "error",
          });
        })
        .finally(() => {
          // Reset loading state here if `finally` is supported
          is_loading.value = false;
        });

      // Fallback for resetting loading state in case `finally` is not supported
      is_loading.value = false;
    };

    watch(selectedCompany, (val) => {
      pos_profiles.value = [];
      pos_profiles.value = pos_profiles_data.value
        .filter((element) => element.company === val)
        .map((element) => element.name);
      selectedPosProfile.value = pos_profiles.value.length
        ? pos_profiles.value[0]
        : "";
    });
    watch(selectedPosProfile, (val) => {
      payments_methods.value = [];
      payments_methods.value = payments_method_data.value
        .filter((element) => element.parent === val)
        .map((element) => {
          const balanceEntry = branch_account_balances.value.find(
            (entry) => entry.pos_profile === val
          );
          const balance = balanceEntry ? balanceEntry.balance : 0;
          return {
            mode_of_payment: element.mode_of_payment,
            amount: element.type === "Cash" ? balance : 0,
            currency: element.currency,
          };
        });
    });
    onMounted(() => {
      getOpeningDialogData();
    });

    return {
      isOpen,
      selectedCompany,
      selectedPosProfile,
      companies,
      //   posProfiles,
      paymentMethods,
      tableHeaders,
      rules,
      closeDialog,
      submitDialog,
      getOpeningDialogData,
      pos_profiles_data,
      branch_account_balances,
      payments_method_data,
      goDesk,
      closeOpeningDialog,
      payments_methods,
    };
  },
};
</script>

<style scoped>
.headline {
  font-size: 18px;
  font-weight: bold;
}
</style>
