import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '4.5rem', /* 72px gutter */
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1280px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Geist', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
				mono: ['Geist Mono', 'ui-monospace', 'SF Mono', 'Roboto Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				/* TradePilot raw scales (DESIGN/tokens/colors.css) */
				gray: {
					0: '#ffffff',
					25: '#f7f9fa',
					50: '#f1f4f6',
					100: '#e7ebee',
					150: '#dde3e7',
					200: '#d3dade',
					300: '#bcc5cc',
					400: '#94a1aa',
					500: '#6a7680',
					600: '#4d5860',
					700: '#363f47',
					800: '#212930',
					900: '#131a1f',
				},
				teal: {
					50: '#e6f4f1',
					100: '#c6e7e1',
					200: '#8fd0c5',
					400: '#2ba695',
					500: '#0f8b7d',
					600: '#0b7669',
					700: '#095f55',
				},
				navy: {
					700: '#0f303e',
					800: '#0a2430',
					900: '#071a23',
				},
				orange: {
					50: '#fdefe6',
					100: '#fad9c5',
					500: '#f26a21',
					600: '#d9560f',
				},
				green: {
					50: '#e7f5ee',
					500: '#0e8f63',
					600: '#0b7752',
				},
				amber: {
					50: '#fdf3e1',
					500: '#c07d12',
					600: '#a2680b',
				},
				red: {
					50: '#fceceb',
					500: '#d7443e',
					600: '#b8332e',
				},
				blue: {
					50: '#eaf1fd',
					500: '#2d6cdf',
					600: '#1f56bd',
				},
				violet: {
					50: '#f0edfb',
					500: '#6d54c9',
					600: '#573fb0',
				},
			},
			fontSize: {
				'display-lg': ['2.125rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
				'display': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
				'h1': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
				'h2': ['1.125rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
				'h3': ['1rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
				'overline': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.06em' }],
			},
			boxShadow: {
				xs: '0 1px 2px rgba(16,24,40,0.05)',
				sm: '0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)',
				DEFAULT: '0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)',
				md: '0 4px 14px rgba(16,24,40,0.08)',
				lg: '0 12px 30px rgba(16,24,40,0.10)',
				xl: '0 24px 48px rgba(16,24,40,0.14)',
				inner: 'inset 0 1px 2px rgba(16,24,40,0.06)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem', /* 16px */
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
