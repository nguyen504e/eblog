import { GraphQLObjectType } from 'graphql'

import { $LIST_STRING, $STRING } from '../base/GraphqlType'

export default new GraphQLObjectType({
  name: 'Auth',
  fields: {
    id: { type: $STRING() },
    email: { type: $STRING() },
    token: { type: $STRING() },
    permissions: { type: $LIST_STRING() }
  }
})
