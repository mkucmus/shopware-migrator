const faker = require("faker")
const config = require("../config.js")
module.exports = ({id, sku, name, price, final_price, reference, description, special_price, stock, image, thumbnail, small_image, color, size}, configurableChildren) => (
  {
    "active": true,
    "stock": Math.floor(Math.random() * 100) + 50 ,
    "manufacturerId": config.api.map.manufacturerId,
    "taxId": config.api.map.taxId,
    "price": [{

      "currencyId": config.api.map.currencyId, //euro
      "gross": price ? price : 0,
      "net": price ? price : 0,
      "linked": false
    }],
    "productNumber": reference,
    "purchasePrice": price ? price : 0,
    "name": name,
    "description": description.length>1 ? description : `<strong>${name}</strong>` + " | " + faker.lorem.paragraph(),
    "visibilities":[
      {"salesChannelId":config.api.map.salesChannelId,"visibility": 30},
    ],
    "properties": [config.api.map.textileProperties[Math.floor(Math.random() * 5)], config.api.map.widthProperties[Math.floor(Math.random() * 5)]],
    "configuratorSettings": configurableChildren
  }
)

