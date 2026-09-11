import { httpClient } from "@/app/axios/http-client";
import type { GetCurrentUserData, User } from "../../store/user.types";
import { API_ROUTES } from "@orbit/contracts";

export async function getCurrentUserApi(): Promise<User> {
  const response = await httpClient.get<GetCurrentUserData>(
    API_ROUTES.USERS.ME,
  );
  return response.data.user;
}
