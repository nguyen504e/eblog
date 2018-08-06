import { GraphQLInputObjectType } from 'graphql';

import { $STRING, INT } from '../base/GraphqlType';

export default new GraphQLInputObjectType({
  name: 'ContinuousInput',
  fields: () => ({
    index: { type: $STRING() },
    size: { type: INT, defaultValue: 10 }
  })
})
