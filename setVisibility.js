const request = require('axios')
const path = require('path')
const { getAdmin, postAdmin, patchAdmin, deleteAdmin } = require('./common/apiConnectorAdmin')
const { get } = require('./common/apiConnector')
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//const getProducts = async () => await get('product?limit=500&filter[product.active]=1')
const getProducts = async () => await request.get('http://es.vuestorefront.io:9200/vue_storefront_shopware/product/_search?size=60')
let i = 0
getProducts().then(async products => {
  const fakeProducts = 
    { data: {hits: { hits: [{id: "73a590bf0e5c422c8e2b20065a4d9b7b"}]}}}
  
  console.log('start importing...')
  for (const product of fakeProducts.data.hits.hits) {
    //for (const product of fakeProducts) {
    await timeout(600)
    const productId = product.id

    await 
    console.log(productId)
    ++i
    try {
      const visibilitiesResponse = await getAdmin(`product/${productId}/visibilities`, i%5 == 0)
      const visibilities = visibilitiesResponse.data.data
      //console.log(visibilities)
      if (visibilities.length==1) {
      //  continue;
      }
      
      for (const visibility of visibilities) {
        await deleteAdmin(`product/${productId}/visibilities/${visibility.id}`,
        i%5 == 0
        )
        console.log(`${visibility} visibility cleared`)
      }
      
      await patchAdmin(`product/${productId}?_response=true`, 
        {"visibilities":[{"salesChannelId":"98432def39fc4624b33213a56b8c944d","visibility":30}]}
      ,
      i%5 == 0
      )
      console.log("done: ", productId, i)
    } catch (e) {
      console.log(e)
      console.log(`error during inserting. skipping.`)
    }
    
  }
})


