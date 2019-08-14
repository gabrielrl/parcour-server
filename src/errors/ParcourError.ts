/**
 * Base for all Parcour errors.
 */
export default class ParcourError extends Error {

  private _statusCode

  constructor(message?: string, statusCode?: number) {
    super(message);

    this._statusCode = statusCode || 500;
  }

  get status() { return this._statusCode; }

}
