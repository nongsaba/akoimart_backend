const fetchCategories = async (Items, req, res) => {
  let response;
  let items = [];

  await Items.get().then((snapshot) => {
    if (req.query.catId) {
      snapshot.docs.forEach((doc) => {
        if (Object.keys(doc.data()).length) {
          let catData = doc.data();
          if (doc.data().parent !== null) {
            if (doc.data().parent.includes(req.query.catId)) {
              // Checking for category reuqested and sending only the category data
               if (catData.subCat) {
                items.push(catData);
              }
            }
          }
        }
      });
    } else {
      snapshot.docs.forEach((doc) => {
        // returns all the categories
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
