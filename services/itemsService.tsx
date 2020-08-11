const fetchItems = async (Items, Price, req, res) => {
  let response = {};
  let items = [];
  let price = [];

  if (req.query.itemId) {
    console.log(req.query.itemId);
    await Items.get().then((priceSnapshot) => {
      priceSnapshot.docs.forEach((doc) => {
        if (doc.data().id == req.query.itemId) {
          items.push(doc.data());
        }
      });
    });
  } else {
    await Items.get().then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        console.log(doc.data());

        response = doc.data();
        items.push(response);
      });
    });
  }
  return res.send(items);
};

exports.fetchItems = fetchItems;
