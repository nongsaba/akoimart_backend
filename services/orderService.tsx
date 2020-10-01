const OrderService = async (order, orderData, cart, req, res) => {
  let uid = req.query.uid;
  let responseList = [];
  await order
    .doc()
    .set(orderData)
    .then((data) => {
      console.log("order data", data);
      cart.get().then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          console.log("inside cart");
          console.log(doc.data().uid);
          console.log(orderData.uid);
          if (doc.data().userInfo.uid === orderData.uid) {
            let cartProduct = doc.data();
            cartProduct.products = [];
            cartProduct.quantity = 0;
            cartProduct.totalPrice = 0;
            cart // clearing the cart data after the order is successful
              .doc(doc.id)
              .update(cartProduct)
              .then((data) => {
                console.log("cart cleared");
              });
          }
        });
      });
    });
  return res.send("order inserted successfully");
};

exports.addOrder = OrderService;
