<template>
	<el-container class='home_container'>
		<!-- 头部 -->
		<el-header>
			<div>
				<span class="el-icon-s-home"></span>
				<span>电商后台管理系统</span>
			</div>
			<el-button type='info' @click='exit'>退出</el-button>
		</el-header>
		<!-- 主体部分 -->
		<el-container>
			<el-aside :width="isCollapse?'64px':'200px'">
				<!-- 头部按钮，可展开或者关闭导航栏 -->
				<div class="toggle_button" @click="toggleCollapse"><span :class="isCollapse?'el-icon-open':'el-icon-turn-off'"></span></div>
				<el-menu id="el-menu" background-color="#545c64" text-color="#fff" active-text-color="green" unique-opened
				 :collapse='isCollapse' :collapse-transition='false' router :default-active="activePath">
				 <!-- 一级菜单栏 -->
					<el-submenu :index='item.id+""' v-for="item in menus" :key=item.id>
						<template slot="title">
							<i :class="iconList[item.id]"></i>
							<span>{{item.authName}}</span>
						</template>
						<!-- 二级菜单栏 -->
						<el-menu-item :index='"/"+secitem.path' v-for="secitem in item.children" :key='secitem.id' @click='saveNavState("/"+secitem.path)'>
							<template slot="title">
								<i class="el-icon-menu"></i>
								<span>{{secitem.authName}}</span>
							</template></el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<el-main><router-view></router-view></el-main>
		</el-container>
	</el-container>
</template>

<script>
	export default {
		data() {
			return {
				/* 从后台获取的菜单数据 */
				menus: [],
				/* 每个菜单栏对应的图标 */
				iconList: {
					'125': 'el-icon-user-solid',
					'103': 'el-icon-s-platform',
					'101': 'el-icon-goods',
					'102': 'el-icon-s-order',
					'145': 'el-icon-s-data'

				},
				/* 当前菜单栏状态 */
				isCollapse: false,
				/* 当前被激活的组件名字 */
				activePath : ''
			}
		},
		created() {
			/* 发送异步请求数据 */
			this.getMenus();
			/* 保存当前激活的组件,即使页面刷新也能快速定位 */
			this.activePath = window.sessionStorage.getItem('navState')
		},
		methods: {
			/* 退出登录 */
			exit() {
				window.sessionStorage.clear();
				this.$router.push('/login');
			},
		/* 	异步axios请求 */
			async getMenus() {
				const {
					data: data
				} = await this.$http.get('/menus');
				if (data.meta.status !== 200) return this.$message.error(data.meta.message);
				this.menus = data.data;
			},
			/* 切换菜单栏信息 */
			toggleCollapse() {
				this.isCollapse = !this.isCollapse
			},
		/* 	保存菜单栏状态 */
			saveNavState(e){
				window.sessionStorage.setItem('navState',e),
				this.activePath = e;
			}
		}
	}
</script>

<style>
	.home_container {
		width: 100%;
		height: 100%;
	}

	.el-header {
		background-color: #333333;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: white;
		font-size: 20px;
		letter-spacing: ;
	}

	.el-aside {
		background-color: rgb(84, 92, 100);

	}

	#el-menu {
		border-right: 0;
	}

	.el-main {
		background-color: #F0FFF0;
	}

	.toggle_button {
		font-size: 30px;
		text-align: center;
	}
</style>
