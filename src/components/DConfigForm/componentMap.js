


import React, { useEffect, useRef, useState } from "react";
// 基础控件
const TextInput = ({ field, onChange }) => (
    <input
        type="text"
        value={field.value}
        readOnly={field.readOnly}
        className="border rounded p-2"
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.caption}
    />
);

const TextArea = ({ field, onChange }) => (
    <textarea
        value={field.value}
        readOnly={field.readOnly}
        className="border rounded p-2"
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.caption}
    />
);

const CaptionDiv = ({ caption, children }) => (
    <div className="caption-box">
        {children}
        {!!caption && <div className="caption" title={caption}></div>}
    </div>
)

const SelectInput = ({ field, onChange }) => (
    <CaptionDiv caption={field.caption}>
        <select
            value={field.value}
            disabled={field.readOnly}
            className="border rounded p-2"
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">请选择</option>
            {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </CaptionDiv>
);

const CheckboxInput = ({ field, onChange }) => (
    <CaptionDiv caption={field.caption}>
        <input
            type="checkbox"
            checked={field.value === "true"}
            disabled={field.readOnly}
            className="w-5 h-5"
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
        />
    </CaptionDiv>
);

// 扩展控件
const NumberInput = ({ field, onChange }) => (
    <CaptionDiv caption={field.caption}>
        <input
            type="number"
            value={field.value}
            readOnly={field.readOnly}
            className="border rounded p-2"
            onChange={(e) => onChange(e.target.value)}
        />
    </CaptionDiv>
);

const DateInput = ({ field, onChange }) => (
    <CaptionDiv caption={field.caption}>
        <input
            type="date"
            value={field.value}
            readOnly={field.readOnly}
            className="border rounded p-2"
            onChange={(e) => onChange(e.target.value)}
        />
    </CaptionDiv>
);

const FileInput = ({ field, onChange }) => (
    <CaptionDiv caption={field.caption}>
        <input
            type="file"
            disabled={field.readOnly}
            className="border rounded p-2"
            onChange={(e) => {
                const file = e.target.files?.[0];
                onChange(file ? file.name : "");
            }}
        />
    </CaptionDiv>
);

const RadioGroup = ({ field, onChange }) => (
    <CaptionDiv caption={field.caption}>
        <div >
            {field.options?.map((opt) => (
                <label key={opt.value} >
                    <DivRadio
                        label={opt.value}
                        checked={field.value === opt.value}
                        disabled={field.readOnly}
                        onChange={() => onChange(opt.value)}
                    />
                    <span>{opt.label}</span>
                </label>
            ))}
        </div>
    </CaptionDiv>
);
const CheckboxGroup = ({ field, onChange }) => {
    const _Change = (value) => {
        const values = field.value;
        const index = values.indexOf(value);
        if (index === -1) {
            values.push(value);
        } else {
            values.splice(index, 1);
        }
        console.log('[CheckboxGroup]_Change', index, values)
        onChange(values);
    }


    return (
        <CaptionDiv caption={field.caption}>
            <div >
                {field.options?.map((opt) => (
                    <label key={opt.value} >
                        <DivCheckbox
                            label={opt.label}
                            checked={field?.value?.includes(opt.value)}
                            disabled={field.readOnly}
                            onChange={() => _Change(opt.value)}
                        />
                    </label>
                ))}
            </div>
        </CaptionDiv>
    )
};


// ------------------- Checkbox (div-based) -------------------
export const DivCheckbox = (props) => {
    const { checked, onChange, disabled, label } = props;
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const handler = (e) => {
            if (disabled) return;
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onChange(!checked);
            }
        };
        el.addEventListener("keydown", handler);
        return () => el.removeEventListener("keydown", handler);
    }, [checked, onChange, disabled]);

    return (
        <div className="custom-checkbox">
            <div
                ref={ref}
                role="checkbox"
                aria-checked={checked}
                tabIndex={disabled ? -1 : 0}
                onClick={() => onChange(!checked)}
                style={{
                    border: `1px solid ${checked ? "#2563eb" : "#d1d5db"}`,
                    backgroundColor: checked ? "#2563eb" : "#ffffff",
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
            >
                {checked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            {label && (
                <div
                    onClick={() => !disabled && onChange(!checked)}
                    style={{ cursor: disabled ? "not-allowed" : "pointer", userSelect: "none", opacity: disabled ? 0.5 : 1 }}
                >
                    {label}
                </div>
            )}
        </div>
    );
};

// ------------------- Radio (div-based) -------------------
export const DivRadio = (props) => {
    const { checked, disabled, label, onChange } = props;
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const handler = (e) => {
            if (disabled) return;
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onChange();
            }
        };
        el.addEventListener("keydown", handler);
        return () => el.removeEventListener("keydown", handler);
    }, [onChange, disabled]);

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
                ref={ref}
                role="radio"
                aria-checked={checked}
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && onChange()}
                style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: `2px solid ${checked ? "#2563eb" : "#d1d5db"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
            >
                {checked && <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#2563eb" }} />}
            </div>
            {label && (
                <div
                    onClick={() => !disabled && onChange()}
                    style={{ cursor: disabled ? "not-allowed" : "pointer", userSelect: "none", opacity: disabled ? 0.5 : 1 }}
                >
                    {label}
                </div>
            )}
        </div>
    );
};

// ------------------- Select (div-based) with fixed-position dropdown -------------------
export const DivSelect = (props) => {
    const { field: { options, value, caption: placeholder, readOnly: disabled }, onChange } = props
    const triggerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);

    useEffect(() => {
        if (!open) return;
        const updatePos = () => {
            const el = triggerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const top = rect.bottom;
            const left = rect.left;
            const width = rect.width;
            setPos({ top, left, width });
        };
        updatePos();

        window.addEventListener("scroll", updatePos, true);
        window.addEventListener("resize", updatePos);
        return () => {
            window.removeEventListener("scroll", updatePos, true);
            window.removeEventListener("resize", updatePos);
        };
    }, [open]);

    useEffect(() => {
        const onDocClick = (e) => {
            const trg = triggerRef.current;
            if (!trg) return;
            if (trg.contains(e.target)) return;
            setOpen(false);
        };
        if (open) document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, [open]);

    const selectedLabel = options?.find((o) => o.value === value)?.label ?? "";

    return (
        <div style={{ position: "relative" }}>
            <div

                ref={triggerRef}
                role="combobox"
                aria-expanded={open}
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && setOpen((v) => !v)}
                style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: disabled ? "not-allowed" : "pointer",
                    backgroundColor: disabled ? "#f9fafb" : "#ffffff",
                    outline: "none",
                }}
            >
                <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: selectedLabel ? "#111827" : "#9ca3af" }}>
                    {selectedLabel || placeholder || "请选择"}
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {open && pos && (
                <div
                    role="listbox"
                    style={{
                        position: "fixed",
                        top: pos.top + "px",
                        left: pos.left + "px",
                        minWidth: pos.width + "px",
                        zIndex: 1000,
                        backgroundColor: "#ffffff",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        maxHeight: "240px",
                        overflowY: "auto",
                        marginTop: "4px",
                    }}
                >
                    {options && options.map((opt) => (
                        <div
                            key={opt.value}
                            role="option"
                            aria-selected={opt.value === value}
                            tabIndex={0}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                backgroundColor: opt.value === value ? "#f3f4f6" : "#ffffff",
                                fontWeight: opt.value === value ? 500 : 400,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = opt.value === value ? "#f3f4f6" : "#ffffff")}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// 通用映射表
export const componentMap = {
    text: TextInput,
    textarea: TextArea,
    select: SelectInput,
    select2: DivSelect,
    checkbox: CheckboxGroup,
    number: NumberInput,
    date: DateInput,
    file: FileInput,
    radio: RadioGroup,
};