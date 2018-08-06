import { App as Application } from './modules'
import { setupStore } from './store'
import history from './services/history'
import language from './services/language'
import theme from './services/theme'

async function bootstrap() {
  await theme.setup()
  await language.setup()
  await setupStore()
  const target = document.getElementsByTagName('body')

  const app = new Application({ target })
  history.onLoadUrl = (path) => {
    app.set({ ready: true, path })
  }

  history.start()
}

bootstrap()
