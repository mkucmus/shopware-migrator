const request = require('axios')
const getProducts = (from=1, size=100) => {
  return request.get(`https://fashion.storefrontcloud.io/api/catalog/vue_storefront_catalog/product/_search?q=type_id:configurable&size=${size}&from=${from}`)
}
const deleteProduct = id => request.delete(`http://elasticsearch:9200/vue_storefront_catalog/product/${id}`)
const buildImgUrl = (filename) => `https://magento-demo3.storefrontcloud.io/media/catalog/product${filename}`
const checkIfExists = url => request.head(url)
const run = async () => {
  console.log('deleter started...')

  const products = await getProducts(1, 500)

  for (const product of products.data.hits.hits) {
     const { image, id, sku } = product._source
     try {
      await checkIfExists(buildImgUrl(image))
      console.log(`-----------------------------------`)
      console.log(`product with sku "${sku}" has a photo`)
      console.log(`-----------------------------------`)
     } catch (e) {
       console.log(`-----------------------------------`)
       console.log(`id: ${id}`)
       console.log(`sku: ${sku}`)
       console.log(`missing img: ${buildImgUrl(image)}`)
       console.log(e.response.status)

       if (e.response.status == 404) {
         console.log('trying to delete a product...')
         const deleted = await deleteProduct(id)
         console.log(deleted.data)
         process.exit()

       }
      
       console.log(`-----------------------------------`)
     }
     
  }
}


run()