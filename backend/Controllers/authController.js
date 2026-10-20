import * as authService from "../services/authService.js";

// Controllers only translate HTTP <-> service calls. No models, no rules here.
export const login = async (req, res) => {
  res.json(await authService.login(req.body));
};

export const me = (req, res) => {
  res.json(authService.getProfile(req.user));
};
