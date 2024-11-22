import React, { useEffect, useMemo, useState } from "react";
import AppTop from "@src/app/app-top/index";
import "./app.css";
import MainRouter from "@src/route/index";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { rootReducer } from "../../store/reducer/index.js";
const App = () => {
  const [store, setStore] = useState(null);
  useEffect(() => {
    // 接收初始化状态
    window.ipcR.onInitializeState((initialState) => {
      const newStore = createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk)
      ); // 使用更新后的状态创建 Store
      newStore.uniqueIdentifier = Math.random().toString(36).substring(7);
      setStore(newStore);
    });
    window.ipcR.onStoreUpdated((action) => {
      setStore((prevStore) => {
        prevStore.dispatch(action);
        return prevStore;
      });
    });
  }, []);
  if (!store) return null;
  return (
    <Provider store={store}>
      <MainRouter>
        <AppTop></AppTop>
      </MainRouter>
    </Provider>
  );
};

export default App;
