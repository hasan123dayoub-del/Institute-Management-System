// Thin layer: read req, call services/userService.js, send res.
import * as userService from "../services/userService.js";


export const setPassword = async (req, res) => {
  await userService.setPassword(req.user, req.params.id, req.body?.password);
  res.status(204).end();
};
