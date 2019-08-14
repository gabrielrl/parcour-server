import ParcourError from "./ParcourError";

/**
 * Not found error (404).
 */
export default class NotFound extends ParcourError {

  private _entityType: string;
  private _id: string;

  constructor(entityType: string, id: string) {
    super(`Can not find ${ entityType } having ID "${ id }`, 404);
  }

  get entityType() { return this._entityType; }
  get id() { return this._id; }

}
