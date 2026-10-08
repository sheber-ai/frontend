import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'header-max-length': [2, 'always', 72],
	},
}

export default config
