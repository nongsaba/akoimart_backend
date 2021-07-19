const fetchItems = async (Items, Price, req, res) => {
  let response = {};
  let items = [];
  let price = [];
  let itemsCount = 0
  console.log(req.query.popular)
  console.log(req.query.catId )
  console.log(req.query.discount)
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
  } 
  // Executes when catId is there and discount is 0 or undefined

  if(req.query.catId && (parseInt(req.query.discount, 10) <= 0 || !req.query.discount )){
    let category = req.query.catId;
    let pageOffset = req.query.offset;
    let catArray = []
    catArray.push(category)
  //  console.log("discount with cat id")
    await Items.where(`category`,"array-contains-any",catArray).orderBy('lname').get().then((snapshot) => {
      itemsCount = snapshot.docs.length;
    });
    
    await Items.where(`category`,"array-contains-any",catArray).orderBy('lname').limit(10).offset(parseInt(pageOffset,10)).get().then((snapshot) => {
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

  // if(req.query.catId && req.query.discount <= 0 ){
  //   console.log("discount with cat id 2")
  //   let category = req.query.catId;
  //   let pageOffset = req.query.offset;
  //   await Items.where('category','==',category).orderBy('lname').get().then((snapshot) => {
  //     itemsCount = snapshot.docs.length;
  //   });
  //   await Items.where('category','==',category).orderBy('lname').limit(10).offset(parseInt(pageOffset,10)).get().then((snapshot) => {
  //     snapshot.docs.forEach((doc) => {
  //      // console.log("checking for items", doc.data());
  //       response = doc.data();
  //       response["_id"] = doc.id;
  //     //  console.log("this is response", response);
  //      // if (response["category"] === category) {
  //         items.push(response);
  //      // }
  //     });
  //   });
  // }
  // Executes when catId is there and discount > 0 
  if(req.query.catId && parseInt(req.query.discount,10) > 0 ){
   // console.log("discount with cat id 3")
    let catArray = [];
    if(Array.isArray(req.query.catId)){
      catArray = req.query.catId;
    }else{
      catArray.push(req.query.catId)
    }
    // if cat ID is undefined
    let discount = req.query.discount
    let category = req.query.catId;
    let pageOffset = req.query.offset;
   // console.log("discount with cat id")
    // await Items.where(`category.${category}`,'==',true).where("price.discountPercent",">=",discount).orderBy('price.discountPercent').get().then((snapshot) => {
    //   itemsCount = snapshot.docs.length;
    // });
     let priceTemp = `price.discountPercent`;
     let cat2 = `category.political_science`;
     //Items = await Items.where(`category.${category}`,"==",true);
     Items = await Items.where(`category`,"array-contains-any",catArray).where(priceTemp,">=",parseInt(discount,10));
   //  Items = await Items.where(`category.books`,"==",true).where(`category.chemistry`,"==",true);
    // Items = await Items.where(`category.political_science`,"==",true);
   //  Items = await Items.where(priceTemp,">=",parseInt(discount,10));
    await Items.limit(10).offset(parseInt(pageOffset,10)).get().then((snapshot) => {
      itemsCount = snapshot.docs.length;
      snapshot.docs.forEach((doc) => {
       // console.log("checking for items", doc.data());
        response = doc.data();
        response["_id"] = doc.id;
        console.log("inside log log", response)
      //  console.log("this is response", response);
       // if (response["category"] === category) {
          items.push(response);
       // }
      });
    });


    // add category later
    // await Items.get().then((snapshot) => {
   
    //   snapshot.docs.forEach((doc) => {
    //     itemsCount = snapshot.docs.length;
    //    // console.log("checking for items", doc.data());
    //     response = doc.data();
    //     response["_id"] = doc.id;
    //    // items.push(response);
    //   //  console.log("this is response", response);
    //    // if (response["category"] === category) {
    //      if(response["price"] && response["price"].discountPercent > discount){
    //       items.push(response);
    //      }
    //    // }
    //   });
    // });

  }

  if(req.query.popular){
    let discount = req.query.discount
    // add category later
    await Items.get().then((snapshot) => {
   
      snapshot.docs.forEach((doc) => {
        itemsCount = snapshot.docs.length;
       // console.log("checking for items", doc.data());
        response = doc.data();
        response["_id"] = doc.id;
       // items.push(response);
      //  console.log("this is response", response);
       // if (response["category"] === category) {
         if(response["popular"]){
          items.push(response);
         }
       // }
      });
    });
  }

 response = {
   items,
   meta:{
     count:itemsCount
   }
 }
  return res.send(response);
};

exports.fetchItems = fetchItems;
