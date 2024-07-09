import "./index.scss"
import React, { useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import { codeCanvas } from "@src/utils/index"

const CodeInput = (props) => {
    const { form } = props

    useEffect(() => {
        setCode(code.current, setCodeStr)
    }, [])

    const code = useRef(null);
    const [codeStr, setCodeStr] = useState("")

    const setCode = (el, fn) => {
        let canvas = document.createElement("canvas")
        canvas.setAttribute("width", "100")
        canvas.setAttribute("height", "30")
        fn(codeCanvas(canvas))
        canvas.onclick = () => {
            fn(codeCanvas(canvas))
        }
        el.append(canvas)
    }


    const codeValidator = (_, value) => {
        // 自定义验证规则函数，返回 Promise 对象
        if (value.toLocaleLowerCase() !== codeStr.toLocaleLowerCase()) { 
            return Promise.reject('请输入正确的验证码');
        }
        return Promise.resolve();
    };


    return (
        <>
            <div className="code-input">
                <div className="code-input-input">
                    <Form.Item name="code" rules={[{ validator: codeValidator },]}>
                        <Input allowClear/>
                    </Form.Item>
                </div>
                <div className="code-input-code" ref={code}></div>
            </div>
        </>
    )
}

export default CodeInput