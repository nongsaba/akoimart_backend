const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const categoryList = require("./services/categoryService.tsx");
const itemList = require("./services/itemsService.tsx");
const cartModule = require("./services/cartService.tsx");
const searchService = require("./services/searchService.tsx");
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

app.get("/search", (req, res) => {
  let items = db.collection("items");
  searchService.searchService(items, req, res);
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
