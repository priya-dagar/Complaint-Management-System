import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  analyzeComplaint,
  analyzeComplaintFile,
  fetchComplaints,
  fetchComplaintById,
  updateComplaintStatus,
} from "../api/complaintApi";

export const submitComplaintForAnalysis = createAsyncThunk(
  "complaint/analyze",
  async (rawText, { rejectWithValue }) => {
    try {
      return await analyzeComplaint(rawText);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const submitComplaintFile = createAsyncThunk(
  "complaint/analyzeFile",
  async (file, { rejectWithValue }) => {
    try {
      return await analyzeComplaintFile(file);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const loadComplaintList = createAsyncThunk(
  "complaint/list",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchComplaints();
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const loadComplaintDetail = createAsyncThunk(
  "complaint/detail",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchComplaintById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const saveComplaintStatus = createAsyncThunk(
  "complaint/saveStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await updateComplaintStatus(id, status);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

const initialState = {
  current: null,
  analyzeStatus: "idle", // idle | loading | succeeded | failed
  analyzeError: null,

  saveStatus: "idle",

  list: [],
  listStatus: "idle",
  listError: null,
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    resetForm(state) {
      state.current = null;
      state.analyzeStatus = "idle";
      state.analyzeError = null;
      state.saveStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitComplaintForAnalysis.pending, (state) => {
        state.analyzeStatus = "loading";
        state.analyzeError = null;
      })
      .addCase(submitComplaintForAnalysis.fulfilled, (state, action) => {
        state.analyzeStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(submitComplaintForAnalysis.rejected, (state, action) => {
        state.analyzeStatus = "failed";
        state.analyzeError = action.payload;
      })
      .addCase(submitComplaintFile.pending, (state) => {
        state.analyzeStatus = "loading";
        state.analyzeError = null;
      })
      .addCase(submitComplaintFile.fulfilled, (state, action) => {
        state.analyzeStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(submitComplaintFile.rejected, (state, action) => {
        state.analyzeStatus = "failed";
        state.analyzeError = action.payload;
      })
      .addCase(loadComplaintList.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(loadComplaintList.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.list = action.payload;
      })
      .addCase(loadComplaintList.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })
      .addCase(loadComplaintDetail.pending, (state) => {
        state.analyzeStatus = "loading";
        state.analyzeError = null;
      })
      .addCase(loadComplaintDetail.fulfilled, (state, action) => {
        state.analyzeStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(loadComplaintDetail.rejected, (state, action) => {
        state.analyzeStatus = "failed";
        state.analyzeError = action.payload;
      })
      .addCase(saveComplaintStatus.pending, (state) => {
        state.saveStatus = "loading";
      })
      .addCase(saveComplaintStatus.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(saveComplaintStatus.rejected, (state) => {
        state.saveStatus = "failed";
      });
  },
});

export const { resetForm } = complaintSlice.actions;
export default complaintSlice.reducer;