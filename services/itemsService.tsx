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
  } else {
    await Items.get().then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        console.log(doc.data());
        response = doc.data();
        response["_id"] = doc.id;
        console.log("this is response", response);
        items.push(response);
      });
    });
  }
  return res.send(items);
};

exports.fetchItems = fetchItems;
