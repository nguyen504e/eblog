import { GraphQLObjectType } from 'graphql'

import { $STRING, LIST_STRING } from '../base/GraphqlType'

export default new GraphQLObjectType({
  name: 'Role',
  fields: {
    _id: { type: $STRING() },
    name: { type: $STRING() },
    permissions: { type: LIST_STRING() }
  }
})
