#!/usr/bin/env bash
for deployment in $(now ls | egrep "musicbot.*now\.sh" -o);
do
    echo y | now rm $deployment
done