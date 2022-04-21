---
to: apps/<%= name.toLowerCase() %>/package.json
---

{
  "name": "@xdefi/chains-ethereum",
  "version": "1.0.0",
  "main": "src/main.ts",
  "types": "src/main.ts",
  "license": "MIT",
  "devDependencies": {
    "typescript": "^4.6.3"
  },
  "dependencies": {
    "bignumber.js": "^9.0.2",
    "reflect-metadata": "^0.1.13",
    "ts-node": "^10.7.0",
    "@xdefi/chains-core": "1.0.0"
  },
  "scripts": {
    "build": "tsc --build",
    "watch": "tsc --watch"
  }
}
