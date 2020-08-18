<template>
	<div>
		<!-- 头部面包屑 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>参数管理</el-breadcrumb-item>
			<el-breadcrumb-item>参数列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<!-- 顶部提示 -->
			<el-alert title="注意:只允许为第三级分类设置相关参数!" type="warning" :closable="false" show-icon></el-alert>
			<el-row class="cat_opt">
				<el-col :span="3">请选择商品分类: </el-col>
				<el-col :span="5">
					<el-cascader v-model="selectCats" :options="cateList" :props="cascaderPorps" @change="handleChange"></el-cascader>
				</el-col>
			</el-row>
			<!-- 标签页展示数据 -->
			<el-tabs v-model="activeName" @tab-click="handleChange">
				<!-- 展示动态参数 -->
				<el-tab-pane label="动态参数" name="many" :disabled="selectCats.length!==3">
					<!-- 添加参数按钮 -->
					<el-button type="primary" :disabled="selectCats.length!==3" @click='addParamsDialogVisible = true'>添加参数</el-button>
					<!-- 展示已有的参数 -->
					<el-table :data="manyTableData" border stripe class="tableDate">
						<!-- 展开栏用于设置参数的标签-->
						<el-table-column type="expand">
							<template v-slot="scoped">
								<el-tag v-for="(item,index) in scoped.row.attr_vals" :key='index' closable @close="tagClose(index,scoped.row)">{{item}}</el-tag>
								<el-input class="input-new-tag" v-if="scoped.row.inputVisible" v-model="scoped.row.inputValue" ref="saveTagInput"
								 size="small" @keyup.enter.native="handleInputConfirm(scoped.row)" @blur="handleInputConfirm(scoped.row)">
								</el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scoped.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column type="index"></el-table-column>
						<el-table-column label="参数名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template v-slot="scoped">
								<el-button type="primary" icon="el-icon-edit" @click='showEditParamsDialogVisible(scoped.row.attr_id)'>修改</el-button>
								<el-button type="danger" icon="el-icon-delete" @click='deleteParams(scoped.row)'>删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
				<el-tab-pane label="静态属性" name="only" :disabled="selectCats.length!==3">
					<el-button type="primary" :disabled="selectCats.length!==3" @click='addParamsDialogVisible = true'>添加属性</el-button>、
					<!-- 展示静态属性-->
					<el-table :data="onlyTableData" border stripe class="tableDate">
							<!-- 展示已有的属性 -->
						<el-table-column type="expand">
							<template v-slot="scoped">
								<el-tag v-for="(item,index) in scoped.row.attr_vals" :key='index' closable @close="tagClose(index,scoped.row)">{{item}}</el-tag>
								<el-input class="input-new-tag" v-if="scoped.row.inputVisible" v-model="scoped.row.inputValue" ref="saveTagInput"
								 size="small" @keyup.enter.native="handleInputConfirm(scoped.row)" @blur="handleInputConfirm(scoped.row)">
								</el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scoped.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column type="index"></el-table-column>
						<el-table-column label="属性名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template v-slot="scoped">
								<el-button type="primary" icon="el-icon-edit" @click='showEditParamsDialogVisible(scoped.row.attr_id)'>修改</el-button>
								<el-button type="danger" icon="el-icon-delete" @click='deleteParams(scoped.row)'>删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>

			</el-tabs>
		</el-card>
		<!-- 添加参数对话框 -->
		<el-dialog :title="'添加'+titleContext" :visible.sync="addParamsDialogVisible" width="50%" @close="addParamsClose">
			<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref='addFormRef'>
				<el-form-item :label="titleContext" prop="attr_name">
					<el-input v-model="addForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addParamsDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addParams">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 修改参数对话框 -->
		<el-dialog title="修改参数" :visible.sync="editParamsDialogVisible" width="50%" @close="addParamsClose">
			<el-form :model="editForm" label-width="100px" :rules="addFormRules" ref='addFormRef'>
				<el-form-item :label="titleContext" prop="attr_name">
					<el-input v-model="editForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editParamsDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click='editParams'>确 定</el-button>
			</span>
		</el-dialog>


	</div>
</template>

<script>
	export default {
		/* 页面刷新时获取分类数据 */
		created() {
			this.getCateList();
		},
		data() {
			return {
				/* 分类列表 */
				cateList: [],
				/* 级联选择保存的位置 */
				selectCats: [],
				/* 级联选择器配置 */
				cascaderPorps: {
					value: 'cat_id',
					label: 'cat_name',
					children: 'children',
					expandTrigger: 'hover',

				},
				/*当前激活的标签页 */
				activeName: 'many',
				/* 动态参数 */
				manyTableData: [],
				/* 静态属性*/
				onlyTableData: [],
				/* 添加参数对话框是否显示 */
				addParamsDialogVisible: false,
				/* 添加参数表单 */
				addForm: {
					attr_name: ''
				},
				/* 表单验证 */
				addFormRules: {
					attr_name: [{
						required: true,
						message: '请输入参数名称',
						tigger: 'blur'
					}]
				},
				/* 编辑参数对话框 */
				editParamsDialogVisible: false,
				editForm: {},



			}
		},
		methods: {
			/* 获取分类数据 */
			async getCateList() {

				const {
					data: res
				} = await this.$http.get(`/categories`);

				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				this.cateList = res.data;
				this.total = res.data.total;

			},
			/* 获取参数数据 */
			handleChange() {
				this.getParamsData()
			},
			/* 获取参数数据 */
			async getParamsData() {
				if(this.selectCats.length!==3){
					this.selectCats=[];
					this.manyTableData=[];
					this.onlyTableData=[];
					return this.$message.warning('只能选择三级分类！');
				}
				const {
					data: res
				} = await this.$http.get(`/categories/` + this.cateId + `/attributes`, {
					params: {
						sel: this.activeName
					}
				});

				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				/* 将attr_vals转成数组用于渲染标签 */
				res.data.forEach((item) => {
					item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
					item.inputVisible = false;
					item.inputValue = '';
				});

				if (this.activeName === 'many') {
					this.manyTableData = res.data;
				} else {
					this.onlyTableData = res.data;
				}

			},
			/* 添加对话框关闭时 */
			addParamsClose() {
				this.addForm.attr_name = '';
				this.$refs.addFormRef.resetFields();
			},
			/* 发送添加参数请求 */
			addParams() {
				this.$refs.addFormRef.validate(async (valid) => {
					if (!valid) {
						return
					}
					const {
						data: res
					} = await this.$http.post(`/categories/` + this.cateId + `/attributes`, {
						attr_name: this.addForm.attr_name,
						attr_sel: this.activeName
					});

					if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
					this.$message.success(res.meta.msg);

					this.getParamsData();
					this.addParamsDialogVisible = false;
				})
			},
			/* 设置参数 */
			editParams() {

				this.$refs.addFormRef.validate(async (valid) => {
					if (!valid) {
						return
					}
					const {
						data: res
					} = await this.$http.put(`/categories/` + this.cateId + `/attributes/` + this.editForm.attr_id, this.editForm);

					if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
					this.$message.success(res.meta.msg);

					this.getParamsData();
					this.editParamsDialogVisible = false;
				})
			},
			/* 显示设置对话框 */
			async showEditParamsDialogVisible(attr_id) {
				const {
					data: res
				} = await this.$http.get(`/categories/` + this.cateId + `/attributes/` + attr_id, {
					params: {
						attr_sel: this.activeName
					}
				});

				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.editForm = res.data;
				this.editParamsDialogVisible = true;
			},
			/* 删除参数 */
			deleteParams(row) {
				this.$confirm('删除' + row.attr_name + ', 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(async () => {
					const {
						data: res
					} = await this.$http.delete(`/categories/` + this.cateId + `/attributes/` + row.attr_id);
					if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
					this.getParamsData();
					this.$message.success(res.meta.msg);

				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			},
			
			/* 创建新标签 */
			async handleInputConfirm(row) {
				if (row.inputValue.trim().length === 0) {
					row.inputValue = '';
					row.inputVisible = false;
					return;
				}

				row.attr_vals.push(row.inputValue);
				row.inputValue = '';
				row.inputVisible = false;

				const {
					data: res
				} = await this.$http.put(`/categories/` + this.cateId + `/attributes/` + row.attr_id, {

					attr_name: row.attr_name,
					attr_sel: row.attr_sel,
					attr_vals: row.attr_vals.join(' ')
				});
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				this.$message.success(res.meta.msg);
			},
			
			/* 将标签转换成输入框 */
			showInput(row) {
				row.inputVisible = true;
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus();
				});
			},
			/* 删除标签 */
			async tagClose(index,row){
				row.attr_vals.splice(index,1);
				const {
					data: res
				} = await this.$http.put(`/categories/` + this.cateId + `/attributes/` + row.attr_id, {
				
					attr_name: row.attr_name,
					attr_sel: row.attr_sel,
					attr_vals: row.attr_vals.join(' ')
				});
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				
				this.$message.success(res.meta.msg);
			}
		},
		computed: {
			/* 保存当前所操作的第三级id */
			cateId() {
				if (this.selectCats.length === 3) {
					return this.selectCats[2];
				}
				return null;
			},
			/* 设置title 复用对话框 */
			titleContext() {
				if (this.activeName === 'many') {
					return '动态参数'
				} else {
					return '静态属性'
				}
			}
		}
	}
</script>

<style scoped>
	.cat_opt {
		margin: 15px 0;
		text-align: center;
		display: flex;
		align-items: center;
		font-size: 18px;
	}

	.tableDate {
		margin: 15px 0;
	}

	.el-tag {
		margin: 5px;
	}

	.input-new-tag {
		width: 110px;
	}
</style>
