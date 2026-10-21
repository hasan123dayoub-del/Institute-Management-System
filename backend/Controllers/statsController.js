import { getBreakdown, getOverviewStats } from "../services/statsService.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await getOverviewStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const getAdminBreakdown = async (req, res, next) => {
  try {
    res.status(200).json(await getBreakdown());
  } catch (error) {
    next(error);
  }
};
