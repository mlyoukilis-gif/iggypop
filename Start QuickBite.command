#!/bin/bash
cd "$(dirname "$0")/quickbite"
npm install
npm run build:shared
npm run dev:web
