const _ = require("lodash");

const fetchCart = async (cart, req, res) => {
  let response = {};
  let items = [];
  let price = [];
  // fetched list of item from the cart
  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      console.log(doc.data());
      response = doc.data();
      items.push(response);
    });
  });
  // }
  return res.send(items);
};

const addCart = async (cart, item, req, res) => {
  // Add a new document in collection "cities" with ID 'LA'
  let userExist = false;
  let dataToWrite = {};
  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc, index) => {
      let docdata = doc.data();
      console.log("check user info info info 123333", item.itemData);
      // checks whther the user exist
      if (docdata.userInfo.uid === item.uid) {
        // console.log("check user info info info", doc.data().products[index].id);
        // console.log("item data id id id", item.itemData.id);
        let products = doc.data().products;
        userExist = true;
        docdata.quantity = docdata.quantity + 1;
        // checks if the item already is added
        let productExist = false;
        _.forEach(products, (val, key) => {
          if (item.itemData.id === val.id) {
            productExist = true;
            console.log("checking whether item already exist", item.itemData);
            val.qty = val.qty + 1;
            products[key] = val;
            console.log("checking qty increment", products);
            dataToWrite = {
              products: products,
              totalPrice:
                parseInt(doc.data().totalPrice, 10) +
                parseInt(item.itemData.price.mrp, 10),
            };

            return false;
          }
        });

        if (!productExist) {
          console.log("check for product exist flag", productExist);
          products.push(item.itemData);
          dataToWrite = {
            products: products,
            quantity: docdata.quantity,
            totalPrice:
              parseInt(doc.data().totalPrice, 10) +
              parseInt(item.itemData.price.mrp, 10),
          };
        }
        console.log("check ffinal doc to write", dataToWrite);
        cart
          .doc(doc.id)
          .update(dataToWrite)
          .then((data) => {
            console.log(data);
          })
          .catch((e) => {
            console.log("error error", e);
          });
      }
    });
    if (!userExist) {
      console.log("***USER DOES NOT EXIST****");
      // Adding a new cart for new user
      let productList = [];
      productList.push(item.itemData);
      let newCart = {
        quantity: 1,
        totalPrice: item.itemData.price.mrp,
        products: productList,
        userInfo: {
          uid: item.uid,
        },
        currency: "rupee",
      };
      cart
        .doc()
        .add(newCart)
        .then((recAdded) => {
          console.log("rec added rec added", recAdded);
        });
    }
  });
  return res.send("bihar se aaya mera dost");
};
exports.fetchCart = fetchCart;
exports.addCart = addCart;
