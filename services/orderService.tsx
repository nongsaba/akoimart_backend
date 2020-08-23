const OrderService = async (order, orderData, req, res) => {
  let uid = req.query.uid;
  let responseList = [];
  await order
    .doc()
    .set(orderData)
    .then((data) => {
      console.log("order data", data);
    });
  return res.send("order inserted successfully");
};

exports.addOrder = OrderService;
