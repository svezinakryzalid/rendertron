#!/bin/bash
#ICITTE: https://github.com/GoogleChrome/rendertron

killall chrome 
pm2 delete all 
pm2 start 'npm run start'
