const fetchItems = async (Items, Price, req, res) => {
  let response = {};
  let items = [];
  let price = [];

  if (req.query.itemId) {
    await Items.get().then((priceSnapshot) => {
      // Fetches items based on item id
      priceSnapshot.docs.forEach((doc) => {
        if (doc.id == req.query.itemId) {
          response = doc.data();
          response["_id"] = doc.id;
          items.push(response);
        }
      });
    });
  } else if (req.query.catId) {
    let category = req.query.catId;
    await Items.get().then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        console.log("checking for items", doc.data());
        response = doc.data();
        response["_id"] = doc.id;
        console.log("this is response", response);
        if (response["category"] === category) {
          items.push(response);
        }
      });
    });
  }
  console.log("to be sent", items);
  return res.send(items);
};

exports.fetchItems = fetchItems;
