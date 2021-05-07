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
       console.log(responseData.uid)
       console.log(uid)
      if (uid === responseData.uid ) {
        responseData.orderId = order.id;
        console.log("check order id id id", order.id);
        orderResponse.push(responseData);
      }
    });
    return res.send(orderResponse);
  });


};

const CancelOrder = async(order, req, res) =>{
  let id = req.body;
  console.log("checking query data",req.query)
  console.log("we need to hjeck the uid", id);
  let orderResponse = [];
  let responseData
  await order.get().then((ordersSnapshot) => {
    ordersSnapshot.docs.forEach((orderData) => {
      responseData = orderData.data();
      
      if (id.orderId === responseData.orderId && responseData.orderStatus !== "delivered") {
        responseData.orderStatus = "cancelled"
        console.log("check order id id id", order.id);
        
      }
      console.log("check order id id id outside", responseData);
      order
      .doc(orderData.id)
      .update(responseData)
      .then((data) => {
        res.send("record updated successfully");
      });
    });


  });
}

exports.addOrder = OrderService;
exports.getOrder = GetOrders;
exports.CancelOrder = CancelOrder;
