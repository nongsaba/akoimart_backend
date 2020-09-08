//import lodash from 'lodash';

const AddUser = async (user, userData, req, res) => {
  // fetched list of item from the cart
  await user
    .doc()
    .set(userData)
    .then((user) => {
      return res.send("user added");
    });
};

const Logout = async (user, userData, req, res) => {
  // fetched list of item from the cart
  let uid = userData.uid;
  await user.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      if (doc.data().uid === uid) {
        user
          .doc(doc.id)
          .delete()
          .then((data) => {
            console.log("logged out", data);
            res.send("user logged out");
          });
      }
    });
  });
};

exports.addUser = AddUser;
exports.deleteUser = Logout;
