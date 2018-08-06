import { GraphQLObjectType } from 'graphql'

import { $STRING } from '../base/GraphqlType'

export const ErrorExtensions = new GraphQLObjectType({
  name: 'ErrorExtensions',
  fields: {
    code: { type: $STRING() }
  }
})

export default new GraphQLObjectType({
  name: 'PropheticError',
  fields: {
    name: { type: $STRING() },
    message: { type: $STRING() },
    extensions: { type: ErrorExtensions }
  }
})
