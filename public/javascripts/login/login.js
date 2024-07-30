import sweetAlert from "../helper/sweetAlert"
import getUrl from "../helper/getHostUrl"

class Model {
  constructor() {
    this.loginUrl = getUrl() + '/login'
  }
  async postLogin(password) {
    try {
      return fetch(this.loginUrl, {
        method: 'POST',
        body: JSON.stringify({
          password
        }),
        headers: {
          'Content-Type': 'application/json'
        },
      })
    } catch (err) {
      sweetAlert.error('Login Fail', err.message)
    }
  }
}

class View {
  constructor() { }
}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
  }
  init() {
    // set up handler
    const submit = document.querySelector('#submit')
    submit.onclick = (e) => this.login(e)
  }
  async login(e) {
    try {
      e.preventDefault();
      const password = document.querySelector('#password').value
      if (!password?.trim()) throw new Error('Missing Password')
      const response = await this.model.postLogin(password)
      const json = await response.json()

      if (!json.ok) {
        throw new Error(json.err)
      }

      // redirect
      window.location.href = "/";

    } catch (err) {
      sweetAlert.error('Login Fail', err.message)
    }
  }
}

const model = new Model()
const view = new View()
const controller = new Controller(model, view)
controller.init()