const request = require("axios");
const path = require("path");
const {
  getAdmin,
  postAdmin,
  patchAdmin,
  deleteAdmin
} = require("./common/apiConnectorAdmin");
const template = require("./templates/product");
const colors = require("./data/colors");
const sizes = require("./data/sizes");
const config = require("./config.js");
const ATTRIBUTE_MAP = config.api.map.attributeMap;
let i = 0;
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const getProducts = async (qty, from = 1) =>
  await request(
    `https://fashion.storefrontcloud.io/api/catalog/vue_storefront_catalog/product/_search?q=type_id:configurable&size=${qty}&from=${from}`
  );
const insertProduct = async (productData, configurableChildren) => {
  //console.error(template(productData, configurableChildren))
  const response = await postAdmin(
    "product?_response=true",
    template(productData, configurableChildren),
    1
  );
  return response.data.data.id;
};

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
      `_action/media/${mediaId}/upload?extension=${extension}&fileName=${filename}`,
      {
        url: `https://fashion.storefrontcloud.io/img/600/744/resize${imageUrl}`
      },
      i % 5 == 0
    );
  } catch (e) {
    console.log(`unable to add image ${imageUrl}`);
    await deleteAdmin(`media/${mediaId}`);
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
  let firstMediaId = mediaId;
  let j = 0;
  for (const img of media_gallery) {
    //await timeout(100)
    try {
      //console.log(`inserting image: ${img.image}`)
      const newMedia = await insertImage(img.image);
      if (newMedia) {
        if (!firstMediaId) {
          firstMediaId = newMedia;
        }
        const testId = await postAdmin(
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

  return firstMediaId;
};

const translateIdToLabelColor = optionId =>
  colors.filter(attribute => attribute.value == optionId).shift().label;
const translateIdToLabelSize = optionId =>
  sizes.filter(attribute => attribute.value == optionId).shift().label;

const getColorId = async optionId => {
  const label = translateIdToLabelColor(optionId);
  const option = await postAdmin(
    `search/property-group/${ATTRIBUTE_MAP.color}/options`,
    {
      page: 1,
      limit: 50,
      sort: [
        {
          field: "property_group_option.name",
          order: "ASC",
          naturalSorting: false
        }
      ],
      term: label
    }
  );
  let options = option.data.data.filter(option => option.name == label);

  return { colorId: options[0].id, colorGroupId: options[0].groupId };
};

const getSizeId = async optionId => {
  const label = translateIdToLabelSize(optionId);
  const option = await postAdmin(
    `search/property-group/${ATTRIBUTE_MAP.size}/options`,
    {
      page: 1,
      limit: 50,
      sort: [
        {
          field: "property_group_option.name",
          order: "ASC",
          naturalSorting: false
        }
      ],
      term: label
    }
  );
  let options = option.data.data.filter(option => option.name == label);
  //console.log(options)
  return { sizeId: options[0].id, sizeGroupId: options[0].groupId };
};

const appendCategories = async (insertedProductId, { reference }) => {
  // await timeout(100)
  try {
    const parentProduct = await request.get(
      `https://fashion.storefrontcloud.io/api/catalog/vue_storefront_catalog/product/_search?q=sku:${reference}`
    );
    const categories = await parentProduct.data.hits.hits
      .shift()
      ._source.category.map(async category => {
        //await timeout(80)
        const categoryResponse = await postAdmin(
          `search/category`,
          { page: 1, limit: 5, term: category.name },
          i % 5 == 0
        );
        const categoryData = categoryResponse.data.data.shift();
        const {
          id,
          visible,
          active,
          name,
          displayNestedProducts,
          parentVersionId,
          afterCategoryVersionId
        } = categoryData;
        return {
          id: id,
          name: name
        };
      });

    const cats = Promise.all(categories);
    for (const category of await cats) {
      //await timeout(200)
      await patchAdmin(`product/${insertedProductId}`, {
        categories: [
          {
            id: category.id,
            name: category.name,
            translated: {
              name: category.name
            }
          }
        ]
      });
    }
  } catch (e) {
    console.log(`cant add category`);
  }
  return [];
};

const prepareVariants = async (parentId, variants) => {
  //console.log('variants: ', variants)
  const output = [];

  const properties = [];

  for (const { sku, size, color, name, price, priceInclTax } of variants) {
    const { sizeId, sizeGroupId } = await getSizeId(size);
    const { colorId, colorGroupId } = await getColorId(color);
    const sizeLabel = translateIdToLabelSize(size);
    const colorLabel = translateIdToLabelColor(color);

    output.push({
      id: colorId,

      price: { gross: priceInclTax, net: price, linked: false },
      option: {
        id: colorId,
        name: colorLabel,
        groupId: ATTRIBUTE_MAP.color
      }
    });

    output.push({
      id: sizeId,
      price: { gross: priceInclTax, net: price, linked: false },
      option: {
        id: sizeId,
        name: sizeLabel,
        groupId: ATTRIBUTE_MAP.size
      }
    });
  }

  return output;
};

const appendVariants = async (parentId, variants) => {
  const variations = await variants.map(
    async ({ size, color, price, priceInclTax, sku }) => {
      const { sizeId, sizeGroupId } = await getSizeId(size);
      const { colorId, colorGroupId } = await getColorId(color);

      return {
        parentId: parentId,
        options: [
          {
            id: sizeId
          },
          {
            id: colorId
          }
        ],
        stock: 10,
        productNumber: sku,
        price: [
          {
            currencyId: config.api.map.currencyId, //euro
            net: price,
            gross: priceInclTax,
            linked: false,
            extensions: []
          }
        ],
        priceRules: [],
        taxId: config.api.map.taxId
      };
    }
  );

  Promise.all(variations).then(async items => {
    const requestData = [
      {
        action: "upsert",
        entity: "product",
        payload: items
      }
    ];
    //console.log(`items: `, items)
    const configuration = [];

    for (item of items) {
      for (option of item.options) {
        configuration.push({ optionId: option.id });
      }
    }

    const response = await postAdmin(`_action/sync`, requestData);
    await patchAdmin(`product/${parentId}`, {
      configuratorSettings: configuration
    });
  });
  return variations;
};

const qty = 1000;
const from = 3000; // 760, 960, 1460, 2500, 3000
getProducts(qty, from).then(async products => {
  console.log("start importing...");
  for (const product of products.data.hits.hits) {
    // await timeout(100)
    const productData = product._source;
    try {
      console.log(`trying to add product with sku: ${productData.sku}`);

      const configurableChildren = await prepareVariants(
        0,
        productData.configurable_children
      );
      const insertedId = await insertProduct(productData, configurableChildren);
      await appendMedia(insertedId, productData);

      await appendCategories(insertedId, productData);
      const variants = await appendVariants(
        insertedId,
        productData.configurable_children
      );
      const productWithMediaResponse = await postAdmin(`search/product`, {
        ids: insertedId,
        page: 1,
        limit: 25,
        associations: {
          media: {
            sort: [{ field: "position", order: "ASC", naturalSorting: false }]
          }
        }
      });

      if (productWithMediaResponse.data.data[0].media[0]) {
        // console.log(productWithMediaResponse.data.data[0].media[0])
        //console.error(productWithMediaResponse.data.data[0].media[0].id)
        await patchAdmin(`product/${insertedId}`, {
          coverId: productWithMediaResponse.data.data[0].media[0].id,
          properties: configurableChildren.map(child => ({
            id: child.id,
            groupId: child.option.groupId
          }))
        });
      }

      /**
      const firstProductMedia =  productWithMediaResponse.data.data[0].media[0].id
      console.log(firstProductMedia)
      await patchAdmin(`product/2308070addae45c7a5bb94972b52f8eb`, { coverId: firstProductMedia})*/

      const { name, reference } = productData;

      ++i;

      console.log(insertedId, reference, name, ` | inserted (${i} of ${qty})`);
    } catch (e) {
      console.log(`some error occured with ${productData.sku}`);
      //console.log(e)
      if (e.response) {
        console.log(e.response.status);
        console.log(e.response.data.errors);
      }
      console.log(`error during inserting ${productData.sku}. skipping.`);
    }
  }
  console.log("edned from: ", from);
  console.log("edned qty: ", qty);
});
