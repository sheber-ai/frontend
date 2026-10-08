import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	plugins: [
		{
			rules: {
				'header-english': ({ header }) => [
					/^[\x20-\x7E]*$/.test(header ?? ''),
					'commit header must be in English',
				],
			},
		},
	],
	rules: {
		'header-max-length': [2, 'always', 72],
		'header-english': [2, 'always'],
	},
}

export default config
