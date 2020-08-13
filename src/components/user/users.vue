<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card class="box-card">
			<el-row :gutter="20">
				<el-col :span="10">
					<el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUsers">
						<el-button slot="append" icon="el-icon-search" @click='getUsers'></el-button>
					</el-input>
				</el-col>
				<el-col :span="5">
					<el-button type="primary" @click='dialogVisible=true'>添加用户</el-button>
				</el-col>
			</el-row>
			<el-table :data="users" style="width: 100%" stripe border>
				<el-table-column type="index"></el-table-column>
				<el-table-column prop="username" label="姓名" width="180">
				</el-table-column>
				<el-table-column prop="email" label="邮箱" width="180">
				</el-table-column>
				<el-table-column prop="mobile" label="电话">
				</el-table-column>
				<el-table-column prop="role_name" label="角色">
				</el-table-column>
				<el-table-column label="状态">
					<template v-slot="scope">
						<el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
						</el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180px">
					<template v-slot="scope">
						<!-- 修改用户 -->
						<el-button type="primary" icon="el-icon-edit" size="mini" @click='getUserById(scope.row.id)'></el-button>
						<!-- 删除用户 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" @click='deleteUser(scope.row.id)'></el-button>
						<!-- 角色权限分配 -->
						<el-tooltip class="item" effect="dark" content="分配角色" placement="top-start" :enterable='false'>
							<el-button type="warning" icon="el-icon-setting" size="mini" @click='allotUser(scope.row)' ></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			 :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-card>

		<!-- 添加用户的对话框 -->
		<el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dialogClose">
			<el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password" type="password"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email" type='email'></el-input>
				</el-form-item>
				<el-form-item label="电话" prop="mobile">
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 修改用户的对话框 -->
		<el-dialog title="修改用户" :visible.sync="editialogVisible" width="50%">
			<el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="editForm.username" disabled></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email" type='email'></el-input>
				</el-form-item>
				<el-form-item label="电话" prop="mobile">
					<el-input v-model="editForm.mobile"></el-input>
					<el-input v-model="editForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="updataUser">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 分配角色权限对话框 -->
		<el-dialog title="提示" :visible.sync="allotUserDialogVisible" width="30%">
			<p>当前的用户:{{user.username}}</p>
			<p>当前的角色:{{user.role_name}}</p>
			
		<!-- 	权限下拉框 -->
			<p>
				<el-select v-model="selectRoleId" placeholder="请选择">
				    <el-option
				      v-for="item in roles"
				      :key="item.id"
				      :value="item.id"
					  :label="item.roleName"
				     >
				    </el-option>
				  </el-select>
			</p>
			<span slot="footer" class="dialog-footer">
				<el-button @click="allotUserDialogVisible= false">取 消</el-button>
				<el-button type="primary" @click="editRole" >确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				/* 查询用户的参数 */
				queryInfo: {
					query: '',
					pagenum: 1,
					pagesize: 10
				},
				/* 响应的用户数据 */
				users: [],
				total: 0,
				/* 对话框是否显示 */
				dialogVisible: false,
				editialogVisible: false,
				allotUserDialogVisible:false,
				user:{},
				roles:[],
				selectRoleId:'',
				/* 添加用户 */
				addForm: {
					username: '',
					password: '',
					email: '',
					mobile: ''
				},
				/* 编辑用户 */
				editForm: {
					id: 0,
					username: '',
					email: '',
					mobile: ''
				},
				/* 校验规则 */
				rules: {
					username: [{
							required: true,
							message: '请输入用户名称',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 10,
							message: '长度在 3 到 10 个字符',
							trigger: 'blur'
						}
					],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							min: 5,
							max: 15,
							message: '长度在 3 到 10 个字符',
							trigger: 'blur'
						}
					],
					email: [{
						required: true,
						message: '请输入邮箱',
						trigger: 'blur',

					}],
					mobile: [{
						required: true,
						message: '请输入电话',
						trigger: 'blur',
					}, {
						min: 11,
						max: 11,
						message: '请输入11位数的电话号码',
						trigger: 'blur'
					}]
				}
			}
		},
		/* 页面加载马上发送请求 */
		created() {
			this.getUsers()
		},
		methods: {
			/* 获取用户列表 */
			async getUsers() {
				const {
					data: res
				} = await this.$http.get('/users', {
					params: this.queryInfo
				});

			
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				this.users = res.data.users;
				this.total = res.data.total
			},
			/* 监听分页栏的变化 */
			handleSizeChange(val) {
				this.queryInfo.pagesize = val;
				this.getUsers();
			},
			handleCurrentChange(val) {
				this.queryInfo.pagenum = val;
				this.getUsers();
			},

			/* 分页栏改变,马上重新获取数据 */
			async userStateChanged(user) {
				const {
					data: res
				} = await this.$http.put(`users/${user.id}/state/${user.mg_state}`);
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.$message.success(res.meta.msg);

			},
			/* 关闭对话框,马上重置对话框的内容 */
			dialogClose() {
				this.$refs.addFormRef.resetFields()
			},
			/* 添加用户 */
			addUser() {
				this.$refs.addFormRef.validate(async valid => {
					if (!valid) return this.$message.error('表单验证不通过');
					const {
						data: res
					} = await this.$http.post('/users', this.addForm);
				
					if (res.meta.status !== 201) return this.$message.error(res.meta.msg);

					this.$message.success(res.meta.msg);
					this.dialogVisible = false;
					this.getUsers();
				})
			},
			/* 通过id查询用户 */
			async getUserById(id) {
				this.editialogVisible = true
				const {
					data: res
				} = await this.$http.get(`/users/${id}`);
				this.editForm.id = id;
				this.editForm.username = res.data.username;
				this.editForm.email = res.data.email;
				this.editForm.mobile = res.data.mobile;

				
			},
			/* 修改用户信息 */
			updataUser() {
				this.$refs.editFormRef.validate(async valid => {
					if (!valid) return this.$message.error('表单验证不通过');
					const {
						data: res
					} = await this.$http.put('/users/' + this.editForm.id, {
						email: this.editForm.email,
						mobile: this.editForm.mobile
					});

					if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

					this.$message.success(res.meta.msg);
					this.editialogVisible = false;
					this.getUsers();
				})
			},
			/* 删除用户 */
			deleteUser(id) {
				this.$confirm('确定删除该用户?', '删除用户', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(async () => {
					const {
						data: res
					} = await this.$http.delete('/users/' + id);

					if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
					this.$message.success('刪除成功')
					this.getUsers();
				}).catch(() => {
					this.$message.info('已取消刪除')
				})
			},
			/* 获取角色 列表*/
			async getRoles(){
				const {
					data: res
				} = await this.$http.get('/roles' );
				
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.roles = res.data;
			},
			/* 点击角色分配的时候触发该函数,获取角色列表 */
			allotUser(user){
				this.user = user;
				this.getRoles();
				this.allotUserDialogVisible = true;
			
			},
			
			/* 对话框点击确认时候,发送异步请求,保存数据 */
			async editRole(){
		
				const {
					data: res
				} = await this.$http.put(`users/`+this.user.id+`/role`,{rid:this.selectRoleId});
				
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.allotUserDialogVisible=false;
				this.$message.success(res.meta.msg);
				this.getUsers();
				
			}
		}

	}
</script>

<style scoped>
	.el-table {
		margin-top: 15px;
		font-size: 12px;
	}

	.el-pagination {
		margin-top: 15px;
	}
</style>
