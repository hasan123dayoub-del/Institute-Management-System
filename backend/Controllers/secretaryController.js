// Thin layer: read req, call services/secretaryService.js, send res.
import * as secretaryService from "../services/secretaryService.js";

export const list = async (req, res) => {
  res.json(await secretaryService.list());
};

export const create = async (req, res) => {
  res.status(201).json(await secretaryService.create(req.body));
};

export const update = async (req, res) => {
  res.json(await secretaryService.update(req.params.id, req.body));
};

export const remove = async (req, res) => {
  await secretaryService.remove(req.params.id);
  res.status(204).end();
};
