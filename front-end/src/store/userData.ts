import { create } from "zustand";

type IUser = {
  balance: { USD : {qty: number} };
  username: string;
  auth_token: string;
};

interface IUserStore {
  user: IUser | null;
  updateUserSession: (userDetails: IUser | null) => void;
}

export const useUserSession = create<IUserStore>((set) => ({
  // initialize empty user (assert type)
  user: null as IUser,

  updateUserSession: (userData: IUser | null) => {
    if (userData === null) {
      set((state) => ({
        user: null
      }));
    } else {
      set((state) => ({
        user: {
          ...state.user,
          ...userData,
        },
      }));
    }
  },
}));