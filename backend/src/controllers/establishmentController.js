import * as establishmentService
  from '../services/establishmentService.js';

const getAll = async (req, res, next) => {
  try {
    const establishments =
      await establishmentService.getAllEstablishments();

    return res.status(200).json({
      status: 'success',
      data: {
        establishments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const establishment =
      await establishmentService.getEstablishmentById(id);

    return res.status(200).json({
      status: 'success',
      data: {
        establishment,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAll,
  getOne,
};