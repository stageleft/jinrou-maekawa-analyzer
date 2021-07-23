// onLogLoad
function handleResponse(message){
  // nop.
}
function handleError(error){
  // nop.
}
function onLogLoad(event) {
  var send_body   = JSON.stringify(document.body.innerHTML);
  var send_object = browser.runtime.sendMessage({ html_log: JSON.parse(send_body) });
  send_object.then(handleResponse, handleError);
}
setInterval(onLogLoad, 300);
