import fs from "fs"
import path from "path"

import { document } from "@/lib/openapi"

fs.writeFileSync(
  path.join("public", "openapi.json"),
  JSON.stringify(document, null, 2)
)
