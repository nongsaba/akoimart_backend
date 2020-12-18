const fetchItems = async (Items, Price, req, res) => {
  let response = {};
  let items = [];
  let price = [];
  let itemsCount = 0
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
  } else if(req.query.catId && req.query.discount === undefined){
    let category = req.query.catId;
    let pageOffset = req.query.offset;
    await Items.where('category','==',category).orderBy('lname').get().then((snapshot) => {
      itemsCount = snapshot.docs.length;
      snapshot.docs.forEach((doc) => {
       // console.log("checking for items", doc.data());
      //   response = doc.data();
      //   response["_id"] = doc.id;
      // //  console.log("this is response", response);
      //   if (response["category"] === category) {
      //     items.push(response);
      //   }
      });
    });
    await Items.where('category','==',category).orderBy('lname').limit(10).offset(parseInt(pageOffset,10)).get().then((snapshot) => {
      snapshot.docs.forEach((doc) => {
       // console.log("checking for items", doc.data());
        response = doc.data();
        response["_id"] = doc.id;
      //  console.log("this is response", response);
       // if (response["category"] === category) {
          items.push(response);
       // }
      });
    });
  }else if(req.query.discount){
    // if cat ID is undefined
    let discount = req.query.discount
    // add category later
    await Items.get().then((snapshot) => {
      snapshot.docs.forEach((doc) => {
       // console.log("checking for items", doc.data());
        response = doc.data();
        response["_id"] = doc.id;
       // items.push(response);
      //  console.log("this is response", response);
       // if (response["category"] === category) {
         if(response["price"] && response["price"].discountPercent > discount){
          items.push(response);
         }
       // }
      });
    });

  }
 // console.log("to be sent", items);
 response = {
   items,
   meta:{
     count:items.length
   }
 }
  return res.send(response);
};

exports.fetchItems = fetchItems;
