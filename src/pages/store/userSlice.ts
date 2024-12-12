// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  nickname: string;
  role: string;
  nicknameColor?: string;
}

const initialState: UserState = {
  nickname: '',
  role: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.nickname = action.payload.nickname;
      state.role = action.payload.role;
      state.nicknameColor = action.payload.nicknameColor;
    },
    clearUser(state) {
      state.nickname = '';
      state.role = '';
      state.nicknameColor = undefined;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
