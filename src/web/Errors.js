import { ApolloError } from 'apollo-client'

const CODE_LESS_EXTENSION = {
  code: 'NONE'
}
export const PropheticErrorCode = {
  CodeLessError: 'NONE',
  AuthenticationRequiredError: 'AUTH_REQUIRED',
  UserNotFoundError: 'USER_NOT_FOUND',
  PermissionRequiredError: 'PERMISSION_REQUIRED',
  CodeNotMatchedError: 'CODE_NOT_MATCHED'
}
const _c = PropheticErrorCode
export class PropheticError {
  constructor(codes) {
    this.codes = codes
  }

  inCodes(code) {
    return this.codes.indexOf(code) > -1
  }

  get isAuthenticationRequiredError() {
    return this.inCodes(_c.AuthenticationRequiredError)
  }

  get isUserNotFoundError() {
    return this.inCodes(_c.UserNotFoundError)
  }

  get isPermissionRequiredError() {
    return this.inCodes(_c.PermissionRequiredError)
  }

  get isCodeNotMatchedError() {
    return this.inCodes(_c.CodeNotMatchedError)
  }
}
export class PropheticErrorHandled {
  constructor(c) {
    this.handler = function() {}

    this.codes = c
  }

  inCodes(c, handler) {
    if (this.codes.indexOf(c) > -1) {
      this.handler = handler
    }

    return this
  }

  handle() {
    return this.handler()
  }

  AuthenticationRequiredError(handler) {
    return this.inCodes(_c.AuthenticationRequiredError, handler)
  }

  UserNotFoundError(handler) {
    return this.inCodes(_c.UserNotFoundError, handler)
  }

  PermissionRequiredError(handler) {
    return this.inCodes(_c.PermissionRequiredError, handler)
  }

  CodeNotMatchedError(handler) {
    return this.inCodes(_c.CodeNotMatchedError, handler)
  }
}

const fc = (e) => {
  if (e instanceof ApolloError) {
    return e.graphQLErrors.map((ge) => {
      return fc(ge)[0]
    })
  } else if (e.extensions) {
    const { extensions: { code } = CODE_LESS_EXTENSION } = e
    return [code]
  }

  return [_c.CodeLessError]
}

export const errorHere = (e) => {
  if (!e) {
    return new PropheticError([])
  }

  return new PropheticError(fc(e))
}
export const isThis = (e) => {
  if (!e) {
    return new PropheticErrorHandled([])
  }

  return new PropheticErrorHandled(fc(e))
}
