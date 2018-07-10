#!/usr/bin/env bash
now \
&& sleep 10 \
&& now alias \
&& now scale musiclackey.now.sh bru1 0 \
&& now scale musiclackey.now.sh sfo1 1 \
&& echo y | now rm $(now ls musicbot | egrep "musicbot-.*now\.sh" -o | tail -n1)