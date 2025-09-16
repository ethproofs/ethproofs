import type { Preview } from "@storybook/nextjs"
import { withThemeByClassName } from "@storybook/addon-themes"

import "../styles/globals.css"

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "dark",
      parentSelector: "body",
    }),
  ],
  parameters: {
    controls: {
      layout: "centered",
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
