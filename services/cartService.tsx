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
      if(!docdata.rice25and50KgTotalPrice){// For items where rice25and50Kg is undefined as it was added later
        docdata.rice25and50KgTotalPrice= 0;
      }

      // checks whther the user exist
      if (docdata.userInfo.uid === item.uid) {

        let products = doc.data().products;
        userExist = true;
        //docdata.quantity = docdata.quantity + 1; // add only 1 item to the cart quatity of items is mainained separately
        // checks if the item already is added
        let productExist = false;
        let quantity = docdata.quantity;
        let priceTobeDeductedFromTotalPrice;

        // Below 4 variables are for 25 aND 50 kg rice setting the vaues to default db values
        let rice_weight = docdata.riceWeight;
        let rice_qty = docdata.riceQty;
        let delivery_charge_for_rice_weight = docdata.deliveryChargeForRiceWeight;
        let riceTotalPrice25and50kg = docdata.rice25and50KgTotalPrice;

        lodash.forEach(products, (val, key) => {
          if (item.itemData._id === val._id) {
            priceTobeDeductedFromTotalPrice = val.qty * (val.price.mrp - val.price.discount); // to be deducted from the totalprice if the item is added
            let currentPrice = item.itemData.price.mrp - item.itemData.price.discount; // Actual price of the item
            productExist = true;
            if (!item.updateQty) {
              // Checks if the qty needs to be updated or is it through the item added from item section to cart
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
              /* updates the total quantity on qty change in the cart section */
              quantity = (docdata.quantity - val.qty) + item.qty; 

              //check whether the item is 25 or 50 kg rice and adds rice weight and delivery_charge_for_rice_weight 
             // Remove, modify later based on the requirement
             if(val.item_attributes){
              if(val.item_attributes.weight === 25 || val.item_attributes.weight === 50){
              //  if(docdata.rice_weight <= (val.item_attributes.weight * val.qty)){

              //  }
              let tmp_rice_weight = docdata.riceWeight - (val.item_attributes.weight * val.qty) // substracting previous weight from total rice weight
              rice_weight = tmp_rice_weight + (val.item_attributes.weight * item.qty) // adding new weight to the total rice weight
              rice_qty = (docdata.riceQty - val.qty) + item.qty; 
              riceTotalPrice25and50kg = docdata.rice25and50KgTotalPrice - priceTobeDeductedFromTotalPrice + (currentPrice * item.itemData.qty);
            //  rice_weight += val.item_attributes.weight * val.qty ;
              delivery_charge_for_rice_weight = calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight, rice_weight,rice_qty)
             }
            }
            }

            dataToWrite = {
              products: products,
              quantity,
              riceWeight:rice_weight ? rice_weight  : 0,
              deliveryChargeForRiceWeight:delivery_charge_for_rice_weight,
              rice25and50KgTotalPrice:riceTotalPrice25and50kg,
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
          riceTotalPrice25and50kg = docdata.rice25and50KgTotalPrice + (item.itemData.price.mrp - item.itemData.price.discount) * item.itemData.qty
          tempRiceQty = docdata.riceQty + 1; 
        }else{
          tempRiceQty = docdata.riceQty ;
          tempRiceWeight = docdata.riceWeight;
          riceTotalPrice25and50kg = docdata.rice25and50KgTotalPrice;
          console.log("product does not exist",riceTotalPrice25and50kg)
        }
      
        if (!productExist) {
          // Product does not exist
          products.push(item.itemData);
          let qtyTobeUsed = doc.data().quantity+item.itemData.qty;
          dataToWrite = {
            products: products,
            riceWeight:tempRiceWeight,
            deliveryChargeForRiceWeight:calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight,tempRiceWeight,tempRiceQty)?calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight,tempRiceWeight,tempRiceQty):0,
            riceQty:tempRiceQty,
            rice25and50KgTotalPrice:riceTotalPrice25and50kg,
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
      let rice25and50KgTotalPrice = 0;
      let riceQty = 0;
      if(item.itemData.item_attributes){ // If the item is rice 25 and 50 kgs add the below keys to get the extra delivery charge
        riceWeight = item.itemData.item_attributes.weight * item.itemData.qty 
        rice25and50KgTotalPrice = item.itemData.price.mrp - item.itemData.price.discount; 
        riceQty = 1;
      }
      productList.push(item.itemData);
      let newCart = {
        quantity: item.qty,
        riceQty,
        riceWeight:riceWeight,
        deliveryChargeForRiceWeight:calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight, riceWeight, 1),
        rice25and50KgTotalPrice,
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
        let rice25and50KgTotalPrice = doc.data().rice25and50KgTotalPrice
        //const {riceWeight,deliveryChargeForRiceWeight} =  doc.data()
        let deductedMrp;
        let rice_weight = doc.data().riceWeight;
        let delivery_charge_for_rice_weight = doc.data().deliveryChargeForRiceWeight;
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
                rice25and50KgTotalPrice = rice25and50KgTotalPrice - (product.price.mrp - product.price.discount) * product.qty;
                // rice_weight = rice_weight + (val.item_attributes.weight * item.qty) // adding new weight to the total rice weight
                // rice_weight += val.item_attributes.weight * val.qty ;

                delivery_charge_for_rice_weight = doc.data().deliveryChargeForRiceWeight - calculateRiceDeliverCharge(deliverChargeBasedOnRiceWeight, rice_weight,product.qty)

                if(riceQty === 0 && rice_weight === 0){ // Executes when there is no rice of 25 and 50 kg in the cart
                  delivery_charge_for_rice_weight = 0
                }

            }
          }
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
          rice25and50KgTotalPrice,
          deliveryChargeForRiceWeight:delivery_charge_for_rice_weight ? delivery_charge_for_rice_weight:0,
          totalPrice: updatedTotalprice,
        };
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
