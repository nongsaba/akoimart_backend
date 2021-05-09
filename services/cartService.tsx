const lodash = require("lodash");

const fetchCart = async (cart, req, res) => {
  let uid = req.query.uid;
  let response = {};
  let items = [];
  let price = [];
  // fetched list of item from the cart
  if(uid){
  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      if (doc.data().userInfo.uid === uid) {
        console.log(doc.data());
        response = doc.data();
        items.push(response);
      }
    });
  });
}else{
  return res.send("user not logged in")
}
  return res.send(items);
};

const addCart = async (cart, item, req, res) => {
  // Add a new document in collection "cities" with ID 'LA'
  let userExist = false;
  let dataToWrite = {};

  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc, index) => {
      let docdata = doc.data();
      // checks whther the user exist
      if (docdata.userInfo.uid === item.uid) {

        let products = doc.data().products;
        userExist = true;
        //docdata.quantity = docdata.quantity + 1; // add only 1 item to the cart quatity of items is mainained separately
        // checks if the item already is added
        let productExist = false;
        let quantity;
        let priceTobeDeductedFromTotalPrice;
        lodash.forEach(products, (val, key) => {
          if (item.itemData._id === val._id) {
            priceTobeDeductedFromTotalPrice = val.qty * (val.price.mrp - val.price.discount); // to be deducted from the totalprice if the item is added
            productExist = true;
            if (!item.updateQty) {
              // Checks if the qty needs to be updated or is it through the item add to cart
              products[key] = val;
              quantity = docdata.quantity + val.qty;
            } else {
              products[key] = item.itemData;
              /* updates the total quantity on qty change */
              quantity = (docdata.quantity - val.qty) + item.qty; 
            }
            let currentPrice = item.itemData.price.mrp - item.itemData.price.discount;
            dataToWrite = {
              products: products,
              quantity,
              totalPrice:
                parseInt(doc.data().totalPrice, 10) -
                priceTobeDeductedFromTotalPrice +
                currentPrice * item.itemData.qty, // total price = mrp * quantity
            };
            console.log("this is data that is updated", {dataToWrite})
            return false;
          }
        });

        if (!productExist) {
          // Product does not exist
          products.push(item.itemData);
          dataToWrite = {
            products: products,
            quantity:doc.data().quantity+1,
            totalPrice:
              parseInt(doc.data().totalPrice, 10) +
             (item.itemData.price.mrp - item.itemData.price.discount) * item.itemData.qty,
          };
        }
 
        cart
          .doc(doc.id)
          .update(dataToWrite)
          .then((data) => {
            console.log("This is updated response",data);
            res.send("data updated");
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
        totalPrice: (item.itemData.price.mrp - item.itemData.price.discount),
        products: productList,
        userInfo: {
          uid: item.uid,
        },
        currency: "rupee",
      };
      cart
        .doc()
        .set(newCart)
        .then((recAdded) => {
          console.log("rec added rec added", recAdded);
          res.send("recored added");
        });
    }
  });
  // return res.send("bihar se aaya mera dost");
};

const deleteCartItem = async (cart, item, req, res) => {
  let response = [];
  console.log("product delete data at backend", item);
  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      // checks whether the user exist
      if (doc.data().userInfo.uid === item.uid) {
        console.log("inside same uer id",item);
        let tempProducts = doc.data().products;
        let updatedTotalprice = doc.data().totalPrice;
        let updatedQty = doc.data().quantity;
        let deductedMrp;
        lodash.forEach(tempProducts, (product, key) => {
          if(product){
            if (product._id === item.productId) {
              console.log("****PRODUCT ID EXIST*********");
            
            // doc.data().totalPrice = doc.data().totalPrice - product.price.discount;
              updatedQty = updatedQty - product.qty;
              deductedMrp = (product.price.mrp - product.price.discount) * product.qty;
              updatedTotalprice = updatedTotalprice - deductedMrp;
              console.log("checking updated price",updatedTotalprice)
              tempProducts.splice(key, 1);
              return false;
            }
        }
        });
        let doctoWrite = {
          products: tempProducts,
          quantity: updatedQty,
          totalPrice: updatedTotalprice,
        };
        console.log("This is doc to delete",doctoWrite)
        cart
          .doc(doc.id)
          .update(doctoWrite)
          .then((data) => {
            res.send("record deleted successfully");
          });
      }
    });
  });
};

exports.fetchCart = fetchCart;
exports.addCart = addCart;
exports.deleteCartItem = deleteCartItem;
