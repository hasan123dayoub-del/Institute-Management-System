// Thin layer: read req, call services/classService.js, send res.
import * as classService from "../services/classService.js";

export const list = async (req, res) => {
  res.json(await classService.list(req.user, req.query));
};

export const get = async (req, res) => {
  res.json(await classService.get(req.user, req.params.id));
};

export const students = async (req, res) => {
  res.json(await classService.students(req.user, req.params.id));
};

export const create = async (req, res) => {
  res.status(201).json(await classService.create(req.body));
};

export const update = async (req, res) => {
  res.json(await classService.update(req.params.id, req.body));
};

export const start = async (req, res) => {
  res.json(await classService.start(req.params.id));
};

export const remove = async (req, res) => {
  await classService.remove(req.params.id);
  res.status(204).end();
};
