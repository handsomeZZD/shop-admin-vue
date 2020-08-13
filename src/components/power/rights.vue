<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理管理</el-breadcrumb-item>
			<el-breadcrumb-item>权限列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 展示权限列表-->
		<el-card>
			<el-table :data="rightsList" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column prop="authName" label="权限名称"></el-table-column>
				<el-table-column prop="path" label="路径"></el-table-column>
				<el-table-column label="权限等级">
					<template v-slot="scope">
						<el-tag :type="levelTag[scope.row.level]">{{(Number(scope.row.level)+1)+'级'}}</el-tag>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
	</div>
</template>

<script>
	export default{
		created() {
			this.getRightsList();
		},
		
		data(){
			return{
				rightsList: [],
				levelTag:{
					'0':'',
					'1':'succes',
					'2':'info',
					'3':'warning',
					'4':'danger'
				}
			}
		},
		methods:{
			async getRightsList(){
				const {
					data: res
				} = await this.$http.get(`rights/list`);
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				
				this.rightsList = res.data;
				
				/* this.$message.success(res.meta.msg); */
				
			}
		}
	}
</script>

<style scoped>
</style>
