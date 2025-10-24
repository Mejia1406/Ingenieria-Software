import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ingenieria-software-production.up.railway.app/api';

export interface ReplyResponse {
  success: boolean;
  message: string;
  data?: { review: any };
  error?: string;
}

export async function replyToReview(reviewId: string, content: string, token: string): Promise<ReplyResponse> {
  const res = await axios.post(`${API_URL}/reviews/${reviewId}/reply`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
