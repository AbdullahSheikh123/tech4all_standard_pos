<template>
  <div>
    <v-container class="mx-auto px-8">
      <v-row no-gutters class="d-flex justify-center align-center">
        <v-col sm="12">
          <div class="bg-white rounded-xl table-data pa-8">
            <div class="align-center d-flex justify-center">
              <div align="center">
                <img
                src="/assets/tech4all_standard_pos/js/posapp/components/pos/client.png"
                class="w-50"
                  alt="logo"
                />
                <div class="text-subtitle-1 text-center">
                  Welcome to Standard
                </div>
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
                    <th class="text-left table-header" style="width: 15%">
                      NET
                    </th>
                    <th class="text-left table-header" style="width: 10%">
                      QTY.
                    </th>
                    <th class="text-left table-header" style="width: 15%">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in data"
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
                          {{ item.item }}
                        </span>
                      </div>
                    </td>
                    <td class="td-data">Rs.{{ item.net }}</td>
                    <td class="td-data">{{ item.quantity }}</td>
                    <td class="td-data" style="color: #f69e7b">
                      Rs.{{ item.total }}
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
              <v-row>
                <v-col cols="6" md="2">
                  <div>
                    <h5 class="title py-2">Total Amount</h5>
                    <h6 class="amount py-2" style="color: #818181">
                      Rs. 620.00
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
                    <h6 class="amount py-2" style="color: #000">Rs. 69.00</h6>
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
                      Rs. 620.00
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
                      Rs. 20.00
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
                    <h6 class="amount py-2" style="color: #000">Rs. 669.00</h6>
                    <div
                      style="width: 100%; height: 1px; background: #f05d23"
                      class="mt-3"
                    ></div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>
        <!-- <v-col sm="4">
            <div class="bg-white rounded-xl ms-4 pa-4 table-data{" >
                <img src="../assets/images/Banner.png" class="h-auto w-100" alt="">
            </div>
            <div class="bg-white rounded-xl ms-4 mt-4 pa-8 d-flex align-center table-data{" >
              <img src="../assets/images/qr_code.svg" alt="QR code" style="width: 50px; height: 50px;">
              <span class="ms-4 text-h6" style="color: #3D464D; line-height: 25px !important;">
                Scan your code to redeem points and discounts
              </span>
            </div>
          </v-col> -->
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
// import fashionImage from '../assets/images/fashion.png';

const data = [
  {
    item: "3 Piece Unstitched Embroidered Organza Suit | BD-2901",
    net: 100000,
    quantity: 1000000,
    total: 1000000,
  },
  {
    item: "3 Piece Unstitched Embroidered Organza Suit | BD-2901",
    net: 100000,
    quantity: 1000000,
    total: 1000000,
  },
  {
    item: "3 Piece Unstitched Embroidered Organza Suit | BD-2901",
    net: 100000,
    quantity: 1000000,
    total: 1000000,
  },
  {
    item: "3 Piece Unstitched Embroidered Organza Suit | BD-2901",
    net: 100000,
    quantity: 1000000,
    total: 1000000,
  },
  {
    item: "3 Piece Unstitched Embroidered Organza Suit | BD-2901",
    net: 100000,
    quantity: 1000000,
    total: 1000000,
  },
  {
    item: "3 Piece Unstitched Embroidered Organza Suit | BD-2901",
    net: 100000,
    quantity: 1000000,
    total: 1000000,
  },
];
</script>

<style scoped>
@import url("../assets/main.css");
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
