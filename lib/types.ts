export interface ReportData {
  business_name: string;
  overall_grade: string;
  gbp_grade: string;
  reviews_grade: string;
  citations_grade: string;
  website_grade: string;
  ai_grade: string;
  narrative: string;
  action_1: string;
  action_2: string;
  action_3: string;
  created_at: string;
  business_type?: string;
  city_state?: string;
}

export interface AIQueryResult {
  query: string;
  response: string;
  mentioned: boolean;
  error?: string;
}
