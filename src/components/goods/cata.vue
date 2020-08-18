<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片试图 -->
		<el-card>
			<!-- 添加分类 按钮-->
			<el-button type="primary" @click='showAddDialogVisible'>添加分类</el-button>
			<!-- 树形表格展示一级二级三级分类   按照columns规则展示定义在data中-->
			<tree-table :data='cataList' :columns='columns' :selection-type='false' :expand-type='false' show-index border class='treeTable'>
				<template v-slot:isok='scope'>
					<i class="el-icon-success" v-if="scope.row.cat_deleted==false" style="color: lightgreen;"></i>
					<i class="el-icon-error" v-else style='color: red;'></i>
				</template>
				<template v-slot:order='order'>
					<el-tag size="medium" v-if="order.row.cat_level===0">一级</el-tag>
					<el-tag size="medium" type="success" v-else-if="order.row.cat_level===1">二级</el-tag>
					<el-tag size="medium" type="warning" v-else="order.row.cat_level===3">三级</el-tag>
				</template>
				<template v-slot:opt='opt'>
					<el-button type="primary" icon="el-icon-edit" @click='showEditCateDialogVisible(opt.row)'>编辑</el-button>
					<el-button type="primary" icon="el-icon-delete" @click='deleteCate(opt.row)'>删除</el-button>
				</template>
			</tree-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			 :page-sizes="[1, 5, 10, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-card>

		<!-- 添加分类对话框 -->
		<el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="resetAddForm">
			<el-form label-width="100px" :rules="addFromRules" ref='addFormRef' :model="addForm">
				<el-form-item label="分类名称: " prop="cat_name">
					<el-input v-model="addForm.cat_name"></el-input>
				</el-form-item>
				<el-form-item label="父级分类:">
					<el-cascader v-model="selectCats" :options="parentCateList" :props="cascaderPorps" clearable @change="parentCateChange"></el-cascader>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 编辑分类对话框 -->
		<el-dialog title="编辑分类" :visible.sync='editCateDialogVisible' width="50%" @close="closeEditCate">
			<el-form>
				<el-form-item>
					<el-form-item label="分类名称: " prop="cat_name">
						<el-input v-model='editCateName.cate_name'></el-input>
					</el-form-item>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click='editCateDialogVisible=false'>取 消</el-button>
				<el-button type="primary" @click='EditCate'>确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				
				/* 每次加载页面获取分类的查询参数 */
				queryInfo: {
					type: 3,
					pagenum: 1,
					pagesize: 5
				},
				/* 获取的保存在这个数组中 */
				cataList: [],
				/* 分类的总数 */
				total: 0,
				/* tableTree的展示规则 */
				columns: [{
						label: '分类名称',
						prop: 'cat_name'

					},
					{
						label: '是否有效',
						type: 'template',
						template: 'isok'
					},
					{
						label: '排序',
						type: 'template',
						template: 'order'
					},
					{
						label: '操作',
						type: 'template',
						template: 'opt'
					}
				],
				/* 添加分类的对话框是否显示 */
				addDialogVisible: false,
				/* 添加分类的表当 */
				addForm: {
					cat_name: '',
					cat_pid: 0,
					cat_level: 0
				},
			/* 	添加分类的表单验证规则 */
				addFromRules: {
					cat_name: [{
							required: true,
							message: '请输入商品名称名称',
							trigger: 'blur'
						},

					]
				},
				/* 所有分类1 2级的分类存储在这*/
				parentCateList: [],
				/* 添加分类,选中的父级分类 */
				selectCats: [],
				/* 级联选择器的展示规则,展示parentCateList中的数据 */
				cascaderPorps: {
					value: 'cat_id',
					label: 'cat_name',
					children: 'children',
					expandTrigger: 'hover',
					checkStrictly: true
				},
				/* 编辑分类的对话框 */
				editCateDialogVisible: false,
				/* 当前选中的分类的id存储在这 */
				editCateIid: 0,
				/* 要修改的新名字存在这 */
				editCateName: {
					cate_name: '',
				}
			}
		},
		created() {
			/* 页面加载时获取分类数据 */
			this.getCateList()
		},
		methods: {
			/* 获取分类的axios方法 */
			async getCateList() {
				const {
					data: res
				} = await this.$http.get(`/categories`, {
					params: this.queryInfo
				});

				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.cataList = res.data.result;
				this.total = res.data.total;
			},
			/* 关于分页的条方法*/
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize;
				this.getCateList();
			},
			handleCurrentChange(newPage) {
				this.queryInfo.pagenum = newPage;
				this.getCateList()
			},
			/* 展示添加分类的对话框, */
			showAddDialogVisible() {
				this.getParentCateList()
				this.addDialogVisible = true;
			},
			/* 重置表单 */
			resetAddForm() {
				this.$refs.addFormRef.resetFields();
				this.addForm.cat_name = '',
					this.selectCats = [],
					this.addForm.cat_pid = 0,
					this.addForm.cat_level
			},
			/* 获取所有父级id */
			async getParentCateList() {
				const {
					data: res
				} = await this.$http.get(`/categories`, {
					params: {
						type: 2
					}
				});
				this.parentCateList = res.data;

			},
			/* 每当父级id改变时,将数据同步到addForm中 */
			parentCateChange() {
				if (this.selectCats.length > 0) {
					this.addForm.cat_pid = this.selectCats[this.selectCats.length - 1];
					this.addForm.cat_level = this.selectCats.length;
				}
			},
			/* 发送添加分类的请求 */
			async addCate() {
				const {
					data: res
				} = await this.$http.post(`/categories`, this.addForm);

				if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
				this.$message(res.meta.msg);

				this.getCateList();
				this.addDialogVisible = false;
			},
			
			/* 展示编辑分类的对话框 */
			showEditCateDialogVisible(cat) {;
				this.editCateDialogVisible = true;
				this.editCateIid = cat.cat_id;
				this.editCateName.cate_name = cat.cat_name;
			},
			/* 发送修改分类的请求 */
			async EditCate() {
				const {
					data: res
				} = await this.$http.put(`/categories/` + this.editCateIid, {
					cat_name: this.editCateName.cate_name
				});

				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.$message.success(res.meta.msg);
				this.getCateList()
				this.editCateDialogVisible = false;
			},
			/* 关闭对话框,重置刚才输入的名称 */
			closeEditCate() {
				this.editCateName.cate_name = ''
			},
			
		/* 	删除分类 */
			deleteCate(cate) {
				this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(async () => {
					const {
						data: res
					} = await this.$http.delete('/categories/' + cate.cat_id);
					this.$message({
						type: 'success',
						message: res.meta.msg,
					});
					this.getCateList()
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			}
		}
	}
</script>

<style scoped>
	.treeTable {
		margin-top: 15px;
	}
</style>
