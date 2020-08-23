const AddressService = async (Item, req, res) => {
  let uid = req.query.uid;
  let responseList = [];
  await Item.get().then((itemSnapshot) => {
    itemSnapshot.docs.forEach((val, key) => {
      if (uid) {
        if (val.data().uid === uid) {
          responseList.push(val.data().address);
        }
      }
    });
  });
  return res.send(responseList);
};

exports.fetchAddress = AddressService;
