#!/bin/bash

while true; do
  echo "Lancement du serveur"
  node ./backend/App.js >> server.log 2>&1
  echo "Serveur fermé."
  sleep 2
done

