import fs from "fs"
import path from "path"

const API_HTML_PATH = path.join("public", "api.html")

const FOUC_FIX_CSS = `margin: 0;}#redoc{opacity:0;animation:fadeIn 0.01s ease-in 0.15s forwards;}@keyframes fadeIn{to{opacity:1;}}`

const html = fs.readFileSync(API_HTML_PATH, "utf8")
const fixedHtml = html.replace("margin: 0;", FOUC_FIX_CSS)
fs.writeFileSync(API_HTML_PATH, fixedHtml)
