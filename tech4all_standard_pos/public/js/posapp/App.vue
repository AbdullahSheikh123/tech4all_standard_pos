<template>
  <v-app>
    <Navbar1 />
    <v-main class="pt-0 pos-main" style="background: #f4f4f4">
      <POS />
    </v-main>
  </v-app>
</template>

<script>
import { ref, onMounted } from "vue";
import Navbar1 from "./components/Navbar1.vue";
import POS from "./components/zaraPos/Home.vue";

export default {
  name: "MyComponent",
  components: {
    Navbar1,
    POS,
  },
  setup() {
    const page = ref("POS");

    // Return data and methods to the template
    onMounted(() => {
      console.log("window", window.location);
    });
    return {
      // message,
      // counter,
      // incrementCounter,
      // resetCounter,
    };
  },
};
</script>

<style>
.border-16 {
  border-radius: 16px !important;
}
/* v-container (removed above) was the source of unwanted default padding
   on all sides; v-main itself adds none beyond the automatic layout offset
   for the app-bar/nav-drawer, but this keeps it explicit and future-proof. */
.pos-main {
  padding: 0 !important;
}
</style>
