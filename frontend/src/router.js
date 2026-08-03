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
		path: '/stock-entries',
		name: 'StockEntryList',
		component: () => import('./pages/StockEntryList.vue'),
	},
	{
		path: '/stock-entries/new',
		name: 'StockEntryNew',
		component: () => import('./pages/StockEntryNew.vue'),
	},
	{
		path: '/stock-entries/:name',
		name: 'StockEntryDetail',
		component: () => import('./pages/StockEntryDetail.vue'),
		props: true,
	},
	{
		path: '/labour-payments',
		name: 'LabourPaymentList',
		component: () => import('./pages/LabourPaymentList.vue'),
	},
	{
		path: '/labour-payments/new',
		name: 'LabourPaymentNew',
		component: () => import('./pages/LabourPaymentNew.vue'),
	},
	{
		path: '/labour-payments/:name',
		name: 'LabourPaymentEdit',
		component: () => import('./pages/LabourPaymentNew.vue'),
		props: true,
	},
]

export default createRouter({
	history: createWebHistory('/site_ops_mobile'),
	routes,
})
