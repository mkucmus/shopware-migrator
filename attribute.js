const request = require('axios')
const path = require('path')
const { getAdmin, postAdmin, patchAdmin } = require('./common/apiConnectorAdmin')

const ATTRIBUTE_MAP = {
  color: "434923621f954edd9901c33d4e9cadc4",
  size: "ecd10c6946724d3aa3b5e1bd64c2ffa6"
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