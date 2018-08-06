import { GraphQLObjectType } from 'graphql'

import auth from './auth'
import errors from './errors'
import permission from './permission'
import user from './user'

export default new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    auth,
    user,
    permission,
    errors
  }
})
