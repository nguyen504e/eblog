import { ApolloError } from 'apollo-server'

class PropheticError extends ApolloError {
  constructor(name, message, code, properties) {
    super(message, code, properties)

    // Set the prototype explicitly.
    // https://stackoverflow.com/a/41102306
    Object.setPrototypeOf(this, SyntaxError.prototype)
    Object.defineProperty(this, 'name', { value: name })
  }
}
export class AuthenticationRequiredError extends PropheticError {
  constructor(properties) {
    super('AuthenticationRequiredError', 'You must be logged in to do this', 'AUTH_REQUIRED', properties)
  }
}
export class UserNotFoundError extends PropheticError {
  constructor(properties) {
    super('UserNotFoundError', 'No user found', 'USER_NOT_FOUND', properties)
  }
}
export class PermissionRequiredError extends PropheticError {
  constructor(properties) {
    super('PermissionRequiredError', 'You must have permission to do this', 'PERMISSION_REQUIRED', properties)
  }
}
export class CodeNotMatchedError extends PropheticError {
  constructor(properties) {
    super('CodeNotMatchedError', 'Your passcode did not matched', 'CODE_NOT_MATCHED', properties)
  }
}
