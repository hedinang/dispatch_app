export function placeholder(objStyle) {
  return({
    "&::-webkit-input-placeholder": {...objStyle},
    "&:-ms-input-placeholder": {...objStyle},
    "&::placeholder": {...objStyle},
  })
}