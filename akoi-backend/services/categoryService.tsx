const fetchCategories = async (Items, req, res) => {
  let response;
  let items = [];
  let macha = await Items.get().then((snapshot) => {
    if (req.query.catId) {
      console.log(req.query.catId);
      snapshot.docs.forEach((doc) => {
        console.log(Object.keys(doc.data()));
        if (Object.keys(doc.data()).length) {
          console.log(doc.data());
          if (doc.data().parent !== null) {
            if (doc.data().parent.includes(req.query.catId)) {
              items.push(doc.data());
            }
          }
        }
      });
    } else {
      snapshot.docs.forEach((doc) => {
        console.log(doc.data());
        if (doc.data().parent === null) {
          response = doc.data();
          items.push(response);
        }
      });
    }

    return res.send(items);
  });
};

exports.fetchCategories = fetchCategories;
