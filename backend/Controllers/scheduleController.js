import {
  createSchedule as createScheduleRecord,
  listSchedules as listScheduleRecords,
  modifySchedule as modifyScheduleRecord,
  removeSchedule as removeScheduleRecord,
} from "../services/scheduleService.js";

export const listSchedules = async (req, res, next) => {
  try {
    const schedules = await listScheduleRecords(req.user._id, req.query.class_id);
    res.status(200).json({ schedules });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const result = await createScheduleRecord(req.user._id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await modifyScheduleRecord(req.user._id, id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const result = await removeScheduleRecord(req.user._id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
