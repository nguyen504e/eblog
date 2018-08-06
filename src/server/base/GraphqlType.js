import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql'

export const INT = GraphQLInt
export const STRING = GraphQLString
export const LIST = (obj) => new GraphQLList(obj)
export const LIST_INT = () => new GraphQLList(GraphQLInt)
export const LIST_STRING = () => new GraphQLList(GraphQLString)

export const $ = (obj) => new GraphQLNonNull(obj)
export const $INT = () => new GraphQLNonNull(GraphQLInt)
export const $STRING = () => new GraphQLNonNull(GraphQLString)
export const $LIST = (obj) => new GraphQLNonNull(new GraphQLList(obj))
export const $LIST_INT = () => new GraphQLNonNull(new GraphQLList(GraphQLInt))
export const $LIST_STRING = () => new GraphQLNonNull(new GraphQLList(GraphQLString))
