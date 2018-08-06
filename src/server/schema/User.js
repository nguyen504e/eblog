import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql'

import { $LIST, $LIST_STRING, $STRING, INT, LIST, STRING } from '../base/GraphqlType'
import Role from './Role'

const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: STRING },
    firstName: { type: STRING },
    lastName: { type: STRING },
    email: { type: $STRING() },
    created: { type: $STRING() },
    role: { type: $LIST(Role) }
  }
})

export const UserSet = new GraphQLObjectType({
  name: 'UserSet',
  fields: {
    data: { type: LIST(User) },
    total: { type: INT },
    size: { type: INT }
  }
})

export const UserFilterInput = new GraphQLInputObjectType({
  name: 'UserFilterInput',
  fields: () => ({
    firstName: { type: STRING },
    lastName: { type: STRING },
    email: { type: STRING },
    created: { type: STRING },
    role: { type: $LIST_STRING() }
  })
})

export default User
