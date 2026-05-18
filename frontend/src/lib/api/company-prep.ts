import type {
  CompanyPrepPlan,
  CompanyPrepQuestionQuery,
  CompanyPrepQuestionStatus,
  CompanyPrepRole,
  CompanyTypeCard,
  CompanyTypeDetail,
  PrepQuestion
} from "@studybuddy/shared";
import { apiClient } from "./client";

export const COMPANY_PREP_ROLES: CompanyPrepRole[] = [
  "Software Engineer",
  "Frontend",
  "Backend",
  "Full Stack",
  "AI",
  "DevOps",
  "Data"
];

export async function getCompanyTypes(role?: CompanyPrepRole): Promise<CompanyTypeCard[]> {
  const response = await apiClient.get<{ companyTypes: CompanyTypeCard[] }>("/company-prep/companies", {
    params: role ? { role } : undefined
  });
  return response.data.companyTypes;
}

export async function getCompanyTypeDetail(
  companyTypeId: string,
  role?: CompanyPrepRole
): Promise<CompanyTypeDetail> {
  const response = await apiClient.get<{ companyType: CompanyTypeDetail }>(
    `/company-prep/companies/${companyTypeId}`,
    { params: role ? { role } : undefined }
  );
  return response.data.companyType;
}

export async function getPrepQuestions(query: CompanyPrepQuestionQuery): Promise<PrepQuestion[]> {
  const response = await apiClient.get<{ questions: PrepQuestion[] }>("/company-prep/questions", {
    params: query
  });
  return response.data.questions;
}

export async function updatePrepQuestionStatus(
  questionId: string,
  status: CompanyPrepQuestionStatus
): Promise<PrepQuestion> {
  const response = await apiClient.patch<{ question: PrepQuestion }>(
    `/company-prep/questions/${questionId}/status`,
    { status }
  );
  return response.data.question;
}

export async function savePrepQuestionToNotes(questionId: string): Promise<{ noteId: string; created: boolean }> {
  const response = await apiClient.post<{ noteId: string; created: boolean }>(
    `/company-prep/questions/${questionId}/save-note`
  );
  return response.data;
}

export async function startCompanyPrep(
  companyTypeId: string,
  data: { role: CompanyPrepRole; targetDate?: string }
): Promise<CompanyPrepPlan> {
  const response = await apiClient.post<{ prepPlan: CompanyPrepPlan }>(
    `/company-prep/companies/${companyTypeId}/start-prep`,
    data
  );
  return response.data.prepPlan;
}
