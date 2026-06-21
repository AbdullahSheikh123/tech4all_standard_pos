<template>
  <v-dialog v-model="dialog" max-width="741px" height="720" persistent>
    <v-card style="height: 720px; overflow-y: hidden; border-radius: 16px">
      <v-card-title class="d-flex justify-end">
        <v-btn variant="text" size="x-small" density="default" color="white" style="background: orange"
          @click="closeDialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-8">
        <v-row>
          <!-- Left side: Image and product details -->
          <v-col cols="5">
            <v-img :src="selectedProduct.image" alt="Product Image" height="580 " aspect-ratio="1" cover
              class="mb-4 product-img py-0"></v-img>
            <div class="py-0 item-content">
              <div class="item-name">
                {{ selectedProduct.item_name ? selectedProduct.item_name : "" }}
              </div>
              <div class="item-price">
                {{ pos_profile.custom_currency_symbol }} {{ selectedProduct.rate ? selectedProduct.rate : "" }}
              </div>
            </div>
          </v-col>

          <!-- Right side: Product specifications and actions -->
          <v-col cols="7">
            <div class="d-flex justify-between">
              <div class="black--text item-title">Item Number</div>
              <div>{{ selectedProduct.item_code }}</div>
            </div>

            <div class="mt-7 d-flex justify-between">
              <div class="black--text item-title">Item Detail</div>
              <div>{{ selectedProduct.item_name }}</div>
            </div>
            <div class="mt-8 d-flex justify-between">
              <div class="black--text item-title">Inventory</div>
              <div>{{ selectedProduct.actual_qty }}</div>
            </div>

            <div class="mt-7 d-flex justify-between"></div>

            <div class="d-flex justify-between">
              <!-- <div class="black--text item-title">Embroidery Lawn Dupatta</div>
              <div>2.50 m</div> -->
            </div>

            <div class="d-flex justify-between">
              <!-- <div class="black--text item-title">Died Cambric Trouser</div>
              <div>2.50 m</div> -->
            </div>

            <v-divider class="mt-16 border-opacity-75 mx-6" :thickness="1" style="background-color: grey"></v-divider>

            <!-- Quantity selection and Add to Cart button -->
            <v-row class="my-4 align-center">
              <v-col cols="4" class="text-right">
                <v-btn variant="outlined" size="x-large" class="text-capitalize" color="#21A0A0"
                  style="background-color: #d3ecec; border-radius: 8px" @click="decreaseQuantity">-</v-btn>
              </v-col>
              <v-col cols="4" class="text-center">
                <div class="text-quantity black--text">{{ quantity }}</div>
                <v-divider class="mx-7 border-opacity-75" :thickness="2" style="background-color: black"></v-divider>
              </v-col>
              <v-col cols="4" class="text-left">
                <v-btn variant="outlined" size="x-large" class="text-capitalize" color="#21A0A0"
                  style="background-color: #d3ecec; border-radius: 8px" @click="increaseQuantity">+</v-btn>
              </v-col>
            </v-row>

            <v-btn block class="mt-9" size="x-large" color="#21A0A0" style="border-radius: 8px" @click="addToCart">
              ADD
            </v-btn>
            <div class="font-weight-bold" style="margin-top: 108px !important">
              Description
            </div>
            <div class="grey--text">
              {{ selectedProduct.description }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, onMounted } from "vue";
import eventBus from "../../bus";

export default {
  setup() {
    const dialog = ref(false);
    const quantity = ref(1); // Initial quantity
    const selectedProduct = ref("");
    const updateQty = ref(false);
    const pos_profile = ref("");

    const increaseQuantity = () => {
      quantity.value++;
      selectedProduct.value.qty = quantity.value;
    };

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
        selectedProduct.value.qty = quantity.value;
      }
    };

    const addToCart = () => {
      if (!updateQty.value) {
        eventBus.emit("add-to-cart", selectedProduct.value);
      } else {
        eventBus.emit("exist-item-cart", selectedProduct.value);
      }
      dialog.value = false;
    };
    const closeDialog = () => {
      dialog.value = false;
      if (updateQty.value) {
        eventBus.emit("exist-item-cart", selectedProduct.value);
      }
    };

    onMounted(() => {
      eventBus.on("open-product-dialog", (data) => {
        updateQty.value = data.flag;
        quantity.value = data.product.qty ? data.product.qty : 1;
        data.product.qty = quantity.value;
        selectedProduct.value = data.product;
        if (selectedProduct.value) {
          dialog.value = true;
        }
      });

      eventBus.on("send_pos_profile", (profile) => {
        pos_profile.value = profile;
      })
    });

    return {
      dialog,
      quantity,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      selectedProduct,
      updateQty,
      closeDialog,
      pos_profile
    };
  },
};
</script>

<style scoped>
.text-h5 {
  font-size: 24px;
}

.text-h6 {
  font-size: 20px;
}

.grey--text {
  color: #9e9e9e;
}

.product-img {
  /* height: 537px; */
  position: relative;
  bottom: 81px;
}

.item-content {
  position: relative;
  bottom: 60px;
}

.item-name {
  font-size: 16px;
  font-weight: 800;
}

.item-price {
  font-size: 14px;
  font-weight: 700;
  color: #f69e7b;
}

.item-title {
  font-size: 12px;
  font-weight: 700;
}

.text-quantity {
  font-size: 35px;
  font-weight: 500;
}
</style>
