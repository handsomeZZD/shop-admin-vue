import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/login.vue'
import home from '../components/home.vue'
import welcome from '../components/welcome.vue'
import users from '../components/user/users.vue'
import rights from '../components/power/rights.vue'
import roles from '../components/power/roles.vue'
Vue.use(VueRouter);


const router = new VueRouter({
	routes: [{
			path: '/',
			redirect: '/login'
		},
		{
			path: '/login',
			component: login
		},
		{
			path: '/home',
			component: home,
			redirect: '/welcome',
			children: [{
				path: '/welcome',
				component: welcome,
			}, {
				path: '/users',
				component: users
			},{
				path:'/rights',
				component:rights
			},{
				path:'/roles',
				component:roles
			}]
		},

	]

});

router.beforeEach((to, from, next) => {
	if (to.path === '/login') return next();

	const token = window.sessionStorage.getItem('token');
	if (token == null || token.length == 0) return next('/login');
	next();
})

export default router
