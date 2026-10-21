import { getOverviewStats } from "../services/statsService.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await getOverviewStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
