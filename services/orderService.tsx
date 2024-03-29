const OrderService = async (order, orderData, cart, req, res) => {
  let uid = req.query.uid;
  let responseList = [];
  await order
    .doc()
    .set(orderData)
    .then((data) => {
      // console.log("order data", data);
      cart.get().then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          if (doc.data().userInfo && doc.data().userInfo.uid === orderData.uid) {
            let cartProduct = doc.data();
            cartProduct.products = [];
            cartProduct.quantity = 0;
            cartProduct.totalPrice = 0;
            cartProduct.riceWeight = 0;
            cartProduct.riceQty = 0;
            cartProduct.deliveryChargeForRiceWeight = 0;
            cartProduct.rice25and50KgTotalPrice = 0;
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
  let orderResponse = [];
  await order.get().then((ordersSnapshot) => {
    ordersSnapshot.docs.forEach((order) => {
      let responseData = order.data();
      //  console.log(responseData.uid)
      //  console.log(uid)
      if (uid === responseData.uid ) {
        responseData.orderId = order.id;
        orderResponse.push(responseData);
      }
    });
    return res.send(orderResponse);
  });


};

const CancelOrder = async(order, req, res) =>{
  let id = req.body.id;

  let responseData
  let docId;
  await order.get().then((ordersSnapshot) => {
          ordersSnapshot.docs.forEach((orderData) => {
            responseData = orderData.data();
                  // if (id === orderData.id && (responseData.orderStatus.toLowerCase() === "cancelled" || responseData.orderStatus.toLowerCase() === "out for delivery")) {
                  //      console.log("cancel order")
                  //      return res.send("Order already cancelled")               
                  // }
                  if (id === orderData.id) {              
                      docId = orderData.id;
                      responseData.orderStatus = "cancelled";    

                      order
                      .doc(orderData.id)
                      .update(responseData)
                      .then((data) => {
                      return res.send("record updated successfully");
                    }).catch((e)=>{
                      console.log("error",e)
                      return res.send("There is an error while updating")
                    });                
                  }
             
       });

  });    

}

exports.addOrder = OrderService;
exports.getOrder = GetOrders;
exports.CancelOrder = CancelOrder;
