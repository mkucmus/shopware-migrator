module.exports = {
  api: {
    protocol: process.env.API_PROTOCOL || "https",
    host: "shopware-fashion.vuestorefront.io",
    token: process.env.API_TOKEN || "SWSCMUDKAKHSRXPJEHNOSNHYAG",
    version: process.env.API_VERSION || "v1",
    prefix: process.env.API_PREFIX || "sales-channel-api",
    user: "admin",
    password: "shopware",
    map: {
      // shopware-fashion
      taxId: "a26a97857b4c4c79950baeced450979b", // 19%
      currencyId: "b7d2554b0ce847cd82f3ac9bd1c0dfca", // euro
      manufacturerId: "44379ec14f24400abe49ec3188d8e3c0", // divante
      salesChannelId: "cd87eb22d133499eb7e7831d34b6c461", // storefront
      attributeMap: {
        color: "070970f0e3e248869c637972aacc94df",
        size: "4874daa47d12462598204519b146fd3c"
      },
      textileProperties: [ // random props
        {
          id: "a92a4af706c344eaaf03e3ffb4f247c8",
          groupId: "7409aa32477d47e5af6ca2bce099c0bd"
        },
        {
          id: "36fd865ef1eb4f7385bbccabec21e1d0",
          groupId: "7409aa32477d47e5af6ca2bce099c0bd"
        },
        {
          id: "af018b40d77541e3bd85fb42b222e507",
          groupId: "7409aa32477d47e5af6ca2bce099c0bd"
        },
        {
          id: "402da520de0b441884b28db07b11ff9d",
          groupId: "7409aa32477d47e5af6ca2bce099c0bd"
        },
        {
          id: "b0c8175373944964802af43b735355b2",
          groupId: "7409aa32477d47e5af6ca2bce099c0bd"
        }
      ],
      widthProperties: [ // random props
        {
          id: "146107ce4c8443a98c578b4c57e75fad",
          groupId: "b49adb497cd14639b5a0d0949dd7ebc7"
        },
        {
          id: "38a983e98ca94bc28e48d35e75a93b5e",
          groupId: "b49adb497cd14639b5a0d0949dd7ebc7"
        },
        {
          id: "5796c52ea76345bcaad1c86b1cc52c9a",
          groupId: "b49adb497cd14639b5a0d0949dd7ebc7"
        },
        {
          id: "64f4323ef10342ca920a6ed2c32ed543",
          groupId: "b49adb497cd14639b5a0d0949dd7ebc7"
        },
        {
          id: "777a097e407e4d3c8069369ea18ec1ef",
          groupId: "b49adb497cd14639b5a0d0949dd7ebc7"
        }
      ]
    }
  },
  elasticsearch: {
    host: "localhost",
    port: 9200,
    logLevel: "warn",
    indexName: "vue_storefront_shopware"
  }
};
