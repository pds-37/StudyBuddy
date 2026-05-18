import { type RequestHandler } from "express";
import { companyPrepService } from "./company-prep.service.js";
import {
  companyPrepQuerySchema,
  companyTypeParamSchema,
  questionParamSchema,
  questionQuerySchema,
  startPrepSchema,
  updateQuestionStatusSchema
} from "./company-prep.validation.js";

const listCompanyTypes: RequestHandler = async (request, response, next) => {
  try {
    const query = companyPrepQuerySchema.parse(request.query);
    const companyTypes = await companyPrepService.listCompanyTypes(request.userId ?? "", query.role);
    response.json({ companyTypes });
  } catch (error) {
    next(error);
  }
};

const getCompanyType: RequestHandler = async (request, response, next) => {
  try {
    const params = companyTypeParamSchema.parse(request.params);
    const query = companyPrepQuerySchema.parse(request.query);
    const companyType = await companyPrepService.getCompanyTypeDetail(
      request.userId ?? "",
      params.companyTypeId,
      query.role
    );
    response.json({ companyType });
  } catch (error) {
    next(error);
  }
};

const listQuestions: RequestHandler = async (request, response, next) => {
  try {
    const query = questionQuerySchema.parse(request.query);
    const questions = await companyPrepService.listQuestions(request.userId ?? "", query);
    response.json({ questions });
  } catch (error) {
    next(error);
  }
};

const updateQuestionStatus: RequestHandler = async (request, response, next) => {
  try {
    const params = questionParamSchema.parse(request.params);
    const body = updateQuestionStatusSchema.parse(request.body);
    const question = await companyPrepService.updateQuestionStatus(
      request.userId ?? "",
      params.questionId,
      body.status
    );
    response.json({ question });
  } catch (error) {
    next(error);
  }
};

const saveQuestionToNotes: RequestHandler = async (request, response, next) => {
  try {
    const params = questionParamSchema.parse(request.params);
    const result = await companyPrepService.saveQuestionToNotes(request.userId ?? "", params.questionId);
    response.status(result.created ? 201 : 200).json(result);
  } catch (error) {
    next(error);
  }
};

const startPrep: RequestHandler = async (request, response, next) => {
  try {
    const params = companyTypeParamSchema.parse(request.params);
    const body = startPrepSchema.parse(request.body ?? {});
    const prepPlan = await companyPrepService.startPrep(
      request.userId ?? "",
      params.companyTypeId,
      body.role,
      body.targetDate
    );
    response.status(201).json({ prepPlan });
  } catch (error) {
    next(error);
  }
};

export const companyPrepController = {
  listCompanyTypes,
  getCompanyType,
  listQuestions,
  updateQuestionStatus,
  saveQuestionToNotes,
  startPrep
};
