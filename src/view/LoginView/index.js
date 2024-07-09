import "./index.scss";
import React, { useEffect } from "react";
import CodeInput from "@src/components/CodeInput/index";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useHistory } from "react-router-dom";

const LoginView = () => {
  let history = useHistory();

  let [form] = Form.useForm();

  const onFinish = (values) => {
    history.push("/HomeView");
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  useEffect(() => {
    console.log("ipcAppPath", window.ipcR.ipcAppPath());
    return () => {
      form = false;
    };
  }, []);
  return (
    <>
      <div className="login-view">
        <div className="login-view-main">
          <div className="login-view-main-left"></div>
          <div className="login-view-main-right">
            <Form
              name="basic"
              form={form}
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: "用户名不能为空" }]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                />
              </Form.Item>
              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: "密码不能为空" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                />
              </Form.Item>
              <Form.Item label="验证码">
                <CodeInput form={form}></CodeInput>
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginView;
