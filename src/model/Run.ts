import { RunOutcome } from './RunOutcome';

export default interface Run {
  id: string;
  parcourId: string;
  userId: string;
  startedOn: Date;
  endedOn: Date;
  outcome: RunOutcome;
}