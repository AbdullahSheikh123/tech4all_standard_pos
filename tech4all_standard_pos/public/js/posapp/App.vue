<template>
  <v-app>
    <Navbar1 />
    <v-main class="pt-0" style="background: #f4f4f4">
      <v-container fluid>
        <POS />
      </v-container>
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
</style>
