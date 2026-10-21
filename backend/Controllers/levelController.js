// Thin layer: read req, call services/levelService.js, send res.
import * as levelService from "../services/levelService.js";

export const list = async (req, res) => {
  res.json(await levelService.list());
};
