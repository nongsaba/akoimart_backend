const lodash = require("lodash");


const deliverChargeBasedOnRiceWeight = [
  {
    min:25,
    max:50,
    charge:50
  },
  {
    min:75,
    max:100,
    charge:100
  },
  {
    min:125,
    max:150,
    charge:150
  },
  {
    min:175,
    max:200,
    charge:200
  }
]

const calculateRiceDeliverCharge =(configData, weight,qty) =>{
  if(!weight && !qty){
   return 0;
  }
  let charge = 0;
  // configData.forEach((val, key)=>{
  //    if(weight >= val.min && weight <= val.max){
  //      charge = val.charge
  //    }
  // })
  return 50 * qty;
}


const fetchCart = async (cart, req, res) => {
  let uid = req.query.uid;
  let response = {};
  let items = [];
  let price = [];
  // fetched list of item from the cart
  if(uid){
  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      if (doc.data().userInfo.uid === uid) {
        console.log(doc.data());
        response = doc.data();
        items.push(response);
      }
    });
  });
}else{
  return res.send("user not logged in")
}
  return res.send(items);
};

const addCart = async (cart, item, req, res) => {

  let userExist = false;
  let dataToWrite = {};

  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc, index) => {
      let docdata = doc.data();

      if(!docdata.riceQty){ // For items where riceQty is undefined as it was added later
        docdata.riceQty = 0;
      }
      if(!docdata.riceWeight){// For items where riceWeight is undefined as it was added later
        docdata.riceWeight = 0;
      }

      // checks whther the user exist
      if (docdata.userInfo.uid === item.uid) {

        let products = doc.data().products;
        userExist = true;
        //docdata.quantity = docdata.quantity + 1; // add only 1 item to the cart quatity of items is mainained separately
        // checks if the item already is added
        let productExist = false;
        let quantity;
        let priceTobeDeductedFromTotalPrice;
        let rice_weight;
        let rice_qty = docdata.riceQty;
        let delivery_charge_for_rice_weight;
        lodash.forEach(products, (val, key) => {
          if (item.itemData._id === val._id) {
            priceTobeDeductedFromTotalPrice = val.qty * (val.price.mrp - val.price.discount); // to be deducted from the totalprice if the item is added
            productExist = true;
            if (!item.updateQty) {
              // Checks if the qty needs to be updated or is it through the item add to cart
              products[key] = val;
              quantity = docdata.quantity + val.qty;
             // console.log("This is the value that is executed",docdata.riceWeight)
              // Remove, modify later based on the requirement
             if(val.item_attributes){
                  if(val.item_attributes.weight === 25 || val.item_attributes.weight === 50){
                  //  if(docdata.rice_weight <= (val.item_attributes.weight * val.qty)){

                  //  }
                  // rice_weight = docdata.riceWeight - (val.item_attributes.weight * val.qty) // substracting previous weight from total rice weight
                  // console.log(rice_weight)
                  rice_weight = docdata.riceWeight + (val.item_attributes.weight * item.qty) // adding new weight to the total rice weight
                  rice_qty = docdata.riceQty + val.qty; 
                //  rice_weight += val.item_attributes.weight * val.qty ;
                  delivery_charge_for_rice_weight = calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight, rice_weight, rice_qty)
                }
           }
            } else {
              products[key] = item.itemData;
              /* updates the total quantity on qty change */
              quantity = (docdata.quantity - val.qty) + item.qty; 

              //check whether the item is 25 or 50 kg rice and adds rice weight and delivery_charge_for_rice_weight 
             // Remove, modify later based on the requirement
             if(val.item_attributes){
              if(val.item_attributes.weight === 25 || val.item_attributes.weight === 50){
              //  if(docdata.rice_weight <= (val.item_attributes.weight * val.qty)){

              //  }
              rice_weight = docdata.riceWeight - (val.item_attributes.weight * val.qty) // substracting previous weight from total rice weight
              rice_weight = rice_weight + (val.item_attributes.weight * item.qty) // adding new weight to the total rice weight
              rice_qty = (docdata.riceQty - val.qty) + item.qty; 
            //  rice_weight += val.item_attributes.weight * val.qty ;
              delivery_charge_for_rice_weight = calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight, rice_weight,rice_qty)
             }
            }
            }
            let currentPrice = item.itemData.price.mrp - item.itemData.price.discount;
            dataToWrite = {
              products: products,
              quantity,
              riceWeight:rice_weight,
              deliveryChargeForRiceWeight:delivery_charge_for_rice_weight,
              riceQty:rice_qty ? rice_qty : 0,
              totalPrice:
                parseInt(doc.data().totalPrice, 10) -
                priceTobeDeductedFromTotalPrice +
                currentPrice * item.itemData.qty, // total price = mrp * quantity
            };
            console.log("this is data that is updated", {dataToWrite})
            return false;
          }
        });

        let tempRiceWeight = 0;
        let tempRiceQty = 0;
        // if(!docdata.riceQty){ // For items where riceQty is undefined as it was added later
        //   docdata.riceQty = 0;
        // }
        // if(!docdata.riceWeight){// For items where riceWeight is undefined as it was added later
        //   docdata.riceWeight = 0;
        // }
        if(item.itemData.item_attributes){
          tempRiceWeight = docdata.riceWeight + (item.itemData.item_attributes.weight * item.itemData.qty )
          tempRiceQty = docdata.riceQty + 1; 
        }else{
          tempRiceQty = docdata.riceQty ;
        }
        console.log("product does not exist",item.itemData)
        if (!productExist) {
          // Product does not exist
          products.push(item.itemData);
          let qtyTobeUsed = doc.data().quantity+1;
          dataToWrite = {
            products: products,
            riceWeight:tempRiceWeight,
            deliveryChargeForRiceWeight:calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight,tempRiceWeight,tempRiceQty),
            riceQty:tempRiceQty,
            quantity:qtyTobeUsed,
            totalPrice:
              parseInt(doc.data().totalPrice, 10) +
             (item.itemData.price.mrp - item.itemData.price.discount) * item.itemData.qty,
          };
        }
 
        cart
          .doc(doc.id)
          .update(dataToWrite)
          .then((data) => {
            console.log("This is updated response",data);
            res.send("data updated");
          })
          .catch((e) => {
            console.log("error error", e);
          });
      }
    });
    if (!userExist) {
      console.log("***USER DOES NOT EXIST****");
      // Adding a new cart for new user
      let productList = [];
      let riceWeight = 0;
      if(item.itemData.item_attributes){
        riceWeight = item.itemData.item_attributes.weight * item.itemData.qty 
      }
      productList.push(item.itemData);
      let newCart = {
        quantity: 1,
        riceQty:1,
        riceWeight:riceWeight,
        deliveryChargeForRiceWeight:calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight, riceWeight, 1),
        totalPrice: (item.itemData.price.mrp - item.itemData.price.discount),
        products: productList,
        userInfo: {
          uid: item.uid,
        },
        currency: "rupee",
      };
      cart
        .doc()
        .set(newCart)
        .then((recAdded) => {
          console.log("rec added rec added", recAdded);
          res.send("recored added");
        });
    }
  });
  // return res.send("bihar se aaya mera dost");
};

const deleteCartItem = async (cart, item, req, res) => {
  let response = [];
  console.log("product delete data at backend", item);
  await cart.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      // checks whether the user exist
      if (doc.data().userInfo.uid === item.uid) {
        console.log("inside same uer id",item);
        let tempProducts = doc.data().products;
        let updatedTotalprice = doc.data().totalPrice;
        let updatedQty = doc.data().quantity;
        let riceQty = doc.data().riceQty;
        //const {riceWeight,deliveryChargeForRiceWeight} =  doc.data()
        let deductedMrp;
        let rice_weight,delivery_charge_for_rice_weight;
        lodash.forEach(tempProducts, (product, key) => {
          if(product){
            if (product._id === item.productId) {
              console.log("****PRODUCT ID EXIST*********");
            
            // doc.data().totalPrice = doc.data().totalPrice - product.price.discount;
              updatedQty = updatedQty - product.qty;
              deductedMrp = (product.price.mrp - product.price.discount) * product.qty;
              updatedTotalprice = updatedTotalprice - deductedMrp;

            //check whether the item is 25 or 50 kg rice and adds rice weight and delivery_charge_for_rice_weight 
             // Remove, modify later based on the requirement
             if(product.item_attributes ){ 
               if(product.item_attributes.weight === 25 || product.item_attributes.weight === 50){
                rice_weight = doc.data().riceWeight - (product.item_attributes.weight * product.qty) // substracting previous weight from total rice weight
                riceQty = riceQty - product.qty;
                // rice_weight = rice_weight + (val.item_attributes.weight * item.qty) // adding new weight to the total rice weight
                // rice_weight += val.item_attributes.weight * val.qty ;
                delivery_charge_for_rice_weight = calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight, rice_weight,riceQty)
            }
          }
              console.log("checking updated price",updatedTotalprice)
              tempProducts.splice(key, 1);
              return false;
            }
        }
        });
        let doctoWrite = {
          products: tempProducts,
          quantity: updatedQty,
          riceQty,
          riceWeight:rice_weight ? rice_weight : 0,
          deliveryChargeForRiceWeight:delivery_charge_for_rice_weight? delivery_charge_for_rice_weight:0,
          totalPrice: updatedTotalprice,
        };
        console.log("This is doc to delete",doctoWrite)
        cart
          .doc(doc.id)
          .update(doctoWrite)
          .then((data) => {
            res.send("record deleted successfully");
          });
      }
    });
  });
};

exports.fetchCart = fetchCart;
exports.addCart = addCart;
exports.deleteCartItem = deleteCartItem;
