#!/bin/bash

cd ~/bin/xkcdfools
python build.py
rm /var/www/* ;
cp ~/bin/xkcdfools/build/* /var/www/ 