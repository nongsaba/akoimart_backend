const SearchService = async (Item, req, res) => {
  let searchTerm = req.query.searchTerm;

  let responseList = [];
  await Item.get().then((itemSnapshot) => {
    itemSnapshot.docs.forEach((val, key) => {
      if (searchTerm) {
        if (val.data().name.toLowerCase().includes(searchTerm.toLowerCase())) {
          responseList.push(val.data());
        }
      }
    });
  });
  return res.send(responseList);
};

exports.searchService = SearchService;
