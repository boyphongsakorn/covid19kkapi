module.exports = {
    apps : [{
      name : 'covid19kk',
      script: 'index.js',
      log_date_format: 'DD/MM/YYYY HH:mm Z',
      error_file : "./err.log",
      out_file : "./out.log",
      ignore_watch: ["node_modules","err.log",".env","Procfile","out.log","./array.txt"],
      autorestart: true,
      cron_restart: "30 14 * * *"
    }],
    deploy : {
      production : {
        user : 'pi',
        host : 'raspberrypi',
        ref  : 'origin/master',
        repo : 'git@github.com:boyphongsakorn/covid19kkapi.git',
        path : '.',
        'pre-deploy-local': '',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
        'pre-setup': ''
      }
    }
  };