// import { createStore, applyMiddleware } from "redux";
// import thunk from "redux-thunk";
// import { rootReducer, initialState } from "./reducer/index.js";

const { createStore, applyMiddleware } = require("redux");
const thunk = require("redux-thunk").default;
const { rootReducer, initialState } = require("../../store/reducer/index.js");

// 创建 store
// let store = createStore(rootReducer, initialState, applyMiddleware(thunk));
let store;

const createStoreIfNotExists = () => {
  if (!store) {
    store = createStore(rootReducer, initialState, applyMiddleware(thunk));
    store.uniqueIdentifier = Math.random().toString(36).substring(7);
  }
  return store;
};
module.exports = createStoreIfNotExists();

