# Vue starter with nuxt SPA

## Recommended version

* nvm ~9.3 (npm 5.5.1)
* yarn ~1.6


## Build Setup

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:8080
yarn dev

# build for production with minification
yarn build

# build for production and view the bundle analyzer report
yarn build --report

# run unit tests
yarn unit

# run all tests
yarn test
```

## DEPLOY Configure
Create a credentials file at .aws/config
aws-sdk [https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-environment]

Example : `.aws/dev-config`
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=ap-southeast-1
S3_BUCKET=BUCKET_NAME
```

### Deployment CLI
```

# Dev build
yarn build

# Dev build & release
yarn prod-release

# Production build
yarn build

# Production build & release
yarn prod-release
```
