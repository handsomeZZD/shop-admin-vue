<template>
	<div class="login_Container">
		<div class="login_box">
			<!-- 头部logo图片 -->
			<img src="../assets/images/Login-log.jpg">
			<!-- 登录表单 -->
			<el-form label-width="70px" class="login_form" :model="loginForm" :rules="loginRules" ref='loginFormRef'>
				<el-form-item label="用户名" prop="username">
					<el-input prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type='password'></el-input>
				</el-form-item>
				<el-form-item class="btn_login">
					<el-button type="primary" @click='checkLoginForm'>登录</el-button>
					<el-button type="info" @click='resetLoginForm'>重置</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				/* 表单信息 */
				loginForm: {
					username: "admin",
					password: "123456"
				},
				/* 表单验证 */
				loginRules: {
					username: [{
							required: true,
							message: '请输入用户名',
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
							message: '请输入登录密码',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 10,
							message: '长度在 3 到 15 个字符',
							trigger: 'blur'
						}
					],
					
				}
			}
		},
		methods: {
			/* 重置表单 */
			resetLoginForm() {
				this.$refs.loginFormRef.resetFields()
			},
			/* 登录验证 */
			checkLoginForm() {

				this.$refs.loginFormRef.validate(async(valid) => {
					if (valid) {
					const {data:data}  = await	this.$http.post('login', this.loginForm)
						if(data.meta.status!==200) return this.$message.error("登录失败");
						this.$message.success("登录成功");
						window.sessionStorage.setItem('token',data.data.token);
						this.$router.push('/home');
					}
				})
			}
		}
	}
</script>

<style scoped="scoped">
	.login_Container {
		height: 100%;
		background-color: white;
	}

	.login_box {
		height: 50%;
		background-color: honeydew;
		width: 30%;
		position: absolute;
		left: 35%;
		top: 25%;

	}

	.login_box img {
		transform: translate(200%, -70%);
		width: 20%;
		border-radius: 50%;
		background-color: #909399;
	}

	.login_form {
		padding: 10%;
		transform: translateY(-30%);
	}

	.btn_login {}
</style>
