const request = require('axios')
const path = require('path')
const { getAdmin, postAdmin, patchAdmin } = require('./common/apiConnectorAdmin')

const ATTRIBUTE_MAP = {
  color: "f460a413e5b6469a9550aaeb8ad0af7e",
  size: "c0074e637f68498ba56884c7fed318c4"
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