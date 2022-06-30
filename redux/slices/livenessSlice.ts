import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ImageProp {
    value: any
    step: string
    action?: string
}

interface ILivenessState {
    images: ImageProp[]
    isDone: boolean
    actionList: string[]
}

const initialState: ILivenessState = {
    images: [],
    isDone: false,
    actionList: []
}

const livenessSlice = createSlice({
    name: 'liveness',
    initialState,
    reducers: {
        setImages: (state, action: PayloadAction<ImageProp>) => {
            state.images = [...state.images, action.payload]
        },
        resetImages: (state) => {
            state.images = []
        },
        setIsDone: (state, action: PayloadAction<boolean>) => {
            state.isDone = action.payload
        },
        setActionList: (state, action: PayloadAction<string[]>) => {
            state.actionList = action.payload
        }
    }
})

export const { setImages, setIsDone, setActionList, resetImages } = livenessSlice.actions 

export default livenessSlice.reducer