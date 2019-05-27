const request = require('axios')
const path = require('path')
const { getAdmin, postAdmin, patchAdmin, deleteAdmin } = require('./common/apiConnectorAdmin')
const template = require('./templates/product')
const colors = require('./data/colors')
const sizes = require('./data/sizes')
const ATTRIBUTE_MAP = {
  color: "f460a413e5b6469a9550aaeb8ad0af7e",
  size: "c0074e637f68498ba56884c7fed318c4"
}
let i = 0
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const getProducts = async (qty) => await request(`https://fashion.storefrontcloud.io/api/catalog/vue_storefront_catalog/product/_search?q=type_id:configurable&size=${qty}&from=1`)
const insertProduct = async (productData, colorId, sizeId, colorLabel, sizeLabel) => { 
  const response = await postAdmin('product?_response=true', template(productData, colorId, sizeId, colorLabel, sizeLabel), 1)
  return response.data.data.id
}

const insertMedia = async () => postAdmin('media?_response=true', {}, i%5==0)
const insertImage = async (imageUrl) => {
  if (!imageUrl) {
    throw "no imageUrl";
  }
  const mediaResponse = await insertMedia()
  const mediaId = mediaResponse.data.data.id

  const extension = path.extname(imageUrl).replace('.','')
  const filename = path.basename(imageUrl)

  
  await timeout(100)
  try {
    const response = await postAdmin(`_action/media/${mediaId}/upload?extension=${extension}&fileName=${filename}`, {
      url: `https://fashion.storefrontcloud.io/img/1000/1000/fit${imageUrl}`
  }, i%5==0)
  } catch (e) {
    await deleteAdmin(`media/${mediaId}`)
    return false;
  }
  
  return mediaId
}

const appendMedia = async (productId, { media_gallery, image}) => {
  await timeout(200)
  const mediaId = await insertImage(image)
  if (mediaId) {
    await postAdmin(`product/${productId}/media`, {mediaId: mediaId}, i%5==0)
  }

  for (const img of media_gallery) {
    await timeout(200)
    try {
      //console.log(`inserting image: ${img.image}`)
      const newMedia = await insertImage(img.image)
      if (newMedia) {
        await postAdmin(`product/${productId}/media`, {mediaId: newMedia}, i%5==0)
      }
    } catch (e) {
      console.log(`an error occured during adding a gallery photo: ${img.image}. skipping.`)
    }
  }
}

const translateIdToLabelColor = (optionId) => colors.filter(attribute => attribute.value == optionId).shift().label
const translateIdToLabelSize = (optionId) => sizes.filter(attribute => attribute.value == optionId).shift().label

const getColorId = async (optionId) => {
  const label = translateIdToLabelColor(optionId)
  const option = await postAdmin(`search/property-group/${ATTRIBUTE_MAP.color}/options`,
    {"page":1,"limit":50,"sort":[{"field":"property_group_option.name","order":"ASC","naturalSorting":false}],"term":label}
  )
  let options = option.data.data.filter(option => option.name == label)
  return options[0].id
}

const getSizeId = async (optionId) => {
  const label = translateIdToLabelSize(optionId)
  const option = await postAdmin(`search/property-group/${ATTRIBUTE_MAP.size}/options`,
    {"page":1,"limit":50,"sort":[{"field":"property_group_option.name","order":"ASC","naturalSorting":false}],"term":label}
  )
  let options = option.data.data.filter(option => option.name == label)
  return options[0].id
}

const appendCategories = async (insertedProductId, { reference }) => {
  await timeout(200)
  try {
    const parentProduct = await request.get(`https://fashion.storefrontcloud.io/api/catalog/vue_storefront_catalog/product/_search?q=sku:${reference}`)
    const categories = await parentProduct.data.hits.hits.shift()._source.category
      .map(async category => {
        await timeout(100)
        const categoryResponse = await postAdmin(`search/category`, {"page":1,"limit":1,"term": category.name}, i%5==0)
        const categoryData = categoryResponse.data.data.shift()
        const {id, visible, active, name, displayNestedProducts, parentVersionId, afterCategoryVersionId} = categoryData
        return {
          id: id,
          name: name
        }  
      }
    )

    const cats = Promise.all(categories)
    for (const category of await cats) {
      await timeout(200)
      await patchAdmin(`product/${insertedProductId}`, { categories: [{
        id: category.id,
        name: category.name,
        translated: {
          name: category.name
        }
      }]} )
    }

   

  } catch (e) {
    console.log(`error occured: ${e}`)
  }
  
  return []

}
const qty = 100
getProducts(qty).then(async products => {
  
  console.log('start importing...')
  for (const product of products.data.hits.hits) {
    await timeout(500)
    
    try {
      const productData = product._source
      console.log(`trying to add product with sku: ${productData.sku}`)
      

      const colorId = productData.color_options.length ? await getColorId(productData.color_options[0]) : 0
      const sizeId = productData.size_options.length ? await getSizeId(productData.size_options[0]) : 0
      const colorLabel = colorId ? translateIdToLabelColor(productData.color_options[0]) : false
      const sizeLabel = sizeId ? translateIdToLabelSize(productData.size_options[0]) : false

      const insertedId = await insertProduct(Object.assign({}, productData, {name: productData.name}), colorId, sizeId, colorLabel, sizeLabel)
      await appendMedia(insertedId, productData)
      await appendCategories(insertedId, productData)
      const { sku, name, reference } = productData
      ++i
      console.log(sku, name, reference ,` | inserted (${i} of ${qty})`)
    } catch (e) {
      console.log(e)
      console.log(`error during inserting. skipping.`)
    }
    
  }
})