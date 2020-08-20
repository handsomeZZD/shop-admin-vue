<template>
	<div>
		<!-- 头部面包屑 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>添加商品</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<!-- 步骤条 -->
			<el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
			<el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
				<el-step title="基本信息"></el-step>
				<el-step title="商品参数"></el-step>
				<el-step title="商品属性"></el-step>
				<el-step title="商品图片"></el-step>
				<el-step title="商品内容"></el-step>
				<el-step title="完成"></el-step>
			</el-steps>
			<!-- 标签页  放置在左边-->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
				<el-tabs tab-position="left" v-model="activeIndex" :before-leave='beforeTagLeave' @tab-click="tabClicked">
					<el-tab-pane label="基本信息" name='0'>
						<el-form-item label="商品名称" prop="goods_name">
							<el-input v-model="addForm.goods_name"></el-input>
						</el-form-item>
						<el-form-item label="商品价格" prop="goods_price">
							<el-input v-model="addForm.goods_price" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品重量" prop="goods_weight">
							<el-input v-model="addForm.goods_weight" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品数量" prop="goods_number">
							<el-input v-model="addForm.goods_number" type="number"></el-input>
						</el-form-item>
						<el-form-item label="分类" prop="goods_cat">
							<el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品参数" name='1'>
						<el-form-item v-for='item in manyTableData' :label="item.attr_name" :key='item.attr_id'>
							<!-- 复选框 -->
							<el-checkbox-group v-model="item.attr_vals">
								<el-checkbox :label="cb" v-for='(cb,i) in item.attr_vals' :key='i' border></el-checkbox>
							</el-checkbox-group>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品属性" name='2'>
						<el-form-item v-for="item in onlyTableData" :label="item.attr_name" :key='item.attr_id'>
							<el-input v-model="item.attr_vals"></el-input>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品图片" name='3'>
						<el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj"
						 :on-success="handleSuccess">
							<el-button size="small" type="primary">点击上传</el-button>
						</el-upload>
					</el-tab-pane>
					<el-tab-pane label="商品内容" name='4'>
						<quill-editor v-model='addForm.goods_introduce'></quill-editor>
						<el-button type="primary" @click='add()'>添加商品</el-button>
					</el-tab-pane>
				</el-tabs>
			</el-form>
		</el-card>
		
		<!-- 图片预览的对话框 -->
		<el-dialog title="图片预览" :visible.sync="preViewDialogVisible" width="50%">
			<img :src="previewPath" class="previewImg" />
		</el-dialog>
	</div>
</template>

<script>
	export default {
		created() {
			this.getCateList()
		},
		data() {
			return {
				/* 分类列表 */
				cateList: [],
				/* 标签页激活 */
				activeIndex: '0',
				/* 判断标签1,2 页是否点击过 如果未点击需要点击才能进行后面的操作 */
				activeIndexOne: false,
				activeIndexTwo: false,
				/* 商品添加的参数 表单 */
				addForm: {
					goods_name: '',
					goods_price: 0,
					goods_weight: 0,
					goods_number: 0,
					goods_cat: '',
					goods_introduce: '',
					pics: [],
					attrs: []
				},
				/* 表单验证 */
				addFormRules: {
					goods_name: [{
						required: true,
						message: '请输入商品名称',
						trigger: 'blur'
					}, {
						max: 50,
						message: '商品名字长度不能大于50'
					}],
					goods_price: [{
						required: true,
						message: '请输入商品价格',
						trigger: 'blur',

					}],
					goods_weight: [{
						required: true,
						message: '请输入商品重量',
						trigger: 'blur',

					}],
					goods_number: [{
						required: true,
						message: '请输入商品数量',
						trigger: 'blur',

					}],
					goods_cat: [{
						required: true,
						message: '请选择商品分类',
						trigger: 'blur',
					}]
				},
				/* 级联选择器 */
				cateProps: {
					expandTrigger: 'hover',
					label: 'cat_name',
					value: 'cat_id'
				},
				/* 动态参数 */
				manyTableData: [],
				/* 静态参数 */
				onlyTableData: [],
				/* 图片上传地址 */
				uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
				/* 图片上传的请求头 */
				headersObj: {
					authorization: window.sessionStorage.getItem('token')
				},
				/* 图片的路径 */
				previewPath: '',
				/* 预览对话框 */
				preViewDialogVisible: false

			}
		},
		methods: {
			/* 获取分类 */
			async getCateList() {

				const {
					data: res
				} = await this.$http.get(`/categories`);

				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				this.cateList = res.data;

			},
			/* 级联选择器改变时触发的函数 */
			handleChange() {
				if (this.addForm.goods_cat.length !== 3) {
					this.addForm.goods_cat = []
				}
			},
			/* 标签页变化时触发的函数 */
			beforeTagLeave(activeName, oldActiveName) {
				if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
					this.$message.error('请选择商品分类');
					return false;
				}
				if (activeName === '4' && this && !this.activeIndexOne && !this.activeIndexTwo) {
					this.$message.error('请先填写商品参数和商品属性');
					return false;
				}

			},
			/* 点击标签页时触发的函数 */
			async tabClicked() {
				if (this.activeIndex === '1') {
					const {
						data: res
					} = await this.$http.get('categories/' + this.catId + '/attributes', {
						params: {
							sel: 'many'
						}
					})
					if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
					res.data.forEach((item, index) => {
						item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
					})
					this.manyTableData = res.data
					this.activeIndexOne = true;
					return;
				}
				if (this.activeIndex === '2') {
					const {
						data: res
					} = await this.$http.get('categories/' + this.catId + '/attributes', {
						params: {
							sel: 'only'
						}
					})
					if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

					this.onlyTableData = res.data;
					this.activeIndexTwo = true;
					return;
				}



			},
			/* 图片预览 */
			handlePreview(file) {
				this.preViewDialogVisible = true;
				this.previewPath = file.response.data.url;

			},
			/* 图片删除 */
			handleRemove(file) {

				const filePath = file.response.data.tmp_path;
				const i = this.addForm.pics.findIndex(x =>
					filePath === x.pic
				);
				this.addForm.pics.splice(i, 1);
			},
			/* 图片上传成功 */
			handleSuccess(res) {
				const picInfo = {
					pic: res.tmp_path
				};
				this.addForm.pics.push(picInfo);

			},
			/* 添加商品 */
			add() {
				//1.验证表单
				this.$refs.addFormRef.validate(async  vali => {
					if (!vali) {
						return this.$message.error('请填写必要的表单项')
					}
					//由于原有表单项与要提交的表单不符合 深拷贝的表单再进行操作
					var form = JSON.parse(JSON.stringify(this.addForm));
					form.goods_cat = form.goods_cat.join(',');
					//添加静态属性
					this.onlyTableData.forEach(item => {
						const newInfo = {
							attr_id: item.attr_id,
							attr_value: item.attr_vals
						}
						form.attrs.push(newInfo);
					})

					//添加动态参数
					this.manyTableData.forEach(item => {
					
						const newInfo = {
							attr_id: item.attr_id,
							attr_value: item.attr_vals
						}
						form.attrs.push(newInfo);
					})

					/* 提交标签,成功则跳转页面 */
					const {
						data: res
					} = await this.$http.post('/goods', form);
					
					if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
					this.$message.success(res.meta.msg);
					this.$refs.addFormRef.resetFields();
					this.addForm.goods_introduce = '';
					this.$router.push('/goods')
				})
			}

		},
		computed: {
			
			/* 第三级商品的id */
			catId() {
				if (this.addForm.goods_cat.length === 3) {
					return this.addForm.goods_cat[2]
				}
				return null;
			}
		}
	}
</script>

<style scoped>
	.el-steps {
		margin: 15px 0px;
	}

	.el-checkbox {
		margin: 10px;
	}

	.previewImg {
		width: 100%;
	}

	.el-button {
		margin: 15px 0px;
	}
</style>
