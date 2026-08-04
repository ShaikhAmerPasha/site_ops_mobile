import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{ path: '/', redirect: '/material-requests' },
	{
		path: '/material-requests',
		name: 'MaterialRequestList',
		component: () => import('./pages/MaterialRequestList.vue'),
	},
	{
		path: '/material-requests/new',
		name: 'MaterialRequestNew',
		component: () => import('./pages/MaterialRequestNew.vue'),
	},
	{
		path: '/material-requests/:name',
		name: 'MaterialRequestDetail',
		component: () => import('./pages/MaterialRequestDetail.vue'),
		props: true,
	},
	{
		path: '/purchase-orders',
		name: 'PurchaseOrderList',
		component: () => import('./pages/PurchaseOrderList.vue'),
	},
	{
		path: '/purchase-receipts/new/:po',
		name: 'PurchaseReceiptNew',
		component: () => import('./pages/PurchaseReceiptNew.vue'),
		props: true,
	},
	{
		path: '/purchase-receipts',
		name: 'PurchaseReceiptList',
		component: () => import('./pages/PurchaseReceiptList.vue'),
	},
	{
		path: '/purchase-receipts/:name',
		name: 'PurchaseReceiptDetail',
		component: () => import('./pages/PurchaseReceiptDetail.vue'),
		props: true,
	},
	{
		path: '/items',
		name: 'ItemList',
		component: () => import('./pages/ItemList.vue'),
	},
	{
		path: '/items/new',
		name: 'ItemNew',
		component: () => import('./pages/ItemNew.vue'),
	},
	{
		path: '/material-issues',
		name: 'MaterialIssueList',
		component: () => import('./pages/MaterialIssueList.vue'),
	},
	{
		path: '/material-issues/new',
		name: 'MaterialIssueNew',
		component: () => import('./pages/MaterialIssueNew.vue'),
	},
	{
		path: '/material-issues/:name',
		name: 'MaterialIssueDetail',
		component: () => import('./pages/MaterialIssueDetail.vue'),
		props: true,
	},
	{
		path: '/labour-payments',
		name: 'LabourPaymentList',
		component: () => import('./pages/LabourPaymentList.vue'),
	},
	{
		path: '/labour-payments/:name',
		name: 'LabourPaymentEdit',
		component: () => import('./pages/LabourPaymentEdit.vue'),
		props: true,
	},
]

export default createRouter({
	history: createWebHistory('/site_ops_mobile'),
	routes,
})
