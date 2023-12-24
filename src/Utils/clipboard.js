export function copyToClipboard(text) {
  var textField = document.createElement('textarea');
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
}

export function copyToLocation({altitude = null, latitude = null, longitude = null}) {
  var textField = document.createElement('textarea');
  textField.innerText = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
}

// Convert text to Capitalize
export function toCapitalize(text) {
  if(!text) return;

  return text.split("").map((l, i) => {
    if(i!==0) {
      return l.toLowerCase();
    } else {
      return l.toUpperCase()
    }
  }).join("");
}
