// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    // define your application state here
    count:0
  },
  mutations: {
    // define your mutations here
  },
  actions: {
    // define your actions here
  },
  getters: {
    // define your getters here
  }
});

export default store;
