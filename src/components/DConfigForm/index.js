
import React, { useMemo, useState } from "react";
import { componentMap } from "./componentMap"
import "./index.scss";
const validateField = (field, value) => {
    let error = "";
    if (field.rules) {
        for (let rule of field.rules) {
            if (rule.required && !value) {
                error = rule.message;
                break;
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                error = rule.message;
                break;
            }
            if (rule.validator && !rule.validator(value)) {
                error = rule.message;
                break;
            }
        }
    }
    return error;
};
const ConfigForm = ({ config, onChange, onSubmit }) => {
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        onChange(field.key, value);
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field.key]: error }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 整体验证
        const newErrors = {};
        const values = {};

        config.forEach((field) => {
            values[field.key] = field.value;
            const error = validateField(field, field.value);
            if (error) newErrors[field.key] = error;
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit?.(values);
        }
    };

    return (
        <form className="d-config-form" onSubmit={handleSubmit}>
            {config.sort((a, b) => a.order - b.order).map((field) => {
                const Comp = componentMap[field.inputType]; // 根据 inputType 找组件
                return (
                    <div key={field.key} className="d-config-form-item" data-error={!!errors[field.key]}>
                        <div className="d-config-form-item-label" data-required={field.required || field.rules?.some((r) => r.required)}>
                            {field.label}
                        </div>
                        {Comp && (
                            <Comp
                                field={field}
                                onChange={(val) => handleChange(field, val)}
                            />
                        )}

                        {/* {field.caption && (
                            <div className="d-config-form-item-caption">{field.caption}</div>
                        )} */}
                        {errors[field.key] && (
                            <div className="d-config-form-item-error">
                                {errors[field.key]}
                            </div>
                        )}
                    </div>
                );
            })}
            {/* 提交按钮 */}
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                提交
            </button>
        </form>
    );
};

export default ConfigForm;