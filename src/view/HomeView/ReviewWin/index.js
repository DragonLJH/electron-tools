import React, { useEffect, useRef, useState, forwardRef } from "react";
import "./index.scss";
import DInputBox from "@src/components/DInputBox";
import ConfigForm from "@src/components/DConfigForm";
const ReviewWin = () => {
  const formConfig = [
    {
      order: 1,
      key: "username",
      label: "用户名",
      inputType: "text",
      readOnly: false,
      required: true,
      caption: "请输入 3-10 位字母或数字",
      value: "",
      rules: [
        { required: true, message: "用户名必填" },
        { pattern: /^[a-zA-Z0-9_]{3,10}$/, message: "3-10 位字母、数字或下划线" },
      ],
    },
    {
      order: 2,
      key: "password",
      label: "密码",
      inputType: "text",
      readOnly: false,
      required: true,
      caption: "至少 6 位，包含字母和数字",
      value: "",
      rules: [
        { required: true, message: "密码必填" },
        { pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/, message: "密码至少 6 位，且包含字母和数字" },
      ],
    },
    {
      order: 3,
      key: "age",
      label: "年龄",
      inputType: "number",
      readOnly: false,
      required: true,
      caption: "请输入年龄（18-65）",
      value: "",
      rules: [
        { required: true, message: "年龄必填" },
        {
          validator: (val) => {
            const num = parseInt(val, 10);
            return num >= 18 && num <= 65;
          },
          message: "年龄必须在 18 到 65 之间",
        },
      ],
    },
    {
      order: 4,
      key: "gender",
      label: "性别",
      inputType: "radio",
      readOnly: false,
      required: true,
      caption: "",
      value: "",
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
        { label: "其他", value: "other" },
      ],
      rules: [{ required: true, message: "请选择性别" }],
    },
    {
      order: 5,
      key: "hobbies",
      label: "兴趣爱好",
      inputType: "checkbox",
      readOnly: false,
      required: false,
      caption: "可多选",
      value: [],
      options: [
        { label: "运动", value: "sport" },
        { label: "音乐", value: "music" },
        { label: "阅读", value: "reading" },
        { label: "旅行", value: "travel" },
      ],
    },
    {
      order: 6,
      key: "birthday",
      label: "生日",
      inputType: "date",
      readOnly: false,
      required: true,
      caption: "请选择出生日期",
      value: "",
      rules: [{ required: true, message: "生日必填" }],
    },
    {
      order: 7,
      key: "country",
      label: "国家/地区",
      inputType: "select2",
      readOnly: false,
      required: true,
      caption: "请选择所在国家",
      value: "",
      options: [
        { label: "中国", value: "china" },
        { label: "美国", value: "usa" },
        { label: "日本", value: "japan" },
        { label: "德国", value: "germany" },
      ],
      rules: [{ required: true, message: "请选择国家" }],
    },
    {
      order: 8,
      key: "avatar",
      label: "上传头像",
      inputType: "file",
      readOnly: false,
      required: false,
      caption: "支持 JPG / PNG，大小 ≤ 2MB",
      value: "",
      rules: [
        {
          validator: (val) => val === "" || val.endsWith(".jpg") || val.endsWith(".png"),
          message: "文件必须是 JPG 或 PNG 格式",
        },
      ],
    },
    {
      order: 9,
      key: "bio",
      label: "个人简介",
      inputType: "textarea",
      readOnly: false,
      required: false,
      caption: "请简要介绍自己（100 字以内）",
      value: "",
      rules: [
        {
          validator: (val) => val.length <= 100,
          message: "简介不能超过 100 字",
        },
      ],
    },
  ];



  const [form, setForm] = useState(formConfig);

  const handleChange = (key, value) => {
    setForm((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value } : f))
    );
  };
  const handleSubmit = (data) => {
    alert("表单提交成功:\n" + JSON.stringify(data, null, 2));
  };

  // 字段名	类型	是否必填	说明	关联流程规则
  // 申请人	文本（只读）	是	自动获取当前用户信息	-
  // 申请时间	日期（只读）	是	自动生成	-
  // 请假类型	下拉选择	是	事假、病假、公假等	病假需附件
  // 开始时间	日期时间选择	是	-	用于计算时长
  // 结束时间	日期时间选择	是	-	用于计算时长
  // 请假时长	数字（只读）	是	根据起止时间自动计算	核心路由依据
  // 请假事由	文本域	是	详细说明原因	-
  // 紧急联系人	文本	否	-	-
  // 联系电话	文本	否	-	-
  // 附件上传	文件	条件必填	病假需上传病历/证明	请假类型 == "病假"
  // 审批人	只读	是	根据规则自动显示	如：系统显示“将由王辅导员审批”
  const OpManager = {
    _op: {
      student_id: {
        order: 1,
        key: 'student_id',
        label: '申请人',
        inputType: 'text',
        readOnly: true,
        required: true,
        caption: '自动获取当前用户信息',
        value: '张三'
      }, apply_time: {
        order: 2,
        key: 'apply_time',
        label: '申请时间',
        inputType: 'text',
        readOnly: true,
        required: true,
        caption: '自动生成',
        value: '2020-01-01'
      }, leave_type:
      {
        order: 3,
        key: 'leave_type',
        label: '请假类型',
        inputType: 'select',
        readOnly: false,
        required: true,
        caption: '事假、病假、公假等',
        value: '',
        options: [
          {
            label: '事假',
            value: '1'
          },
          {
            label: '病假',
            value: '2'
          },
          {
            label: '公假',
            value: '3'
          }
        ]
      }, start_time: {
        order: 4,
        key: 'start_time',
        label: '开始时间',
        inputType: 'datetime',
        readOnly: false,
        required: true,
        caption: '',
        value: '',
      }, end_time: {
        order: 5,
        key: 'end_time',
        label: '结束时间',
        inputType: 'datetime',
        readOnly: false,
        required: true,
        caption: '',
        value: '',
      }, duration: {
        order: 6,
        key: 'duration',
        label: '请假时长',
        inputType: 'number',
        readOnly: true,
        required: true,
        caption: '根据起止时间自动计算',
        value: 0,
      }, reason: {
        order: 7,
        key: 'reason',
        label: '请假事由',
        inputType: 'text',
        readOnly: false,
        required: true,
        caption: '详细说明原因',
        value: '',
      }, attachment: {
        order: 8,
        key: 'attachment',
        label: '附件',
        inputType: 'file',
        readOnly: false,
        required: false,
        caption: '详细说明原因',
        value: '',
      }, approver_id: {
        order: 9,
        key: 'approver_id',
        label: '审批人',
        inputType: 'file',
        readOnly: true,
        required: true,
        caption: '根据规则自动显示',
        value: '',
      }
    },
    _init(op) {
      this._op = op
    }
    ,
    setOp(key, value) {
      this._op[key] = value;
    },
    getOp(key) {
      return this._op[key];
    },
    entries() {
      return Object.entries(this._op)
    },
    keys() {
      return Object.keys(this._op)
    },
    values() {
      return Object.values(this._op)
    }
  }


  useEffect(() => {
    console.log('[OpManager]entries', OpManager.entries())
    console.log('[OpManager]keys', OpManager.keys())
    console.log('[OpManager]values', OpManager.values())
  }, []);
  const defaultAttrs = {
    'data-type': 'text',
    'data-lable': '',
    'data-read': false,
    'data-required': false,
  }
  return (
    <>
      <div className="review-win">
        <ConfigForm config={form} onChange={handleChange} onSubmit={handleSubmit} />
      </div>
    </>
  );
};

export default ReviewWin;


// type Option = { label: string; value: string };
// type Rule = {
//   required?: boolean;
//   pattern?: RegExp;
//   message: string;
//   validator?: (value: string) => boolean;
// };

// type OpType = {
//   order: number;
//   key: string;
//   label: string;
//   inputType: string;
//   readOnly: boolean;
//   required: boolean;
//   caption: string;
//   value: string;
//   options?: Option[];
//   rules?: Rule[];
// };

// type FormProps = {
//   config: OpType[];
//   onChange: (key: string, value: string) => void;
// }; 