module.exports = ({id, sku, name, price, final_price, reference, special_price, priceInclTax, visibility, created_at, updated_at, media_gallery, stock, image, thumbnail, small_image, color, size}, colorId, sizeId, colorLabel, sizeLabel) => (
  {
    "active": true,
    "stock": Math.floor(Math.random() * 100) + 50 ,
    "manufacturerId": "b7b40e8b66944588b67bd13593ae0076",
    "taxId": "eeaa81fa2b19404e97e7e561d9603889",
    "coverId": null,
    "price": {
      "gross": price ? price : 0,
      "net": price ? price : 0,
      "linked": false
    },
    "productNumber": reference,
    "purchasePrice": price ? price : 0,
    "name": `${name}`,
    "description": " ",
    "properties": colorId && sizeId ? [{id: colorId}, {id: sizeId}] : [],
    "visibilities":[
      {"salesChannelId":"98432def39fc4624b33213a56b8c944d","visibility": 30},
    ]
  }
)