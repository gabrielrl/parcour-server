import ParcourError from "./ParcourError";

/**
 * Bad request error (400).
 */
export default class BadRequestError extends ParcourError {

  private _entityType: string;
  private _id: string;

  constructor(message: string) {
    super(message, 400);
  }

  get entityType() { return this._entityType; }
  get id() { return this._id; }

}
