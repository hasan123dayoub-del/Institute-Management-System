// Thin layer: read req, call services/teacherService.js, send res.
import * as teacherService from "../services/teacherService.js";

export const list = async (req, res) => {
  res.json(await teacherService.list());
};

export const create = async (req, res) => {
  res.status(201).json(await teacherService.create(req.body));
};

export const update = async (req, res) => {
  res.json(await teacherService.update(req.params.id, req.body));
};

export const pay = async (req, res) => {
  res.json(await teacherService.pay(req.params.id));
};
