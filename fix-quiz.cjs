const fs = require("fs");
const path = "D:/englearn/chinese-learning/src/pages/QuizPage.jsx";
let code = fs.readFileSync(path, "utf8");
code = code.replace('import ToastContainer, { useToastManager } from', 'import { useRef } from "react";\nimport ToastContainer, { useToastManager } from');
code = code.replace("const [toasts, setToasts] = useState([]);", "const [toasts, setToasts] = useState([]);\n  const countsRef = useRef({ known: 0, unknown: 0 });");
code = code.replace("setKnownCount((prev) => prev + 1);", "setKnownCount((prev) => prev + 1);\n    countsRef.current.known++;");
code = code.replace("setUnknownCount((prev) => prev + 1);", "setUnknownCount((prev) => prev + 1);\n    countsRef.current.unknown++;");
const oldB = '        window.dispatchEvent(new CustomEvent("pet-feed"));         recordActivity();         if (isGithubConfigured()) autoBackup();         setIsFinished(true);';
const newB = '        window.dispatchEvent(new CustomEvent("pet-feed"));         recordActivity();         words.addQuizRecord(lang, { correct: countsRef.current.known, total: countsRef.current.known + countsRef.current.unknown });         if (isGithubConfigured()) autoBackup();         setIsFinished(true);         countsRef.current = { known: 0, unknown: 0 };';
let c = 0;
while (code.includes(oldB)) { code = code.replace(oldB, newB); c++; }
console.log("Replaced:", c);
fs.writeFileSync(path, code, "utf8");
console.log("Written:", code.length);
const v = fs.readFileSync(path, "utf8");
console.log("addQuizRecord:", v.includes("addQuizRecord"));
