module.exports = {
  api: {
    protocol: process.env.API_PROTOCOL || 'https',
    host:  'shopware.vuestorefront.io',
    token: process.env.API_TOKEN || 'SWSCCKXEEHPOQJNTCHLBSWCYBW',
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || 'sales-channel-api',
    user: 'admin',
    password: 'shopware'
  },
  elasticsearch: {
    host: 'localhost',
    port: 9200,
    logLevel: 'warn',
    indexName: 'vue_storefront_shopware',
  },
}