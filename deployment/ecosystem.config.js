const config = {
  apps: [{
    name: 'magician-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/mentallyhyp/public_html',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: 'magiciannearme.store'
    }
  }]
};

export default config;
