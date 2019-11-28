const request = require('axios')
const path = require('path')
const { getAdmin, postAdmin, patchAdmin } = require('./common/apiConnectorAdmin')

const ATTRIBUTE_MAP = {
  color: "09a86b84f4484cf0aaa2b21845df83d7",
  size: "eab9c6f05e29475cbdb09c4c9f052138"
}

const colors = require('./data/colors')
const sizes = require('./data/sizes')


const getPropertyPath = (type) => ATTRIBUTE_MAP[type]
const insertOptions = async (type, options) => {
  for (const option of options) {
    try {
      try {
        await patchAdmin(`property-group/${getPropertyPath(type)}`, {options: [{name: option.label}]})
        console.log(`option ${option.label} inserted.`)
      } catch (e) {
        console.log(`error during inserting: ${e.response.status}. skipping.`)
      }
    } catch (e) {
      console.log(`error during inserting: ${e.response.status}. skipping.`)
    }
    
  }
}

insertOptions('color', colors)
insertOptions('size', sizes)