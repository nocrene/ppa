import adapter from '@sveltejs/adapter-static';

const quotableStatements = Object.freeze(['none', 'self', 'unsafe-inline']);

const quote = (statement) => {
  return quotableStatements.includes(statement) ? `'${statement}'`: statement;
};
const reportURI = `/csp-violation-report`;
const cspDirectives = {
  'default-src': ['self'],
  'img-src': ['self', 'chart.googleapis.com'],
  'font-src': ['self'],
  'manifest-src': ['self'],
  'style-src': ['self', 'unsafe-inline'],
  'script-src': ['self', 'unsafe-inline'],
  'connect-src': ['self'],
  'report-uri': [reportURI],
  'report-to': ['csp-violation-report'],
};

const DIRECTIVES = Object.entries(cspDirectives).map(([key, values]) => `${key} ${values.map((value) => `${quote(value)}`).join(' ')}`);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: '',
      strict: true,
    }),
    serviceWorker: {
      register: true,
    },
    files: {
      hooks: {
        server: 'src/files/hooks/hooks.server.js',
      },
    },
    csp: {
      directives: cspDirectives,
      reportOnly: cspDirectives,
    },
    env: {
      dir: './src/environments',
    },
	},
};

export default config;