export interface AutohideSnackbarState {
  message?: string | null
  notiColor: string
}

export const initialSnackbar: AutohideSnackbarState = { 
  message: "",
  notiColor: "error",
}
