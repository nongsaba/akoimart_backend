const _ = require("lodash");

const AddressService = async (Item, req, res) => {
  let uid = req.query.uid;
  let responseList = [];
  let responseObj = {};
  await Item.get().then((itemSnapshot) => {
    itemSnapshot.docs.forEach((val, key) => {
      if (uid) {
        if (val.data().uid === uid) {
          console.log("uid checked uid checked");
          responseObj["fname"] = val.data().fname;
          responseObj["lname"] = val.data().lname;
          responseObj["mobileNumber"] = val.data().mobileNumber;
          responseObj["addresses"] = val.data().address;
          responseObj["_id"] = val.id;
          responseList.push(responseObj);
        }
      }
    });
  });
  console.log("address", responseObj);
  return res.send(responseList);
};

const UpdateAddress = async (Item, req, res) => {
  let uid = req.query.uid;
  let data = req.body;
  let dataToWrite = { address: { adresses: [] } };
  let addressList = [];

  await Item.get().then((itemSnapshot) => {
    itemSnapshot.docs.forEach((val, key) => {
      if (uid) {
        addressList = val.data().address.adresses;
        let keyExist = false;
        if (val.data().uid === uid) {
          if (data.index >= 0) {
            _.forEach(addressList, (innerval, key) => {
              if (key === data.index) {
                addressList[key] = Object.assign({}, innerval, data);
                keyExist = true;
              } else {
                addressList[key]["selected"] = false;
              }
            });
          }

          // addressList.push(address);
          if (!keyExist) {
            _.forEach(addressList, (innerval, key) => {
              addressList[key]["selected"] = false;
            });
            addressList.push(data);
          }
          dataToWrite = {
            address: { adresses: addressList },
          };
          if (data._id) {
            if (data._id === val.id) {
              Item.doc(val.id)
                .update(dataToWrite)
                .then((success) => {
                  console.log("address updated", success);
                  res.send(success);
                });
            }
          } else {
            Item.doc(val.id)
              .update(dataToWrite)
              .then((success) => {
                console.log("Address added", success);
                res.send(success);
              });
          }
        }
      }
    });
  });
};

const DeleteAddress = async (Item, req, res) => {
  let uid = req.query.uid;
  let data = req.body.inputParam;
  let dataToWrite = { address: { adresses: [] } };
  let addressList = [];
  console.log("delete triggerred", data);
  await Item.get().then((itemSnapshot) => {
    itemSnapshot.docs.forEach((item, key) => {
      addressList = item.data().address.adresses;
      if (item.data().uid === uid) {
        if (data.index >= 0) {
          _.forEach(addressList, (innerval, key) => {
            if (key === data.index) {
              addressList.splice(key, 1);
              return false;
            }
          });
        }
        dataToWrite = {
          address: { adresses: addressList },
        };
      }
      Item.doc(item.id)
        .update(dataToWrite)
        .then((success) => {
          console.log("Address deleted", success);
          res.send(success);
        });
    });
  });
};

// const AddAddress = async (Item, req, res) => {
//   let uid = req.query.uid;
//   let data = req.body;
//   let dataToWrite = { address: { adresses: [] } };
//   let addressList = [];

//   await Item.get().then((itemSnapshot) => {
//     itemSnapshot.docs.forEach((val, key) => {
//       if (uid) {
//         addressList = val.data().address.adresses;

//         if (val.data().uid === uid) {
//           _.forEach(addressList, (innerval, key) => {
//             if (key === data.index) {
//               addressList[key] = Object.assign({}, innerval, data);
//               console.log(999999, innerval);
//             }
//           });
//         }
//         // addressList.push(address);
//         dataToWrite = {
//           address: { adresses: addressList },
//         };

//       }
//     });
//     Item.doc()
//     .add(dataToWrite)
//     .then((success) => {
//       console.log("loaded loaded loaded", success);
//       res.send(success);
//     });
//   });
// };

exports.fetchAddress = AddressService;
exports.updateAddress = UpdateAddress;
exports.deleteAddress = DeleteAddress;
