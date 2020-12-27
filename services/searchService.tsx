const SearchService = async (Item, req, res) => {
  let searchTerm = req.query.searchTerm.toLowerCase();
  let responseList = [];
  let response;
  await Item.get().then((itemSnapshot) => {
    itemSnapshot.docs.forEach((val, key) => {
      if (searchTerm && val.data().name) {
          if (val.data().name.toLowerCase().includes(searchTerm)) {
            responseList.push(val.data());
          }
      }
    });
  });
  if (responseList.length === 0) {
    response = "result not found";
  } else {
    response = responseList;
  }
  return res.send(response);
};

exports.searchService = SearchService;
