<template>
	<div>
		<!-- 顶部面包屑 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 渲染角色列表 -->
		<el-card>
			<el-button type="primary" @click='addDialogVisible=true'>添加角色</el-button>
			<el-table :data="rolesList" border stripe>
				<el-table-column type="expand">
					<template v-slot="scope">
						<el-row v-for="(item,index) in scope.row.children" :key='item.id' :class="['bdBottom',index===0?'bdTop':'','alignCenter']">
							<el-col :span="5">
								<el-tag closable @close="removeById(scope.row,item.id)">{{item.authName}}</el-tag><i class="el-icon-caret-right"></i>
							</el-col>
							<el-col :span="19">
								<el-row v-for="(item2,index) in item.children" :key='item2.id' :class="[index===0?'':'bdTop','alignCenter']">
									<el-col :span="6">
										<el-tag type="success" closable @close="removeById(scope.row,item2.id)">{{item2.authName}}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<el-col :span="18">
										<el-tag type="warning" v-for="(item3,index) in item2.children" closable @close="removeById(scope.row,item3.id)">{{item3.authName}}</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<el-table-column type="index"></el-table-column>
				<el-table-column prop="roleName" label="角色名称"></el-table-column>
				<el-table-column prop="roleDesc" label="角色描述"></el-table-column>
				<el-table-column>
					<template v-slot="scoped">
						<el-button type="primary" icon="el-icon-edit" size="small" @click='showEditRoleDialog(scoped.row)'>编辑</el-button>
						<el-button type="primary" icon="el-icon-delete" size="small" @click='deleteRole(scoped.row.id)'>删除</el-button>
						<el-button type="primary" icon="el-icon-setting" size="small" @click='showRightsDialog(scoped.row)'>分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
		<!-- 添加角色 -->
		<el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%">
			<el-form>
				<el-form-item label="角色名称">
					<el-input v-model="editRole.roleName"></el-input>
				</el-form-item>
				<el-form-item label="角色描述">
					<el-input v-model="editRole.roleDesc"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click='addDialogVisible=false'>取 消</el-button>
				<el-button type="primary" @click='addRole'>确 定</el-button>
			</span>
		</el-dialog>
		<!-- 编辑角色对话框 -->
		<el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%">
			<el-form>
				<el-form-item label="角色名称">
					<el-input v-model="editRole.roleName"></el-input>
				</el-form-item>
				<el-form-item label="角色描述">
					<el-input v-model="editRole.roleDesc"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click='editRoleDialog'>确 定</el-button>
			</span>
		</el-dialog>

		<!-- 分配权限对话框 -->
		<el-dialog title="提示" :visible.sync="rightsDialogVisible" width="50%" @close="defKeys=[]">
			<el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"
			 ref='treeRef'>
			</el-tree>
			<span slot="footer" class="dialog-footer">
				<el-button @click="rightsDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click='authorization'>确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		created() {
			this.getRolesList();
		},
		data() {
			return {

				rolesList: [],
				rightsList: [],
				/* 添加角色 */
				addDialogVisible: false,
				//编辑权限对话框是否显示
				rightsDialogVisible: false,
				//编辑角色对话框是否显示
				editDialogVisible: false,
				editRoleId: '',
				editRole: {
					roleName: '',
					roleDesc: ''
				},
				//保存要授权的角色的id值
				tempRoleId: '',
				//分配角色的树形控件
				treeProps: {
					label: 'authName',
					children: 'children'
				},
				defKeys: []
			}
		},
		methods: {
			//获取角色列表
			async getRolesList() {
				const {
					data: res
				} = await this.$http.get(`/roles`);
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				this.rolesList = res.data;

			},
			//删除角色权限
			async deleteRights(role, rightsId) {
				const {
					data: res
				} = await this.$http.delete(`/roles/` + role.id + `/rights/` + rightsId);

				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.$message.success(res.meta.msg);
				role.children = res.data;

			},
			//删除角色权限
			removeById(role, rightsId) {
				this.$confirm('此操作将删除改权限, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
				}).then(() => {
					this.deleteRights(role, rightsId);


				}).catch(() => {
					this.$message.info('取消操作');
				})


			},
			//显示下拉框内容
			async showRightsDialog(role) {
				this.tempRoleId = role.id;
				const {
					data: res
				} = await this.$http.get(`rights/tree`);
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				this.rightsList = res.data;

				for (var i = 0; i < role.children.length; i++) {


					for (var j = 0; j < role.children[i].children.length; j++) {
						this.defKeys.push(role.children[i].children[j].id)
					}
				}

				this.rightsDialogVisible = true;


			},
			/* 给角色授权 */
			async authorization() {
				var checkedKeys = this.$refs.treeRef.getCheckedKeys();
				var halfCheckedKeys = this.$refs.treeRef.getHalfCheckedKeys();
				const arr = checkedKeys.concat(halfCheckedKeys);
				const idStr = arr.join(',')


				const {
					data: res
				} = await this.$http.post(`roles/` + this.tempRoleId + `/` + 'rights', {
					rids: idStr
				});
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.getRolesList();
				this.$message.success(res.meta.msg);
				this.rightsDialogVisible = false;

			},
			/* 显示编辑角色对话框 */
			showEditRoleDialog(role) {
				this.editRoleId = role.id;
				this.editRole.roleName = role.roleName;
				this.editRole.roleDesc = role.roleDesc;
				this.editDialogVisible = true;

			},
			/* 编辑 */
			async editRoleDialog() {
				const {
					data: res
				} = await this.$http.put(`roles/` + this.editRoleId ,this.editRole)
				
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.$message.success("修改成功");
				this.getRolesList();
				this.editDialogVisible = false;
			},
		/* 	删除角色 */
			async deleteRole(id){
				const {
					data: res
				} = await this.$http.delete(`roles/` +id)
				
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.$message.success(res.meta.msg);
				this.getRolesList();
				
			},
			/* 添加角色 */
			async addRole(){
				const {
					data: res
				} = await this.$http.post(`roles`,this.editRole)
				
				if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
				this.$message.success(res.meta.msg);
				this.getRolesList();
				this.addDialogVisible = false;
			}
		}

	}
</script>

<style scoped>
	.el-table {
		margin-top: 15px;
	}

	.el-tag {
		margin: 7px;
	}

	.el-row {
		margin: 7px 0px 7px 0px;
	}

	.el-col {
		margin: 7px 0px 7px 0px;
	}

	.bdTop {
		border-top: 1px solid rgb(235, 235, 235);
	}

	.bdBottom {
		border-bottom: 1px solid rgb(235, 235, 235);
	}

	.alignCenter {
		display: flex;
		align-items: center;
	}
</style>
