import { axiosInstance } from "@/lib/axios.instance";
import { SignInFormData } from "../schema/sign-in.schema";
import { API_ROUTES } from "@orbit/contracts";
import { SignInResponse } from "./types";
import axios from "axios";

export const signInApi = async (
  data: SignInFormData,
): Promise<SignInResponse> => {
  try {
    const response = await axiosInstance.post<SignInResponse>(
      API_ROUTES.AUTH.SIGN_IN,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) return error.response?.data;
    else throw error;
  }
};
