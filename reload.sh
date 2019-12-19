#!/bin/bash
#ICITTE: https://github.com/GoogleChrome/rendertron

killall chrome 
/usr/bin/node /usr/bin/pm2 delete all 
/usr/bin/node /usr/bin/pm2 start 'npm run start' --watch
