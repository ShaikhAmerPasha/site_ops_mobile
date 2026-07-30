import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		frappeui({
			frappeProxy: true,
			lucideIcons: true,
			jinjaBootData: true,
			buildConfig: {
				indexHtmlPath: '../site_ops_mobile/www/site_ops_mobile.html',
			},
		}),
		vue(),
		VitePWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true,
			},
			workbox: {
				cleanupOutdatedCaches: true,
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
			},
			manifest: {
				name: 'Site Ops Mobile',
				short_name: 'Site Ops',
				description: 'Mobile-first PWA for site engineers',
				start_url: '/site_ops_mobile',
				scope: '/site_ops_mobile',
				display: 'standalone',
				theme_color: '#4f46e5',
				background_color: '#ffffff',
				icons: [
					{
						src: '/assets/site_ops_mobile/manifest/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: '/assets/site_ops_mobile/manifest/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: '/assets/site_ops_mobile/manifest/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	optimizeDeps: {
		exclude: ['frappe-ui'],
	},
})
