import * as queueService from '../services/queueService.js';
import * as ticketService from '../services/ticketService.js';

const getCurrent = async (req, res, next) => {
  try {
    const result = await queueService.getCurrentQueue(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const open = async (req, res, next) => {
  try {
    const queue = await queueService.openQueue(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

const pause = async (req, res, next) => {
  try {
    const queue = await queueService.pauseQueue(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

const resume = async (req, res, next) => {
  try {
    const queue = await queueService.resumeQueue(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

const close = async (req, res, next) => {
  try {
    const queue = await queueService.closeQueue(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

const callNext = async (req, res, next) => {
  try {
    const ticket =
      await ticketService.callNextTicket(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export {
  callNext,
  getCurrent,
  open,
  pause,
  resume,
  close,
};
