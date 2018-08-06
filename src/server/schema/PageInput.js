import { GraphQLInputObjectType } from 'graphql';

import { INT } from '../base/GraphqlType';

export default new GraphQLInputObjectType({
  name: 'PageInput',
  fields: () => ({
    size: { type: INT, defaultValue: 10 },
    number: { type: INT, defaultValue: 1 },
    total: { type: INT }
  })
})
