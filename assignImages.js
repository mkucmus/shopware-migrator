const request = require("axios");
const path = require("path");
const {
  getAdmin,
  postAdmin,
  patchAdmin,
  deleteAdmin
} = require("./common/apiConnectorAdmin");
let i = 0;
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const insertMedia = async () =>
  postAdmin("media?_response=true", {}, i % 5 == 0);
const insertImage = async imageUrl => {
  //await timeout(80)
  if (!imageUrl) {
    throw "no imageUrl";
  }
  const mediaResponse = await insertMedia();
  const mediaId = mediaResponse.data.data.id;
  //console.error(mediaResponse.data.data)

  const extension = path.extname(imageUrl).replace(".", "");
  const filename = path.basename(imageUrl);

  const searchForMedia = async filename => {
    const response = await postAdmin(`search/media`, {
      filter: [
        {
          field: "fileName",
          type: "equals",
          value: filename
        }
      ]
    });
    //console.log(response.data.total ? response.data.data[0].id : null)
    return response.data.total ? response.data.data[0].id : null;
  };

  const foundMediaId = await searchForMedia(filename);
  if (foundMediaId) {
    return foundMediaId;
  }

  try {
    const response = await postAdmin(
      `_action/media/${mediaId}/upload?extension=${extension}&fileName=fashion_${filename}`,
      {
        url: `https://fashion.storefrontcloud.io/img/600/906/fit${imageUrl}`
      },
      i % 5 == 0
    );
  } catch (e) {
    console.log(`unable to add image ${imageUrl}`);
    console.log(
      `https://fashion.storefrontcloud.io/img/600/906/fit${imageUrl}`
    );
    //await deleteAdmin(`media/${mediaId}`)
    return false;
  }

  return mediaId;
};

const appendMedia = async (productId, { media_gallery, image }) => {
  //await timeout(100)
  const mediaId = await insertImage(image);
  if (mediaId) {
    await postAdmin(
      `product/${productId}/media`,
      { mediaId: mediaId },
      i % 5 == 0
    );
  }
  let j = 0;
  for (const img of media_gallery) {
    //await timeout(100)
    try {
      //console.log(`inserting image: ${img.image}`)
      const newMedia = await insertImage(img.image);
      if (newMedia) {
        await postAdmin(
          `product/${productId}/media`,
          { mediaId: newMedia },
          i % 5 == 0
        );
        j++;
      }
    } catch (e) {
      console.log(
        `an error occured during adding a gallery photo: ${img.image}. skipping.`
      );
    }
  }
};

const qty = 100;
const from = 2; // 760, 960, 1460, 2500, 3000

const checkIfGalleryExists = async ({ media_gallery }) => {
  for (media of media_gallery) {
    await request(
      `https://fashion.storefrontcloud.io/img/600/906/fit${media.image}`
    );

    return true;
  }
};
const getFashionProducts = async (qty, from = 1) =>
  await request(
    `https://fashion.storefrontcloud.io/api/catalog/vue_storefront_catalog/product/_search?q=type_id:configurable&size=${qty}&from=${from}`
  );
let fashionIterator = 0;
const appendMediaForFashionProduct = async (productId, fashionProducts) => {
  const productData = fashionProducts[fashionIterator]._source;
  try {
    await checkIfGalleryExists(productData);
    await appendMedia(productId, productData);
    fashionIterator++;
  } catch (e) {
    fashionIterator++;
    await appendMediaForFashionProduct(productId, fashionProducts);
  }
};

!(async () => {
  try {
    const fashionProductsResponse = await getFashionProducts(100, 100);
    const fashionProducts = fashionProductsResponse.data.hits.hits;

    const swproducts = await postAdmin(`search/product`, {
      filter: [
        {
          type: "equals",
          field: "parentId",
          value: null
        }
      ],
      limit: 100
    });

    let j = 0;
    for (product of swproducts.data.data) {
      ++j;

      await appendMediaForFashionProduct(product.id, fashionProducts);
      const productWithMediaResponse = await postAdmin(`search/product`, {
        ids: product.id,
        page: 1,
        limit: 25,
        associations: {
          media: {
            sort: [{ field: "position", order: "ASC", naturalSorting: false }]
          }
        }
      });

      if (productWithMediaResponse.data.data[0].media[0]) {
        await patchAdmin(`product/${product.id}`, {
          coverId: productWithMediaResponse.data.data[0].media[0].id
        });
      }
      console.log(product.id, " media appended");
    }
  } catch (e) {
    // console.log(e)
  }
})();
