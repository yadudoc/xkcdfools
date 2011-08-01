#!/bin/bash

cat xkcd_cli_how_1 > xkcd_cli.js
python pyParse_how.py>>xkcd_cli.js
cat xkcd_cli_how_2 >> xkcd_cli.js
