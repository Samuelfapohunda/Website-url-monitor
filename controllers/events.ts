import { EventEmitter } from 'events';
import * as pollController from './polling';
// import * as checkModel from '../models/urlCh
import { Check, validateCheck } from '../models/urlCheck';

const eventEmitter = new EventEmitter();

// Listeners
eventEmitter.on('Check Created', (check) => {
  const handle = setInterval(() => pollController.testURL(check), check.interval);
  Check.findByIdAndUpdate(check._id, { active: true, handle });
});

eventEmitter.on('Check Update', (check) => {
  clearInterval(check.handle);
  const handle = setInterval(() => pollController.testURL(check), check.interval);
  Check.findByIdAndUpdate(check._id, { active: true, handle });
});

eventEmitter.on('Check Deleted', (handle: NodeJS.Timeout) => {
  clearInterval(handle);
});

eventEmitter.on('Server Start', async () => {
  const checks = await Check.find({});
  checks.forEach((check) => {
    if (check.active) {
      const handle = setInterval(() => pollController.testURL(check), check.interval);
      Check.findByIdAndUpdate(check._id, { handle });
    }
  });
});

export default eventEmitter;
