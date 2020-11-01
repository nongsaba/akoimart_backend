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

const GetOrders = async (order, req, res) => {
  let uid = req.query.uid;
  console.log("we need to hjeck the uid", uid);
  let orderResponse = [];
  await order.get().then((ordersSnapshot) => {
    ordersSnapshot.docs.forEach((order) => {
      let responseData = order.data();
      
      if (uid === responseData.uid && responseData.orderStatus === "pending") {
        responseData.orderId = order.id;
        console.log("check order id id id", order.id);
        orderResponse.push(responseData);
      }
    });
  });

  return res.send(orderResponse);
};

exports.addOrder = OrderService;
exports.getOrder = GetOrders;
