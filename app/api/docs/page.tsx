import SwaggerUI from "swagger-ui-react"

import "swagger-ui-react/swagger-ui.css"

export default function OpenApiPage() {
  return (
    <div className="bg-white py-8">
      <SwaggerUI url="/openapi.json" />
    </div>
  )
}
