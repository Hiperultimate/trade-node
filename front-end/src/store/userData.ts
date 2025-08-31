import { create } from "zustand";
import { IQuotes } from "@/types";


type IUser = {
  balance: { qty: number };
  username: string;
  auth_token: string;
};

interface IUserStore {
  user: IUser;
  updateUserSession: (userDetails: IUser) => void;
}

export const useUserSession = create<IUserStore>((set) => ({
  // initialize empty user (assert type)
  user: {} as IUser,

  updateUserSession: (userData: Partial<IUser>) => {
    set((state) => ({
      user: {
        ...state.user,
        ...userData,
      },
    }));
  },
}));