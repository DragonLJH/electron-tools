import "./index.scss"
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'antd';
import CustomModeler from './custom-modeler';
import CustomTokenSimulationModule from './custom-token-simulation-module';
import customModdleExtension from './custom-properties-panel/custom.json';
import { debounce, stringToXML, getID } from "@src/utils/index.js"
import customTranslate from './custom-translate/customTranslate';
// import exampleXML from './testDiagram.bpmn';

import CustomPropertiesPanel, { CustomPropertiesPanelHook } from './custom-properties-panel/index';


var customTranslateModule = {
    translate: ['value', customTranslate]
};

const flowJson = {
    "flowId": "123456789",     // 流程ID
    "title": "流程审核",        // 流程标题
    "description": "请审核流程内容", // 流程描述
    "steps": [
        {
            "stepId": 1,                   // 步骤ID
            "stepName": "填写申请表单",     // 步骤名称
            "requiredFields": [            // 必填字段
                "name",
                "email",
                "department"
            ],
            "optionalFields": [            // 可选字段
                "phone",
                "comments"
            ]
        },
        {
            "stepId": 2,
            "stepName": "审核领导审批",
            "assignees": [
                {
                    "userId": "123",
                    "name": "张三"
                },
                {
                    "userId": "456",
                    "name": "李四"
                }
            ],
            "requiredApprovals": 2          // 需要的审批数量
        },
        {
            "stepId": 3,
            "stepName": "最终审批",
            "assignees": [
                {
                    "userId": "789",
                    "name": "王五"
                }
            ]
        }
    ]
}



const Bpmn = () => {
    const bpmnCanvas = useRef(null)
    const [bpmnModeler, setBpmnModeler] = useState(null)
    const [customData, setCustomData] = useState({})
    useEffect(() => {
        setBpmnModeler(new CustomModeler({
            container: bpmnCanvas.current,
            //添加控制板
            // propertiesPanel: {
            //     parent: bpmnPanel.current,
            // },
            additionalModules: [
                customTranslateModule,
                CustomTokenSimulationModule,
                // 右边的属性栏

            ],
            moddleExtensions: {
            }
        }))
    }, [])
    useEffect(() => {
        bpmnModeler && bpmnModeler._importXML().then(function (result) {
            const { warnings } = result;
            console.log('success !', warnings);
            // bpmnModeler.get('canvas').zoom('fit-viewport');

            // bpmnModeler.addCustomElements(customElements);
        }).catch(function (err) {
            const { warnings, message } = err;
            console.log('something went wrong:', warnings, message);
        });
    }, [bpmnModeler])


    const changeCustomData = ({ id, ...data }, state) => {
        setCustomData((item) => {
            if (state == "remove") delete item[id]
            else item[id] = { id, ...data }
            return item
        })
    }

    const saveXML = async (id) => {
        const { xml } = await bpmnModeler.saveXML({ format: true });

        const data = new FormData();
        data.append('bpmnId', id)
        data.append('file', new File([xml], `${id}.xml`, {
            type: 'application/xml'
        }));

        fetch(`http://localhost:8687/bpmn/saveOrUpdate`, {
            method: 'POST',
            body: data
        });

        console.log(id, xml);
        localStorage.setItem("bpmnXml", xml)
    }

    const save = async () => {
        const customList = Object.entries(customData)
        const startBpmn = customList.find(([k, v]) => {
            return v.type == "bpmn:StartEvent"
        })


        // bpmn 计算每条流程路径
        const getPaths = ({ paths = {}, currently, children }, callback) => {
            let len = 0
            while (currently.length > len) {
                len++
                let target = currently[currently.length - 1]
                let { nextNodes } = children[target]
                nextNodes.forEach((item, index) => {
                    if (nextNodes.length > 1) {
                        paths[item] = getPaths({ paths, currently: [...currently, item], children })
                    }
                    else {
                        currently = [...currently, item]
                    }
                })
            }
            callback && (Object.keys(paths).length ? callback(paths) : callback(currently))
            return currently
        }




        const processBpmn = customList.find(([key, value], index) => {

            // 修复不能重复保存bug
            let children = JSON.parse(JSON.stringify(customData))
            Object.entries(children).forEach(([k, v], index) => {
                const { targetRef, outgoing, type, attrs } = v
                
                if (targetRef) {
                    children[k]["nextNodes"] = [targetRef.id]
                    delete children[k]["targetRef"]
                    delete children[k]["outgoing"]
                } else {
                    children[k]["nextNodes"] = outgoing.map(item => item.id)
                    delete children[k]["outgoing"]
                }
            })

            value["currently"] = [startBpmn[0]]
            delete children[key]
            value["children"] = children
            return value.type == "bpmn:Process"
        })[1]



        getPaths(processBpmn, (data) => {
            processBpmn["paths"] = data
        })

        const data = new FormData();
        data.append('bpmnId', processBpmn.id)
        data.append('file', new File([JSON.stringify(processBpmn)], `${processBpmn.id}.json`, {
            type: 'application/json'
        }));

        await fetch(`http://localhost:8687/bpmn/saveOrUpdate`, {
            method: 'POST',
            body: data
        });

        console.log("processBpmn", processBpmn)

        localStorage.setItem("bpmnMap", JSON.stringify(processBpmn))
        saveXML(processBpmn.id)


        // const startBpmn = Object.entries(customData).find(([k, v]) => {
        //     return v.$type == "bpmn:StartEvent"
        // })
        // console.log("save", startBpmn)
        // const nextBpmn = (data) => {
        //     const { $type, id } = data
        //     if ($type == "bpmn:SequenceFlow") {
        //         const { target } = data
        //         nextBpmn(target)
        //     } else {
        //         const { outgoing } = data
        //         outgoing.forEach(item => {
        //             nextBpmn(item)
        //         })
        //     }
        // }
    }








    return <div className='bpmn'>
        <div className='bpmn-top'>
            <Button type="primary" onClick={save}>save</Button>
        </div>
        <div className='bpmn-canvas' ref={bpmnCanvas}></div>
        {bpmnModeler && <CustomPropertiesPanel modeler={bpmnModeler} customData={customData} changeCustomData={changeCustomData}></CustomPropertiesPanel>}
        {/* {bpmnModeler && <CustomPropertiesPanelHook modeler={bpmnModeler}></CustomPropertiesPanelHook>} */}

    </div>
}

export default Bpmn