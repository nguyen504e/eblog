import { forOwn } from 'lodash'

import { $LIST } from '../../base/GraphqlType'
import Error from '../Error'
import * as errorClasses from '../../Errors'

export default {
  type: $LIST(Error),
  resolve() {
    const list = []
    forOwn(errorClasses, (Cls, name) => {
      const inst = new Cls()
      list.push({
        name,
        message: inst.message,
        extensions: {
          code: inst.extensions.code
        }
      })
    })

    return list
  }
}
