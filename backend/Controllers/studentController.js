// Thin layer: read req, call services/studentService.js, send res.
import * as studentService from "../services/studentService.js";

export const list = async (req, res) => {
  res.json(await studentService.list(req.query));
};

export const create = async (req, res) => {
  res.status(201).json(await studentService.create(req.body));
};

export const update = async (req, res) => {
  res.json(await studentService.update(req.params.id, req.body));
};

export const move = async (req, res) => {
  res.json(await studentService.move(req.params.id, req.body.class_id));
};

export const remove = async (req, res) => {
  await studentService.remove(req.params.id);
  res.status(204).end();
};

export const me = async (req, res) => {
  res.json(await studentService.me(req.user));
};
