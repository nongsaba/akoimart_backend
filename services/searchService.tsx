const SearchService = async (Item, req, res) => {
  let searchTerm = req.query.searchTerm;

  let responseList = [];
  let response;
  await Item.get().then((itemSnapshot) => {
    itemSnapshot.docs.forEach((val, key) => {
      if (searchTerm) {
        if (val.data().name.toLowerCase().includes(searchTerm.toLowerCase())) {
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
