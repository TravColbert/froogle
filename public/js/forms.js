function setRequiredFields () {
  document.querySelectorAll("form:not(.disabled) div.required > input, form:not(.disabled) div.required > textarea, form:not(.disabled) div.required > select")
  .forEach(element => {
    element.required = true
    // Let's do something if the inputs 'invalid' trigger gets fired...
    element.addEventListener("invalid", event => {
      element.classList.remove("valid")
      element.classList.add("invalid")
    }, false)
    element.addEventListener("blur", function() {
      if(element.checkValidity()) {
        element.classList.remove("invalid")
        element.classList.add("valid")
      }
    }, false)
  })
}

function disableForms () {
  document.querySelectorAll("form.disabled input, form.disabled textarea, form.disabled select")
  .forEach(element => {
    element.disabled = true
  }, false)
}

function ready (fn) {
  if (document.readyState != 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

ready(() => {
  setRequiredFields()
  disableForms()
})
