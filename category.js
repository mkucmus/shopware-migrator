const request = require('axios')
const path = require('path')
const { getAdmin, postAdmin, patchAdmin } = require('./common/apiConnectorAdmin')
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const categories = require('./data/categories').filter(category => category.parent_id == 2)
const template = require('./templates/category')
const insertCategory = async (categoryData) => { 
  try {
    const response = await postAdmin('category?_response=true', template(categoryData))
    const insertedId = response.data.data.id
  
    for (const category of categoryData.children_data) {
      await timeout(500)
      await postAdmin('category?_response=true', template(category, insertedId))
    }
  
    return insertedId
  } catch (e) {
    console.log(e)
  }
  
}

const insertCategories = async () => {
  for (const category of categories) {
    try {
      await insertCategory(category)
      console.log(`category ${category.name} inserted.`)
    } catch (e) {
      
      console.log(`error during inserting: ${e.response.status}. skipping.`)
    }
    
  }
}

insertCategories()