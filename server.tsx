const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const categoryList = require("./services/categoryService.tsx");
const itemList = require("./services/itemsService.tsx");
const cartModule = require("./services/cartService.tsx");
const searchService = require("./services/searchService.tsx");
const addressService = require("./services/addressService.tsx");
const orderService = require("./services/orderService.tsx");
const userService = require("./services/userService.tsx");
const cartList = cartModule.cartList;
const addCartItem = cartModule.addcart;

var cors = require("cors");
const app = express();
const port = process.env.PORT || 8888;
app.use(cors());
app.use(bodyParser.json());

var serviceAccount = require("./serviceAccount.json");
const { reduceEachLeadingCommentRange } = require("typescript");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://akoimart-b0188.firebaseio.com",
});
const db = admin.firestore();

app.get("/category", (req, res) => {
  let heirarchy = db.collection("itemsHeirarchy");
  categoryList.fetchCategories(heirarchy, req, res);
});

app.get("/items", (req, res) => {
  let Items = db.collection("items");
  let Price = db.collection("price");
  itemList.fetchItems(Items, Price, req, res);
});

app.get("/cart", (req, res) => {
  let cart = db.collection("cart");
  cartModule.fetchCart(cart, req, res);
});

app.post("/cart", (req, res) => {
  let cartItem = req.body;
  let cart = db.collection("cart");
  console.log(cartItem);
  cartModule.addCart(cart, cartItem, req, res);
});

app.put("/cart", (req, res) => {
  let item = req.body;
  let cart = db.collection("cart");
  cartModule.deleteCartItem(cart, item, req, res);
});
app.get("/search", (req, res) => {
  let items = db.collection("items");
  searchService.searchService(items, req, res);
});

app.get("/address", (req, res) => {
  let user = db.collection("user");
  addressService.fetchAddress(user, req, res);
});
app.put("/address", (req, res) => {
  let user = db.collection("user");
  addressService.updateAddress(user, req, res);
});
app.post("/address", (req, res) => {
  let user = db.collection("user");
  addressService.addAddress(user, req, res);
});
app.delete("/address", (req, res) => {
  let user = db.collection("user");
  addressService.deleteAddress(user, req, res);
});

app.post("/order", (req, res) => {
  let order = db.collection("order");
  let cart = db.collection("cart");
  let orderData = req.body;
  orderService.addOrder(order, orderData, cart, req, res);
});

app.post("/user", (req, res) => {
  let user = db.collection("user");
  let userData = req.body;
  userService.addUser(user, userData, req, res);
});
app.delete("/user", (req, res) => {
  let user = db.collection("user");
  let userData = req.body;
  userService.deleteUser(user, userData, req, res);
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
