import { createApp, h } from 'vue';
import Home from './components/zaraPos/CustomerScreen.vue';

// import Vuetify from 'vuetify';
import 'vuetify/styles'; // If using Vuetify 3
import { createVuetify } from 'vuetify';
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'



frappe.provide('frappe.CustomerScreen');

frappe.CustomerScreen.customerscreen = class {
    constructor({ parent }) {
        this.$parent = $(document);
        this.page = parent.page;
        this.make_body();
    }
    
    make_body () {
        this.$el = this.$parent.find('.main-section');
        // const vuetify = createVuetify(); // Vuetify 3
        const vuetify = createVuetify({
            components,
            directives,
          })

        
        // Create Vuetify instance
         // Vuetify 3 setup (if using Vuetify 3)
        //  const vuetify = new Vuetify({
        //     theme: {
        //         themes: {
        //             light: {
        //                 background: '#FFFFFF',
        //                 primary: '#0097A7',
        //                 secondary: '#00BCD4',
        //                 accent: '#9575CD',
        //                 success: '#66BB6A',
        //                 info: '#2196F3',
        //                 warning: '#FF9800',
        //                 error: '#E86674',
        //                 orange: '#E65100',
        //                 golden: '#A68C59',
        //                 badge: '#F5528C',
        //                 customPrimary: '#085294',
        //             },
        //         },
        //     },
        // });
        
        // Create Vue 3 app
        const app = createApp({
            render: () => h(Home),  // Use the render function
        });
        console.log("new -app",app)

        // Mount the app
        app.use(vuetify);

        // Mount the app to the DOM element
        app.mount(this.$el[0]);    }

    setup_header () {
        // Optional setup logic
    }
};
