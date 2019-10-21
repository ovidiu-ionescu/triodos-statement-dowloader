const requests = {};

//document.querySelector("a[title='Print afschrift']").parentNode.nextSibling.firstChild.textContent;
function collectLinks() {
  document.querySelectorAll("a[title='Print afschrift']")
    .map(a => ({ id: a.id, date: a.parentNode.nextSibling.firstChild.textContent }))
}


function logURL(req) {
  console.log("Loading: ", {requestDetails: req});
  if(req.method === 'POST' && req.type === 'main_frame') {
    const bodyString = new URLSearchParams(req.requestBody.formData).toString();

    let prefix = req.requestBody.formData.baProductStatementID[0].substring(0, 8);

    requests['id' + req.requestId] = {
      filename: `Statements/statement_${req.requestId}.pdf`,
      method: "POST",
      saveAs: false,
      url: req.url,
      body: bodyString
    };
  }
}

function askForNextDownload(tabs) {
  browser.tabs.sendMessage(tabs[0].id,
    {
      command: "next"
    }
  );
}

function handleChanged(delta) {
  if (delta.state && delta.state.current === "complete") {
    console.log(`Download ${delta.id} has completed.`);
    browser.tabs.query({active: true, currentWindow: true})
    .then(askForNextDownload);
  }
}

browser.downloads.onChanged.addListener(handleChanged);

function monitorDownload(id) {
 console.log('Download started', id);
}

function logHeaders(req) {
  console.log('Headers', req);
  if(req.method === 'POST' && req.type === 'main_frame') {
    myReq = requests['id' + req.requestId];
    if(!myReq) {
      console.log("Can't find the request body");
      return;
    }
    const cookie = req.requestHeaders.find(h => h.name === 'Cookie');
    console.log({cookie});
    const contentType = {name: 'Content-Type', value: 'application/x-www-form-urlencoded' }
    myReq.headers = [ contentType ];
    //console.log("body string", myReq.body);
    browser.downloads.download(myReq).then(monitorDownload);

    return { cancel: true }
  }

}

function logReceived(res) {
  console.log("Received", res);
}

console.log('Registering the listener');
browser.webRequest.onBeforeRequest.addListener(
  logURL,
  {urls: ["https://bankieren.triodos.nl/ib-seam/pages/accountinformation/statement/statementoverview.seam"]},
  ["blocking", "requestBody"]
);

browser.webRequest.onBeforeSendHeaders.addListener(
  logHeaders,
  {urls: ["https://bankieren.triodos.nl/ib-seam/pages/accountinformation/statement/statementoverview.seam"]},
  ["blocking", "requestHeaders"]
);

// browser.webRequest.onHeadersReceived.addListener(
//   logReceived,
//   {urls: ["<all_urls>"]},
//   ["responseHeaders"]
// );

function downloadDone(res) {
  console.log('Done downloading', res);
}

browser.webRequest.onCompleted.addListener(
  downloadDone,
  {urls: ["https://bankieren.triodos.nl/ib-seam/pages/accountinformation/statement/statementoverview.seam"]},
);