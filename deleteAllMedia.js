const request = require("axios");
const path = require("path");
const {
  getAdmin,
  postAdmin,
  patchAdmin,
  deleteAdmin
} = require("./common/apiConnectorAdmin");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deleteMediaForId(productId) {
  // const productId = "05b1a6a37ff646d29c0029e21b758369"
  const media = await getAdmin(`product/${productId}/media`);
  // console.log(media.data.data[0].id)

  for (image of media.data.data) {
    await deleteAdmin(`product/${productId}/media/${image.id}`);
  }
}

!(async () => {
  try {
    const products = await getAdmin(`product?limit=500`);
    for (product of products.data.data) {
      console.log(product.id);
      deleteMediaForId(product.id);
    }
  } catch (e) {
    // console.log(e)
  }
})();
