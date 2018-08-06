import { GraphQLObjectType } from 'graphql'

import { $STRING } from '../base/GraphqlType'

export default new GraphQLObjectType({
  name: 'Permission',
  fields: {
    _id: { type: $STRING() },
    name: { type: $STRING() }
  }
})
