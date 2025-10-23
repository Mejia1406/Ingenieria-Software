import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ForumUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  userType?: string;
}

export interface ForumAnswer {
  content: string;
  author?: ForumUser;
  createdAt: string;
}

export interface ForumQuestion {
  _id: string;
  content: string;
  author?: ForumUser;
  createdAt: string;
  answers: ForumAnswer[];
}

export async function getForumQuestions() {
  const res = await axios.get(`${API_URL}/forum`);
  return res.data.data as ForumQuestion[];
}

export async function postForumQuestion(content: string, author: string) {
  const res = await axios.post(`${API_URL}/forum`, { content, author }, { headers: authHeaders() });
  return res.data.data as ForumQuestion;
}

export async function postForumAnswer(questionId: string, content: string) {
  const res = await axios.post(`${API_URL}/forum/${questionId}/answer`, { content }, { headers: authHeaders() });
  return res.data.data as ForumQuestion;
}
