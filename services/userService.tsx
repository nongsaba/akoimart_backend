//import lodash from 'lodash';

const AddUser = async (user, userData, req, res) => {
  // fetched list of item from the cart
  let uid = userData.uid;

  await user.get().then((snapshot) => {
    let userExist = false;
    snapshot.docs.forEach((doc) => {
      console.log(uid);
      console.log(doc.data().uid);
      if (doc.data().uid === uid) {
        userExist = true;
      }
    });

    if (!userExist) {
      console.log("user exist user exist");
      user
        .doc()
        .set(userData)
        .then((user) => {
          return res.send("user added");
        });
    }
    return "existing user";
  });
};

// const Logout = async (user, userData, req, res) => {
//   // fetched list of item from the cart
//   let uid = userData.uid;
//   await user.get().then((snapshot) => {
//     snapshot.docs.forEach((doc) => {
//       if (doc.data().uid === uid) {
//         user
//           .doc(doc.id)
//           .delete()
//           .then((data) => {
//             console.log("logged out", data);
//             res.send("user logged out");
//           });
//       }
//     });
//   });
// };

const Logout = async (user, userData, req, res) => {
  // fetched list of item from the cart
  let uid = userData.id;
  await user.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      if (uid === doc.id) {
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
