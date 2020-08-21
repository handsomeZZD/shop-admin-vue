<template>
	<div>
		<!-- 头部面包屑 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>订单管理</el-breadcrumb-item>
			<el-breadcrumb-item>订单列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-row>
				<el-col :span="8">
					<el-input placeholder="请输入内容" class="input-with-select">
						<el-button slot="append" icon="el-icon-search"></el-button>
					</el-input>
				</el-col>
			</el-row>
			<!-- 订单列表数据 -->
			<el-table border stripe :data="orderList">
				<el-table-column type="index"></el-table-column>
				<el-table-column label="订单编号" prop="order_number"></el-table-column>
				<el-table-column label="订单价格" prop="order_price"></el-table-column>
				<el-table-column label="是否付款">
					<template v-slot="scoped">
						<el-tag v-if="scoped.row.pay_status==='1'" type="success">已付款</el-tag>
						<el-tag v-else type="danger">未付款</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="是否发货" prop="is_send"></el-table-column>
				<el-table-column label="下单时间">
					<template v-slot="scoped">
						{{formatTime(scoped.row.create_time)}}
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template v-slot="scoped">
						<el-button icon="el-icon-edit" type="primary" size="mini"></el-button>
						<el-button icon="el-icon-location" type="success" size="mini" @click='showProgress(scoped.row.order_id)'></el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			 :page-sizes="[5, 10, 30, 100]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-card>
		<el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
			<el-timeline :reverse="true">
				<el-timeline-item
				      v-for="(activity, index) in orderProgress"
				      :key="index"
				      :timestamp="activity.time">
				      {{activity.context}}
				    </el-timeline-item>
			</el-timeline>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		created() {
			this.getOrderList()
		},
		data() {
			return {
				queryInfo: {
					query: '',
					pagenum: 1,
					pagesize: 10,

				},
				orderList: [],
				total: 0,
				progressDialogVisible: false,
				orderProgress: []
			}
		},
		methods: {
			async getOrderList() {
				const {
					data: res
				} = await this.$http.get(`/orders`, {
					params: this.queryInfo
				});

				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				this.orderList = res.data.goods;
				this.total = res.data.total;


			},
			formatTime(time) {
				const unixTime = new Date(time)
				return unixTime.getFullYear() + '-' + (unixTime.getMonth() > 9 ? (unixTime.getMonth() + 1) : '0' + (unixTime.getMonth() +
						1)) +
					'-' + (unixTime.getDate() < 10 ? '0' + (unixTime.getDate()) : unixTime.getDate()) + ' ' +
					(unixTime.getHours() < 10 ? '0' + (unixTime.getHours()) : unixTime.getHours()) +
					':' + (unixTime.getMinutes() < 10 ? '0' + (unixTime.getMinutes()) : unixTime.getMinutes()) + ':' +
					(unixTime.getSeconds() < 10 ? '0' + (unixTime.getSeconds()) : unixTime.getSeconds())

			},
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize;
				this.getOrderList();
			},
			handleCurrentChange(newPage) {
				this.queryInfo.pagenum = newPage;
				this.getOrderList();
			},
			showProgress(id) {
				this.getProgress(id)
				this.progressDialogVisible = true
			},
			async getProgress(id) {
				console.log(3333)
				const {
					data: res
				} = await this.$http.get(`/kuaidi/` + '1106975712662');
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);


				this.orderProgress = res.data;

			}

		}
	}
</script>

<style>
</style>
