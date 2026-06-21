<template>
  <v-app class="container1"  style="background: #F4F4F4;">
    <v-main style="padding: 40px 0 0; ">
      <!-- <Navbar @changePage="setPage($event)"></Navbar> -->
      <!-- <component v-bind:is="page" class="mx-4 md-4  main-div" ></component> -->
       <!-- <Dashboard></Dashboard> -->
    </v-main>
  </v-app>
</template>

<script>
import Navbar from './components/Navbar.vue';
import POS from './components/pos/Pos.vue';
import Payments from './components/payments/Pay.vue';
import Dashboard from './components/nandosPos/Dashboard.vue';
import { evntBus } from "./bus";
export default {
  data: function () {
    return {
      page: 'POS',
      lastActivityTime: '',
      checkInterval: '', // Interval to check every 10 seconds
    };
  },
  components: {
    Navbar,
    POS,
    Payments,
    Dashboard
  },
  methods: {
    setPage(page) {
      this.page = page;
    },
    remove_Tech4All_nav() {
      this.$nextTick(function () {
        $('.page-head').remove();
        $('.navbar.navbar-default.navbar-fixed-top').remove();
      });
    },
       // Update the last activity time
       updateLastActivity() {
      this.lastActivityTime = new Date().getTime();
      // console.log("lastActivityTime",this.lastActivityTime)
    },

    // Set up event listeners for user activity
    setupEventListeners() {
      window.addEventListener('mousemove', this.updateLastActivity);
      window.addEventListener('click', this.updateLastActivity);
      window.addEventListener('keypress', this.updateLastActivity);
      window.addEventListener('scroll', this.updateLastActivity);
    },
     // Start the interval to check every 10 seconds
     startCheckInterval() {
      this.checkInterval = setInterval(this.checkIdleTime, 10 * 1000); // 10 seconds
    },
    // Check if the user has been idle for more than 5 minutes
    checkIdleTime() {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - this.lastActivityTime;

      if (timeDiff >=  60 * 1000) { // If idle for 5 minutes or more
        // evntBus.$emit("go-to-pin-screen");
        // this.updateLoginStatus(false); // Update POS profile login status
      }
    },
  },
  mounted() {
    this.remove_Tech4All_nav();
    // this.updateLastActivity(); // Initialize the last activity time
    // this.setupEventListeners(); // Setup activity event listeners
    // this.startCheckInterval(); // Start the interval to check every 10 seconds
  },
  updated() {},
  created: function () {
    setTimeout(() => {
      this.remove_Tech4All_nav();
    }, 1000);
  },
  beforeDestroy() {
    // Clean up event listeners and intervals when the component is destroyed
    // window.removeEventListener('mousemove', this.updateLastActivity);
    // window.removeEventListener('click', this.updateLastActivity);
    // window.removeEventListener('keypress', this.updateLastActivity);
    // window.removeEventListener('scroll', this.updateLastActivity);
    // clearInterval(this.checkInterval);
  },
};
</script>

<style scoped>
.container1 {
  margin-top: 0px;
}
</style>
<style>
.font-30{
  font-size: 30px!important;
}
.font-26{
  font-size: 26px!important;

}
.num-p {
  font-size: 25px;
  font-weight: 600;
}
.summary-card {
  height: 92vh;
  border-radius: 8px !important;
}
.main-div{
  /* margin-top: 0px!important; */
}
</style>
