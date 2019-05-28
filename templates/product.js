module.exports = ({id, sku, name, price, final_price, reference, description, special_price, stock, image, thumbnail, small_image, color, size}, configurableChildren) => (
  {
    "active": true,
    "stock": Math.floor(Math.random() * 100) + 50 ,
    "manufacturerId": "3846d5dc13254408b1231e64d4aad3d7",
    "taxId": "43e878543464403c8535d0a0592f7f6f",
    "coverId": null,
    "price": {
      "gross": price ? price : 0,
      "net": price ? price : 0,
      "linked": false
    },
    "productNumber": reference,
    "purchasePrice": price ? price : 0,
    "name": name,
    "description": description,
    "visibilities":[
      {"salesChannelId":"98432def39fc4624b33213a56b8c944d","visibility": 30},
      {"salesChannelId":"56d257dcb60a4574807a0b4f68787e72","visibility": 30},
    ],
    "configuratorSettings": configurableChildren
  }
)