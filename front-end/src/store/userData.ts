import { IPositionOrder } from "@/types";
import { create } from "zustand";

type IUser = {
  balance: { USD : {qty: number} };
  username: string;
  auth_token: string;
};

interface IUserStore {
  user: IUser | null;
  userPositions: IPositionOrder[],
  updateUserSession: (userDetails: IUser | null) => void;
  updateCurrentUserBalance: (newBalance: number) => void;
  updateCurrentUserPositions: (userPositions: IPositionOrder[]) => void;
}

export const useUserSession = create<IUserStore>((set) => ({
  // initialize empty user (assert type)
  user: null as IUser,

  userPositions: [],

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

  updateCurrentUserBalance: ( newBalance :number ) => {
    set((state) => ({
        user: {
          ...state.user,
          balance : {USD : {qty : newBalance}}
        },
      }));
  },

  updateCurrentUserPositions: ( userPositions : IPositionOrder[]) => { 
    set(() => ({
      userPositions: userPositions
    }));
  }
}));