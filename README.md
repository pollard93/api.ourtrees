## Setup

##### Prerequisites
Install node, npm, docker and docker-compose, yarn and run `yarn install`

##### Update name
Search and replace `api-ourtrees`

##### Add .env
`cp .env.template .env`

##### Run minio and mysql
`yarn dev`

##### Setup devlopment bucket
`yarn ensure:bucket stage:development`

##### Deploy development database
`yarn dev:deploy`

##### Generate prisma client and typescript interfaces
`yarn dev:generate`

##### Start Server
`yarn start`

## Testing

##### Run tests

`yarn test:unit` or `yarn test:unit path/to/file.ts`

##### Run tests and reset database and minio

`yarn test:unit:reset`

##### Testing Emails

`yarn scripts/test:email.ts`

##### Testing Notifications

`yarn scripts/test:notification.ts`

## Linting

`yarn test:lint` or `yarn test:lint --fix`

##### To Visually see errors and fix on save in VSCODE
Install eslint plugin and add below to settings.json
`
  "eslint.autoFixOnSave":  true,
  "eslint.validate":  [
    "javascript",
    "javascriptreact",
    {"language":  "typescript",  "autoFix":  true  },
    {"language":  "typescriptreact",  "autoFix":  true  }
  ],
  "editor.formatOnSave":  true,
  "[javascript]":  {
    "editor.formatOnSave":  false,
  },
  "[javascriptreact]":  {
    "editor.formatOnSave":  false,
  },
  "[typescript]":  {
    "editor.formatOnSave":  false,
  },
  "[typescriptreact]":  {
    "editor.formatOnSave":  false,
  },
`


## Build

### Version

Edit package.json version

### Then

`yarn build:docker:staging`
`yarn build:docker:production`