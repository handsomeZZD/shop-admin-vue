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
						<el-tooltip class="item" effect="dark" content="分配角色" placement="top-start" :enterable='false'>
							<el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
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
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="updataUser">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 删除弹框 -->
	</div>
</template>

<script>
	export default {
		data() {
			return {
				queryInfo: {
					query: '',
					pagenum: 1,
					pagesize: 10
				},
				users: [],
				total: 0,
				dialogVisible: false,
				editialogVisible: false,
				addForm: {
					username: '',
					password: '',
					email: '',
					mobile: ''
				},
				editForm: {
					id: 0,
					username: '',
					email: '',
					mobile: ''
				},
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
		created() {
			this.getUsers()
		},
		methods: {
			async getUsers() {
				const {
					data: res
				} = await this.$http.get('/users', {
					params: this.queryInfo
				});

				console.log(res)
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				this.users = res.data.users;
				this.total = res.data.total
			},
			handleSizeChange(val) {
				this.queryInfo.pagesize = val;
				this.getUsers();
			},
			handleCurrentChange(val) {
				this.queryInfo.pagenum = val;
				this.getUsers();
			},
			async userStateChanged(user) {
				const {
					data: res
				} = await this.$http.put(`users/${user.id}/state/${user.mg_state}`);
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.$message.success(res.meta.msg);

			},
			dialogClose() {
				this.$refs.addFormRef.resetFields()
			},
			addUser() {
				this.$refs.addFormRef.validate(async valid => {
					if (!valid) return this.$message.error('表单验证不通过');
					const {
						data: res
					} = await this.$http.post('/users', this.addForm);
					console.log(res);
					if (res.meta.status !== 201) return this.$message.error(res.meta.msg);

					this.$message.success(res.meta.msg);
					this.dialogVisible = false;
					this.getUsers();
				})
			},
			async getUserById(id) {
				this.editialogVisible = true
				const {
					data: res
				} = await this.$http.get(`/users/${id}`);
				this.editForm.id = id;
				this.editForm.username = res.data.username;
				this.editForm.email = res.data.email;
				this.editForm.mobile = res.data.mobile;

				console.log(res)
			},
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
			deleteUser(id) {
				this.$confirm('确定删除该用户?', '删除用户', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(async () => {
					const {
						data: res
					} = await this.$http.delete('/users/'+id);
					
					if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
					this.$message.success('刪除成功')
					this.getUsers();
				}).catch(() => {
					this.$message.info('已取消刪除')
				})
			}
		}

	}
</script>

<style>
	.el-table {
		margin-top: 15px;
		font-size: 12px;
	}

	.el-pagination {
		margin-top: 15px;
	}
</style>
