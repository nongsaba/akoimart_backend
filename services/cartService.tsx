const fetchCart = async (cart, req, res) => {
  let response = {};
  let items = [];
  let price = [];
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
  // cart.doc('').set(item);
  console.log("add cart called called called");
  let dataToWrite = {};
  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc, index) => {
      let docdata = doc.data();
      console.log("check user info info info 123333", docdata);
      if (docdata.userInfo.uid === item.uid) {
        console.log("check user info info info", docdata);
        // console.log("user info", doc.data().userInfo.uid);
        let products = doc.data().products;
        docdata.quantity = docdata.quantity + 1;
        console.log(99999999999, products);
        if (item.itemData.id === doc.data().products[index].id) {
          console.log("checking for id id id", item.itemData);
          products[index].qty = doc.data().products[index].qty + 1;

          dataToWrite = {
            products: products,
            quantity: doc.data().quantity + 1,
            totalPrice:
              parseInt(doc.data().totalPrice, 10) +
              parseInt(item.itemData.price.mrp, 10),
          };
        } else {
          products.push(item.itemData);
          dataToWrite = {
            products: products,
            quantity: doc.data().quantity + 1,
            totalPrice:
              parseInt(doc.data().totalPrice, 10) +
              parseInt(item.itemData.price.mrp, 10),
          };
        }
        cart
          .doc(doc.id)
          .update(dataToWrite)
          .then((data) => {
            console.log(data);
          })
          .catch((e) => {
            console.log("error error", e);
          });

        // doc.set({ quantity: doc.data().quantity++ }).then((data) => {
        //   res.send(data);
        // });
      }
    });
  });
  return res.send("bihar se aaya mera dost");
};
exports.fetchCart = fetchCart;
exports.addCart = addCart;
