module.exports = ({id, sku, name, price, final_price, reference, description, special_price, stock, image, thumbnail, small_image, color, size}, configurableChildren) => (
  {
    "active": true,
    "stock": Math.floor(Math.random() * 100) + 50 ,
    "manufacturerId": "9c4f644a67f44c31b2a6659e7d5d7178",
    "taxId": "bf56791139c04121b81c6e39c6a2360f",
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
    ],
    "configuratorSettings": configurableChildren
  }
)


if ( doc['final_price'].size() != 0) { if (doc['final_price'].value != 0) { doc['final_price'].value} } else if (doc['special_price'].size() != 0) { if (doc['special_price'].value != 0) { doc['special_price'].value}  } else { doc['price'].value }
