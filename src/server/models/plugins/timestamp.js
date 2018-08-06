import { ActionTypes } from 'mongorito'

const defaultGetTimestamp = () => new Date()
const createdAt = 'created'
const updatedAt = 'updated'

export default () => {
  return ({ model }) => (next) => (action) => {
    if (action.type === ActionTypes.SAVE) {
      const timestamp = defaultGetTimestamp()
      const { fields } = action

      if (Object.is(action.fields[createdAt], undefined)) {
        fields[createdAt] = timestamp
        model.set(createdAt, timestamp)
      }

      fields[updatedAt] = timestamp
      model.set(updatedAt, timestamp)
    }

    if (action.type === ActionTypes.QUERY) {
      const isSelectUsed = action.query.filter((q) => q[0] === 'select').length > 0

      if (isSelectUsed) {
        action.query.push(['select', { [createdAt]: 1, [updatedAt]: 1 }])
      }
    }

    return next(action)
  }
}
