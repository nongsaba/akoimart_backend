const fetchItems = async (Items, Price, req, res) => {
  let response = {};
  let items = [];
  let price = [];
  let itemsCount = 0
  if (req.query.itemId) {
    await Items.get().then((priceSnapshot) => {
      // Fetches items based on item id
      console.log("check for ite ID",req.query.itemId)
      priceSnapshot.docs.forEach((doc) => {
        console.log(doc.id)
        if (doc.id == req.query.itemId) {
          response = doc.data();
          response["_id"] = doc.id;
          items.push(response);
        }
      });
    });
  } else if (req.query.catId) {
    let category = req.query.catId;
    let pageOffset = req.query.offset;
    console.log("check for page offset", pageOffset)
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
  }
 // console.log("to be sent", items);
 response = {
   items,
   meta:{
     count:itemsCount
   }
 }
  return res.send(response);
};

exports.fetchItems = fetchItems;
