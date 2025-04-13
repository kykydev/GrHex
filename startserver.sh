#!/bin/bash

while true; do
  echo "Lancement du serveur"
  node ./backend/App.js
  echo "Serveur fermé."
  sleep 2
done

