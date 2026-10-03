import * as ticketService from '../services/ticketService.js';

const create = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body || {});

    return res.status(201).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicket(req.params.id);

    return res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

const complete = async (req, res, next) => {
  try {
    const ticket = await ticketService.completeTicket(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const ticket = await ticketService.cancelTicket(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

const cancelByClient = async (req, res, next) => {
  try {
    const { cancelToken } = req.body || {};

    const ticket =
      await ticketService.cancelTicketByClient(
        req.params.id,
        cancelToken
      );

    return res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export {
  cancel,
  complete,
  create,
  getOne,
  cancelByClient
};
