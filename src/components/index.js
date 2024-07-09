import './index.css'
import Test from "./Test/index"
const install = function() {
    let app = document.getElementById("app")
    new Array(10).fill("").forEach((_, index) => {
        let test = new Test(index + 1)
        console.log(test)
        app.appendChild(test)
    })

}

export default install