import React from "react";
import "./index.scss";
import { connect } from "react-redux";

const Communications = ({ communications }) => {
  return (
    <div className="communications">
      {/* 在这里你可以使用 communications 状态 */}
      <pre>{JSON.stringify(communications, null, 2)}</pre>
    </div>
  );
};

// 映射 Redux state 到组件的 props
const mapStateToProps = (state) => ({
  communications: state.communications,
});

// 映射 dispatch 到组件的 props
const mapDispatchToProps = (dispatch) => ({});

// 使用 connect 连接 Redux 和组件
export default connect(mapStateToProps, mapDispatchToProps)(Communications);
