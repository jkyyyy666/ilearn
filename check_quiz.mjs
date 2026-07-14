import fs from "fs";
const path = "D:/englearn/chinese-learning/src/pages/QuizPage.jsx";
let code = fs.readFileSync(path, "utf8");
console.log("Length:", code.length);
console.log("First 100 chars:", code.slice(0, 100));
console.log("setIsFinished:", code.includes("setIsFinished"));
console.log("dispatchEvent:", code.includes("dispatchEvent"));
