import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor, /* { default global options } */)
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/';
axios.interceptors.request.use(config=>{
	config.headers.authorization = window.sessionStorage.getItem('token');
	return config;
	
})
Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.component('treeTable',TreeTable)

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')
